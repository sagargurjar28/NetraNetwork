"""Quick Groq connectivity test. Run: python -m scripts.test_groq"""
import httpx
from app.core.config import settings

key = settings.GROQ_API_KEY.strip()
if not key:
    print("❌ GROQ_API_KEY is empty in backend/.env")
    raise SystemExit(1)

print(f"Using key starting with: {key[:8]}...")
print(f"Using model: {settings.GROQ_MODEL}")

resp = httpx.post(
    "https://api.groq.com/openai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    },
    json={
        "model": settings.GROQ_MODEL,
        "messages": [{"role": "user", "content": "say hi in one word"}],
        "max_tokens": 50,
    },
    timeout=30,
)

print(f"Status: {resp.status_code}")
print(resp.text)