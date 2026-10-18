"""Isolated filesystem checks. Does not modify the current desktop."""
import configparser
import contextlib
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest import mock

spec = importlib.util.spec_from_file_location("luma_setup", Path(__file__).with_name("setup.py"))
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)


class InstallationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="luma test ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "data directory"
        self.output = contextlib.redirect_stdout(io.StringIO())
        self.output.__enter__()
        self.addCleanup(self.output.__exit__, None, None, None)

    def test_fresh_install_uninstall(self):
        setup.install(self.root)
        for src, dest in setup.FILES.items():
            self.assertEqual((self.root / dest).read_bytes(), (setup.HERE / src).read_bytes())
        self.assertEqual(setup.uninstall(self.root), 0)
        for dest in setup.FILES.values():
            self.assertFalse((self.root / dest).exists())
        self.assertEqual(setup.uninstall(self.root), 0)

    def test_collision_backed_up_and_restored(self):
        target = self.root / "color-schemes/Luma.colors"
        setup.write_new(target, b"existing user scheme")
        setup.install(self.root)
        with self.assertRaises(ValueError):
            setup.install(self.root)
        self.assertEqual(setup.uninstall(self.root), 0)
        self.assertEqual(target.read_bytes(), b"existing user scheme")

    def test_modified_asset_preserved_then_retry(self):
        target = self.root / "color-schemes/Luma.colors"
        setup.write_new(target, b"original")
        setup.install(self.root)
        target.write_bytes(b"my edit")
        self.assertEqual(setup.uninstall(self.root), 2)
        self.assertEqual(target.read_bytes(), b"my edit")
        target.unlink()  # User saved their edit elsewhere and removed the conflict.
        self.assertEqual(setup.uninstall(self.root), 0)
        self.assertEqual(target.read_bytes(), b"original")

    def test_corrupt_backup_preserves_current_asset(self):
        target = self.root / "color-schemes/Luma.colors"
        setup.write_new(target, b"original")
        setup.install(self.root)
        backup = next((self.root / "luma-starter-kit/backups").iterdir())
        backup.write_bytes(b"corrupt")
        self.assertEqual(setup.uninstall(self.root), 2)
        self.assertEqual(target.read_bytes(), (setup.HERE / "Luma.colors").read_bytes())

    def test_interrupted_second_restore_can_retry(self):
        targets = [self.root / dest for dest in setup.FILES.values()]
        for index, target in enumerate(targets):
            setup.write_new(target, ("original " + str(index)).encode())
        setup.install(self.root)
        original_unlink = Path.unlink

        def interrupted_unlink(path, *args, **kwargs):
            if path == targets[1]:
                raise PermissionError("simulated second target failure")
            return original_unlink(path, *args, **kwargs)

        with mock.patch.object(Path, "unlink", interrupted_unlink):
            with self.assertRaises(PermissionError):
                setup.uninstall(self.root)
        state = setup.json.loads((self.root / "luma-starter-kit/state.json").read_text())
        self.assertEqual([entry["target"] for entry in state["files"]], [list(setup.FILES.values())[1]])
        self.assertEqual(targets[0].read_bytes(), b"original 0")
        self.assertEqual(setup.uninstall(self.root), 0)
        for index, target in enumerate(targets):
            self.assertEqual(target.read_bytes(), ("original " + str(index)).encode())
        setup.install(self.root)
        self.assertEqual(setup.uninstall(self.root), 0)

    def test_restored_original_recognized_after_journal_failure(self):
        target = self.root / "color-schemes/Luma.colors"
        setup.write_new(target, b"original")
        setup.install(self.root)
        with mock.patch.object(setup, "save_state", side_effect=PermissionError("simulated journal failure")):
            with self.assertRaises(PermissionError):
                setup.uninstall(self.root)
        self.assertEqual(target.read_bytes(), b"original")
        backups = list((self.root / "luma-starter-kit/backups").iterdir())
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_bytes(), b"original")
        self.assertEqual(setup.uninstall(self.root), 0)
        self.assertEqual(target.read_bytes(), b"original")
        self.assertFalse(backups[0].exists())

    def test_source_checksum_failure_no_destination_changes(self):
        with mock.patch.object(setup, "digest", return_value="invalid"):
            with self.assertRaises(ValueError):
                setup.install(self.root)
        self.assertFalse(self.root.exists())

    def test_traversal_rejected(self):
        with self.assertRaises(ValueError):
            setup.checked(self.root, "../outside")

    def test_lock_blocks_install_and_uninstall(self):
        setup.install(self.root)
        lock = self.root / "luma-starter-kit/install.lock"
        lock.write_bytes(b"another process")
        with self.assertRaises(FileExistsError):
            setup.uninstall(self.root)
        lock.unlink()
        self.assertEqual(setup.uninstall(self.root), 0)
        lock.write_bytes(b"another process")
        with self.assertRaises(FileExistsError):
            setup.install(self.root)

    def test_non_linux_default_refused(self):
        with mock.patch.object(setup.sys, "platform", "win32"), mock.patch.object(setup.sys, "argv", ["setup.py", "install"]), contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as error:
                setup.main()
        self.assertEqual(error.exception.code, 2)

    def test_symlink_rejected(self):
        self.root.mkdir()
        outside = Path(self.temp.name) / "outside"
        outside.mkdir()
        link = self.root / "color-schemes"
        try:
            link.symlink_to(outside, target_is_directory=True)
        except OSError:
            self.skipTest("OS does not allow creating symlinks")
        with self.assertRaises(ValueError):
            setup.install(self.root)
        self.assertEqual(list(outside.iterdir()), [])

    def test_color_scheme_rgb_values(self):
        parser = configparser.ConfigParser()
        parser.read(setup.HERE / "Luma.colors", encoding="utf-8")
        for group in ("Window", "View", "Button", "Selection", "Tooltip", "Complementary", "Header"):
            values = parser["Colors:" + group]
            self.assertEqual(len(values), 12)
            for value in values.values():
                rgb = [int(part) for part in value.split(",")]
                self.assertEqual(len(rgb), 3)
                self.assertTrue(all(0 <= number <= 255 for number in rgb))


if __name__ == "__main__":
    unittest.main()
