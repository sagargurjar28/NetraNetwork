import json
from typing import Optional

import requests

from app.core.config import settings


def upload_to_ipfs(content: bytes, filename: str) -> Optional[str]:
    """
    Pin content to IPFS, return the CID. Returns None on any failure.
    Never raises — IPFS downtime must not break document uploads.
    """
    try:
        resp: requests.Response = requests.post(
            f"{settings.IPFS_API}/api/v0/add",
            files={"file": (filename, content)},
            params={"pin": "true"},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        last: str = resp.text.strip().splitlines()[-1]
        return json.loads(last).get("Hash")
    except Exception:
        return None
