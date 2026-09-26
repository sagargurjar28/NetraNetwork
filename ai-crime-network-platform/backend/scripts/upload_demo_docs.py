"""Upload the three demo FIR files to the backend."""
import requests
from pathlib import Path

BASE = "http://localhost:8000/api"
CASE_ID = "11111111-1111-1111-1111-111111111111"
DOCS_DIR = Path(__file__).resolve().parent.parent / "demo_documents"


def main():
    r = requests.post(f"{BASE}/auth/login",
                      json={"username": "admin", "password": "admin123"})
    r.raise_for_status()
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    for f in sorted(DOCS_DIR.glob("*.txt")):
        with open(f, "rb") as fh:
            resp = requests.post(
                f"{BASE}/cases/{CASE_ID}/documents/",
                headers=headers,
                files={"file": (f.name, fh, "text/plain")},
                timeout=60,
            )
        if resp.status_code == 201:
            data = resp.json()
            ipfs = data.get("ipfs_cid") or "(none)"
            tx = data.get("tx_hash") or "(none)"
            print(f"[OK] {f.name}")
            print(f"     ipfs={ipfs}")
            print(f"     tx={tx[:20]}...")
        else:
            print(f"[FAIL] {f.name}: {resp.status_code}")
            print(f"       {resp.text[:200]}")


if __name__ == "__main__":
    main()
