import re
from enum import Enum


class Intent(str, Enum):
    GRAPH = "graph"
    VECTOR = "vector"
    SUMMARY = "summary"
    GENERAL = "general"
    BOTH = "both"


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


_SUMMARY_RULES = [
    r"\bsummar(y|ize|ise)\b",
    r"\boverview\b",
    r"\bbrief(ly)?\b",
    r"\btell me about (this|the) case\b",
    r"\bwhat is this case about\b",
]


def classify_intent(message: str) -> Intent:
    text = message.strip().lower()
    if not text:
        return Intent.GENERAL

    # 1. Summary wins first — it should never hybridize
    for pattern in _SUMMARY_RULES:
        if re.search(pattern, text):
            return Intent.SUMMARY

    # 2. Hybrid check — both graph and vector signals present
    graph_signal = _has_signal(text, _GRAPH_SIGNALS)
    vector_signal = _has_signal(text, _VECTOR_SIGNALS)
    if graph_signal and vector_signal:
        return Intent.BOTH

    # 3. Explicit graph/vector rules (skip the summary entry — already checked)
    for intent, patterns in _RULES:
        if intent == Intent.SUMMARY:
            continue
        for pattern in patterns:
            if re.search(pattern, text):
                return intent

    # 4. Signal-only fallback
    if graph_signal:
        return Intent.GRAPH
    if vector_signal:
        return Intent.VECTOR

    return Intent.GENERAL


_GRAPH_SIGNALS: list[str] = [
    r"\bwho\b",
    r"\bconnected\b",
    r"\blinked\b",
    r"\brelationship",
    r"\bnetwork\b",
    r"\bkingpin\b",
    r"\bsuspect",
    r"\bperson\b",
    r"\bpeople\b",
    r"\bcalled\b",
    r"\bcontact",
]

_VECTOR_SIGNALS: list[str] = [
    r"\bdocument",
    r"\bfir\b",
    r"\bfile\b",
    r"\breport\b",
    r"\bevidence\b",
    r"\bpdf\b",
    r"\bmentions?\b",
    r"\bsays?\b",
    r"\baccording to\b",
]


def _has_signal(text: str, patterns: list[str]) -> bool:
    return any(re.search(p, text) for p in patterns)
