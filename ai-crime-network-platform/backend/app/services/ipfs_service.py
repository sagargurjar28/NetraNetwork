"""IPFS upload via Pinata HTTP API."""
from typing import Optional
import requests
from app.core.config import settings


def upload_to_ipfs(content: bytes, filename: str) -> Optional[str]:
    """Pin content to IPFS via Pinata. Returns CID or None.
    Never raises — returns None if Pinata is unreachable or misconfigured."""
    if not settings.PINATA_API_KEY or not settings.PINATA_API_SECRET:
        return None
    try:
        resp = requests.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            files={"file": (filename, content)},
            headers={
                "pinata_api_key": settings.PINATA_API_KEY,
                "pinata_secret_api_key": settings.PINATA_API_SECRET,
            },
            timeout=30,
        )
        if resp.status_code != 200:
            return None
        return resp.json().get("IpfsHash")
    except Exception:
        return None