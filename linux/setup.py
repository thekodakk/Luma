#!/usr/bin/env python3
"""Install Luma assets only; never apply desktop settings. Python 3.8+."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import uuid

HERE = Path(__file__).resolve().parent
FILES = {
    "Luma.colors": "color-schemes/Luma.colors",
    "luma-purple.svg": "wallpapers/Luma/luma-purple.svg",
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def checked(root, relative):
    rel = Path(relative)
    if rel.is_absolute() or ".." in rel.parts:
        raise ValueError("Güvensiz dosya yolu: " + str(relative))
    path = root / rel
    for candidate in (path, *path.parents):
        if candidate.is_symlink():
            raise ValueError("Sembolik bağlantıya yazılmaz: " + str(candidate))
    return path


def write_new(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as stream:
        stream.write(data)


def save_state(path, state):
    temp = path.with_name("state-" + uuid.uuid4().hex + ".tmp")
    write_new(temp, json.dumps(state, indent=2).encode("utf-8"))
    os.replace(temp, path)


def install(root):
    state_path = checked(root, "luma-starter-kit/state.json")
    if state_path.exists():
        raise ValueError("Kurulum kaydı mevcut; önce uninstall çalıştırın.")
    # Read and validate ALL source assets before changing any destination.
    manifest = json.loads((HERE / "checksums.json").read_text(encoding="utf-8"))
    sources = {}
    for source, destination in FILES.items():
        source_path = checked(HERE, source)
        data = source_path.read_bytes()
        if digest(data) != manifest[source]:
            raise ValueError("Kaynak sağlama toplamı uyuşmuyor: " + source)
        target = checked(root, destination)
        if target.exists() and not target.is_file():
            raise ValueError("Hedef normal dosya değil: " + str(target))
        sources[destination] = data
    state = {"version": 1, "files": []}
    # Exclusive lock also protects the small window before state is created.
    lock = checked(root, "luma-starter-kit/install.lock")
    write_new(lock, b"Luma install in progress\n")
    try:
        if state_path.exists():
            raise ValueError("Kurulum kaydı mevcut; önce uninstall çalıştırın.")
        for destination, data in sources.items():
            target = checked(root, destination)
            entry = {"target": destination, "sha256": digest(data), "backup": None}
            if target.exists():
                backup_rel = "luma-starter-kit/backups/" + uuid.uuid4().hex
                backup = checked(root, backup_rel)
                original = target.read_bytes()
                write_new(backup, original)
                entry.update(backup=backup_rel, backup_sha256=digest(original))
                # Journal before modifying a pre-existing file.
                state["files"].append(entry)
                save_state(state_path, state)
                if target.read_bytes() != original:
                    raise ValueError("Hedef kurulum sırasında değişti: " + str(target))
                target.unlink()
                print("Yedeklendi:", target)
            else:
                state["files"].append(entry)
                save_state(state_path, state)
            write_new(target, data)
            print("Kuruldu:", target)
        print("Masaüstü ayarları değiştirilmedi. README.md içindeki seçim adımlarını izleyin.")
    except Exception:
        print("Kurulum tamamlanamadı. Kaydedilen değişiklikleri geri almak için uninstall çalıştırın.", file=sys.stderr)
        raise
    finally:
        lock.unlink()


def uninstall(root):
    state_path = checked(root, "luma-starter-kit/state.json")
    if not state_path.exists():
        print("Kaldırılacak kayıtlı Luma kurulumu yok.")
        return 0
    lock = checked(root, "luma-starter-kit/install.lock")
    write_new(lock, b"Luma uninstall in progress\n")
    try:
        return _uninstall(root)
    finally:
        lock.unlink()


def _uninstall(root):
    state_path = checked(root, "luma-starter-kit/state.json")
    if not state_path.exists():
        print("Kaldırılacak kayıtlı Luma kurulumu yok.")
        return 0
    state = json.loads(state_path.read_text(encoding="utf-8"))
    if state.get("version") != 1 or not isinstance(state.get("files"), list):
        raise ValueError("Bilinmeyen kurulum kaydı.")
    allowed = set(FILES.values())
    for entry in list(state["files"]):
        if entry["target"] not in allowed:
            raise ValueError("Kurulum kaydında beklenmeyen hedef.")
        target = checked(root, entry["target"])
        backup = None
        already_restored = False
        if entry.get("backup"):
            if not entry["backup"].startswith("luma-starter-kit/backups/"):
                raise ValueError("Beklenmeyen yedek yolu.")
            backup = checked(root, entry["backup"])
            # A previous attempt may have restored the original but failed to
            # commit its progress. Recognize that state without touching it.
            already_restored = target.is_file() and digest(target.read_bytes()) == entry["backup_sha256"]
            if not already_restored and (not backup.is_file() or digest(backup.read_bytes()) != entry["backup_sha256"]):
                print("Yedek eksik/değişmiş; korunuyor:", target)
                continue
        if target.exists() and not already_restored:
            if not target.is_file() or digest(target.read_bytes()) != entry["sha256"]:
                print("Kurulumdan sonra değişmiş; korunuyor:", target)
                continue
            target.unlink()
        if backup:
            if not already_restored:
                write_new(target, backup.read_bytes())
            print("Yedek geri yüklendi:", target)
        else:
            print("Kaldırıldı:", target)
        # Commit each completed entry BEFORE deleting its recovery copy, so a
        # failure on a later entry never leaves stale references to lost backups.
        state["files"].remove(entry)
        save_state(state_path, state)
        if backup and backup.is_file() and digest(backup.read_bytes()) == entry["backup_sha256"]:
            backup.unlink()
    if state["files"]:
        print("Değişmiş dosyalar ve gerekli yedekler korundu; README.md sorun giderme bölümüne bakın.")
        return 2
    state_path.unlink()
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["install", "uninstall"])
    parser.add_argument("--data-dir", type=Path, help="Yalıtılmış test için veri dizini; Linux varsayılanı XDG_DATA_HOME.")
    args = parser.parse_args()
    if args.data_dir is None and not sys.platform.startswith("linux"):
        parser.error("Gerçek kurulum yalnızca Linux'ta yapılır. Yalıtılmış test için --data-dir kullanın.")
    root = args.data_dir or Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local/share")
    root = root.expanduser().absolute()
    try:
        return install(root) if args.action == "install" else uninstall(root)
    except (OSError, ValueError, KeyError) as error:
        print("Hata:", error, file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
