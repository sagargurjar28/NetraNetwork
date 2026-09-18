"""
End-to-end test: wipe board, add pins/connections via API, run suggest-links.
Run from backend/ with: python -m scripts.e2e_test
"""
import json
import uuid
import requests

BASE = "http://localhost:8000"
CASE_ID  = "11111111-1111-1111-1111-111111111111"
BOARD_ID = "22222222-2222-2222-2222-222222222222"

# Generate a dev JWT matching your security.py
from jose import jwt
from app.core.config import settings
from datetime import datetime, timedelta, timezone

token = jwt.encode(
    {
        "sub": str(uuid.uuid4()),
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    },
    settings.SECRET_KEY,
    algorithm=settings.ALGORITHM,
)
HEADERS = {"Authorization": f"Bearer {token}"}


def check(resp, label):
    if resp.status_code >= 400:
        print(f"❌ {label} failed: {resp.status_code}")
        print(resp.text)
        raise SystemExit(1)
    print(f"✅ {label}: {resp.status_code}")
    return resp.json() if resp.text else None


# 1. Get current board state
print("\n── Current board state ──")
board = check(requests.get(f"{BASE}/boards/{BOARD_ID}/", headers=HEADERS), "GET board")
print(f"   pins: {len(board.get('pins', []))}, connections: {len(board.get('connections', []))}")

# 2. Delete every existing pin (cascades connections)
print("\n── Wiping existing pins ──")
for pin in board.get("pins", []):
    check(
        requests.delete(f"{BASE}/boards/{BOARD_ID}/pins/{pin['id']}/", headers=HEADERS),
        f"DELETE pin {pin['label']}",
    )

# 3. Create three pins via API (this fires the Neo4j sync)
print("\n── Creating pins ──")
ravi = check(
    requests.post(
        f"{BASE}/boards/{BOARD_ID}/pins/",
        headers=HEADERS,
        json={"entity_type": "person", "label": "Ravi Kumar",
              "position_x": 100, "position_y": 100},
    ),
    "CREATE Ravi",
)
suresh = check(
    requests.post(
        f"{BASE}/boards/{BOARD_ID}/pins/",
        headers=HEADERS,
        json={"entity_type": "person", "label": "Suresh Nair",
              "position_x": 400, "position_y": 100},
    ),
    "CREATE Suresh",
)
phone = check(
    requests.post(
        f"{BASE}/boards/{BOARD_ID}/pins/",
        headers=HEADERS,
        json={"entity_type": "phone", "label": "+91-98xxxx1111",
              "position_x": 250, "position_y": 300},
    ),
    "CREATE Phone",
)

print(f"   RAVI_ID   = {ravi['id']}")
print(f"   SURESH_ID = {suresh['id']}")
print(f"   PHONE_ID  = {phone['id']}")

# 4. Create two connections (Ravi→Phone, Suresh→Phone)
print("\n── Creating connections ──")
check(
    requests.post(
        f"{BASE}/boards/{BOARD_ID}/connections/",
        headers=HEADERS,
        json={"source_pin_id": ravi["id"], "target_pin_id": phone["id"],
              "label": "Called", "confidence": 0.9},
    ),
    "CONNECT Ravi→Phone",
)
check(
    requests.post(
        f"{BASE}/boards/{BOARD_ID}/connections/",
        headers=HEADERS,
        json={"source_pin_id": suresh["id"], "target_pin_id": phone["id"],
              "label": "Called", "confidence": 0.9},
    ),
    "CONNECT Suresh→Phone",
)

# 5. Run suggest-links
print("\n── Suggest links ──")
result = check(
    requests.post(
        f"{BASE}/ai/suggest-links",
        headers=HEADERS,
        json={"board_id": BOARD_ID},
    ),
    "POST suggest-links",
)

print("\n── Result ──")
print(json.dumps(result, indent=2))

if result.get("suggestions"):
    print("\n🎉 SUCCESS — Phases 3, 4, 5 verified end-to-end.")
else:
    print("\n⚠️  No suggestions returned. Check Neo4j Browser:")
    print("   MATCH (n)-[r]->(m) RETURN n.label, type(r), m.label;")