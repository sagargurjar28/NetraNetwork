"""
End-to-end test: login, list cases, wipe board, add pins/connections, run suggest-links.
Run from backend/ with: python -m scripts.e2e_test
"""
import json
from typing import Any

import requests

BASE: str = "http://localhost:8000"
BOARD_ID: str = "22222222-2222-2222-2222-222222222222"


def check(resp: requests.Response, label: str) -> Any:
    if resp.status_code >= 400:
        print(f"❌ {label} failed: {resp.status_code}")
        print(resp.text)
        raise SystemExit(1)
    print(f"✅ {label}: {resp.status_code}")
    return resp.json() if resp.text else None


login_resp: requests.Response = requests.post(
    f"{BASE}/api/auth/login",
    json={"username": "admin", "password": "admin123"},
)
login_data: Any = check(login_resp, "POST login")
access_token: str = login_data["access_token"]
HEADERS: dict[str, str] = {"Authorization": f"Bearer {access_token}"}

print("\n── Listing cases ──")
cases: Any = check(requests.get(f"{BASE}/api/cases/", headers=HEADERS), "GET cases")
print(f"   cases: {len(cases) if isinstance(cases, list) else 0}")

print("\n── Current board state ──")
board: Any = check(
    requests.get(f"{BASE}/api/boards/{BOARD_ID}/", headers=HEADERS), "GET board"
)
pins: list[dict[str, Any]] = board.get("pins", [])
print(f"   pins: {len(pins)}, connections: {len(board.get('connections', []))}")

print("\n── Wiping existing pins ──")
for pin in pins:
    check(
        requests.delete(
            f"{BASE}/api/boards/{BOARD_ID}/pins/{pin['id']}/", headers=HEADERS
        ),
        f"DELETE pin {pin['label']}",
    )

print("\n── Creating pins ──")
ravi: Any = check(
    requests.post(
        f"{BASE}/api/boards/{BOARD_ID}/pins/",
        headers=HEADERS,
        json={"entity_type": "person", "label": "Ravi Kumar",
              "position_x": 100, "position_y": 100},
    ),
    "CREATE Ravi",
)
suresh: Any = check(
    requests.post(
        f"{BASE}/api/boards/{BOARD_ID}/pins/",
        headers=HEADERS,
        json={"entity_type": "person", "label": "Suresh Nair",
              "position_x": 400, "position_y": 100},
    ),
    "CREATE Suresh",
)
phone: Any = check(
    requests.post(
        f"{BASE}/api/boards/{BOARD_ID}/pins/",
        headers=HEADERS,
        json={"entity_type": "phone", "label": "+91-98xxxx1111",
              "position_x": 250, "position_y": 300},
    ),
    "CREATE Phone",
)

print(f"   RAVI_ID   = {ravi['id']}")
print(f"   SURESH_ID = {suresh['id']}")
print(f"   PHONE_ID  = {phone['id']}")

print("\n── Creating connections ──")
check(
    requests.post(
        f"{BASE}/api/boards/{BOARD_ID}/connections/",
        headers=HEADERS,
        json={"source_pin_id": ravi["id"], "target_pin_id": phone["id"],
              "label": "Called", "confidence": 0.9},
    ),
    "CONNECT Ravi→Phone",
)
check(
    requests.post(
        f"{BASE}/api/boards/{BOARD_ID}/connections/",
        headers=HEADERS,
        json={"source_pin_id": suresh["id"], "target_pin_id": phone["id"],
              "label": "Called", "confidence": 0.9},
    ),
    "CONNECT Suresh→Phone",
)

print("\n── Suggest links ──")
result: Any = check(
    requests.post(
        f"{BASE}/api/ai/suggest-links",
        headers=HEADERS,
        json={"board_id": BOARD_ID},
    ),
    "POST suggest-links",
)

print("\n── Result ──")
print(json.dumps(result, indent=2))

if result.get("suggestions"):
    print("\n🎉 SUCCESS — suggestions returned.")
else:
    print("\n⚠️  No suggestions returned. Check Neo4j Browser:")
    print("   MATCH (n)-[r]->(m) RETURN n.label, type(r), m.label;")
