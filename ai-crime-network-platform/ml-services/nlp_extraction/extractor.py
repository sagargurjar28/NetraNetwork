"""
NER pipeline for FIR documents.
Uses spaCy en_core_web_sm plus regex for domain-specific patterns.
"""
import re
from typing import Any

_nlp: Any = None


def _get_nlp() -> Any:
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            from spacy.cli import download
            download("en_core_web_sm")
            _nlp = spacy.load("en_core_web_sm")
    return _nlp


_PHONE_RE: re.Pattern[str] = re.compile(
    r"(?:\+91[\-\s]?)?[6-9]\d{9}"
    r"|\b0\d{2,4}[\-\s]?\d{6,8}\b"
)

_MONEY_RE: re.Pattern[str] = re.compile(
    r"(?:Rs\.?|INR|₹)\s?[\d,]+(?:\.\d+)?(?:\s?(?:lakh|crore|k))?",
    re.IGNORECASE,
)

_DATE_RE: re.Pattern[str] = re.compile(
    r"\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}\b"
    r"|\b\d{1,2}/\d{1,2}/\d{2,4}\b"
    r"|\b\d{4}-\d{2}-\d{2}\b",
    re.IGNORECASE,
)

_PERSON_BLOCKLIST: set[str] = {
    "FIR", "FIRST", "INFORMATION", "REPORT", "CASE", "POLICE", "STATION",
    "COMPLAINANT", "ACCUSED", "INVESTIGATION", "FACTS", "DATE", "NO",
    "INDIA", "GOVERNMENT", "SECTION", "IPC", "CRPC", "POLICE STATION",
}


def extract_entities(text: str) -> dict[str, list[str]]:
    """Extract entities from FIR text. Never raises."""
    result: dict[str, list[str]] = {"persons": [], "phones": [], "locations": [], "amounts": [], "dates": []}
    if not text or not text.strip():
        return result

    try:
        nlp: Any = _get_nlp()
        doc: Any = nlp(text[:100000])

        seen_persons: set[str] = set()
        seen_locs: set[str] = set()

        for ent in doc.ents:
            label: str = ent.label_
            value: str = ent.text.strip()
            if not value or len(value) < 2:
                continue

            if label == "PERSON":
                key: str = value.lower()
                if key in _PERSON_BLOCKLIST or key in seen_persons:
                    continue
                seen_persons.add(key)
                result["persons"].append(value)

            elif label in ("GPE", "LOC", "FAC"):
                key = value.lower()
                if key in seen_locs:
                    continue
                seen_locs.add(key)
                result["locations"].append(value)

        result["phones"] = list({m.group(0).strip() for m in _PHONE_RE.finditer(text)})
        result["amounts"] = list({m.group(0).strip() for m in _MONEY_RE.finditer(text)})
        result["dates"] = list({m.group(0).strip() for m in _DATE_RE.finditer(text)})

    except Exception:
        pass

    return result
