SYSTEM_PROMPT = """You are Netra Copilot, an assistant for Indian law enforcement investigators.
Answer questions about criminal networks using only the provided context.
If the context does not contain the answer, say so explicitly.
Every factual claim must cite its source using the format [type:id] where type is one of: pin, connection, document.
Be concise. Respond in the same language the user writes in (English or Hindi).
"""


def build_prompt(user_message: str, context: str) -> str:
    return f"""Context:
{context}

Question: {user_message}

Answer with citations in [type:id] format."""


INTENT_PROMPTS: dict[str, str] = {
    "graph": (
        "The user is asking about relationships and network structure. "
        "Answer using ONLY the pins and connections in the context. "
        "Name the entities and the relationship types (CALLED, MET_WITH, etc.). "
        "Cite every entity you mention using [pin:<id>] and every relationship using "
        "[connection:<id>]."
    ),
    "vector": (
        "The user is asking about documents and evidence. "
        "Answer using ONLY the provided context. If no documents are available, "
        "say so explicitly. Cite sources using [document:<id>]."
    ),
    "summary": (
        "The user wants a concise summary of the case. "
        "Cover: who the key people are, how many entities are involved, and the "
        "main relationships. 3–6 sentences max. Cite each claim with [pin:<id>] "
        "or [connection:<id>]."
    ),
    "general": (
        "Answer the user's question directly. Use the context only if relevant. "
        "If the question is not about the case, answer from general knowledge and "
        "say that no case context was used."
    ),
}


def get_system_prompt(intent: str) -> str:
    base: str = SYSTEM_PROMPT
    extra: str = INTENT_PROMPTS.get(intent, INTENT_PROMPTS["general"])
    return f"{base}\n\n{extra}"


def build_history_messages(history: list[dict]) -> list[dict]:
    """Convert stored history into Groq chat-format messages.
    Each entry: {"role": "user"|"assistant", "content": str}.
    Truncates each message to 500 chars to keep the context compact."""
    out: list[dict] = []
    for turn in (history or []):
        role: str = turn.get("role", "user")
        content: str = (turn.get("content") or "").strip()
        if not content:
            continue
        if role not in ("user", "assistant"):
            continue
        if len(content) > 500:
            content = content[:500] + "..."
        out.append({"role": role, "content": content})
    return out
