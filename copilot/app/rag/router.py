import re
from enum import Enum


class Intent(str, Enum):
    GRAPH = "graph"
    VECTOR = "vector"
    SUMMARY = "summary"
    GENERAL = "general"


# Ordered list of (intent, [regex patterns]). First match wins.
_RULES: list[tuple[Intent, list[str]]] = [
    (Intent.SUMMARY, [
        r"\bsummar(y|ize|ise)\b",
        r"\boverview\b",
        r"\bbrief(ly)?\b",
        r"\btell me about (this|the) case\b",
        r"\bwhat is this case about\b",
    ]),
    (Intent.GRAPH, [
        r"\bwho (is|are) (connected|linked|related|associated)\b",
        r"\bconnections? (of|to|between|from)\b",
        r"\bshortest path\b",
        r"\bnetwork\b",
        r"\bhub\b",
        r"\bcentral(ity)?\b",
        r"\bcluster\b",
        r"\bhow (many|much) (pins?|connections?|links?)\b",
        r"\blist (all )?(people|persons?|suspects?|phones?|locations?|pins?)\b",
        r"\bshow (me )?(all )?(people|persons?|suspects?|phones?|locations?)\b",
        r"\bkingpin\b",
        r"\bcriminal network\b",
    ]),
    (Intent.VECTOR, [
        r"\bdocuments?\b",
        r"\bfir\b",
        r"\bfiles?\b",
        r"\bevidence\b",
        r"\bwhat does .* say\b",
        r"\baccording to\b",
        r"\bmentions?\b",
        r"\breferences?\b",
        r"\breport\b",
        r"\bpdf\b",
    ]),
]


def classify_intent(message: str) -> Intent:
    """Rule-based classification. First matching rule wins.
    Falls back to GENERAL if nothing matches."""
    text: str = message.strip().lower()
    if not text:
        return Intent.GENERAL

    for intent, patterns in _RULES:
        for pattern in patterns:
            if re.search(pattern, text):
                return intent

    return Intent.GENERAL
