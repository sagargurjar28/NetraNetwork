import json
from pathlib import Path
from typing import Any, Optional

from eth_account import Account
from web3 import Web3

from app.core.config import settings

_w3: Optional[Web3] = None
_contract: Any = None


def _get_w3() -> Web3:
    global _w3
    if _w3 is None:
        _w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER))
    return _w3


def _get_contract() -> Any:
    global _contract
    if _contract is None:
        abi_path: Path = Path(settings.CONTRACT_ABI_PATH).resolve()
        with open(abi_path) as f:
            abi: Any = json.load(f)["abi"]
        _contract = _get_w3().eth.contract(
            address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
            abi=abi,
        )
    return _contract


def anchor_hash(doc_hash: str, ipfs_cid: str) -> Optional[str]:
    """
    Anchor doc_hash on chain. Returns tx hash hex or None.
    Never raises.
    """
    try:
        w3: Web3 = _get_w3()
        contract: Any = _get_contract()
        acct: Any = Account.from_key(settings.PRIVATE_KEY)

        hash_bytes: bytes = Web3.to_bytes(hexstr=doc_hash)
        tx: Any = contract.functions.anchor(hash_bytes, ipfs_cid or "").build_transaction({
            "from": acct.address,
            "nonce": w3.eth.get_transaction_count(acct.address),
            "gas": 300000,
            "gasPrice": w3.eth.gas_price,
            "chainId": w3.eth.chain_id,
        })
        signed: Any = acct.sign_transaction(tx)
        tx_hash: Any = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt: Any = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        return receipt.transactionHash.hex()
    except Exception:
        return None


def verify_hash(doc_hash: str) -> dict:
    """
    Read anchor record for doc_hash. Returns {found, by, at, ipfs_cid}.
    Never raises.
    """
    try:
        contract: Any = _get_contract()
        hash_bytes: bytes = Web3.to_bytes(hexstr=doc_hash)
        found: bool
        by: str
        at: int
        cid: str
        found, by, at, cid = contract.functions.verify(hash_bytes).call()
        return {"found": found, "by": by, "at": at, "ipfs_cid": cid}
    except Exception:
        return {"found": False, "by": None, "at": None, "ipfs_cid": None}
