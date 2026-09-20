"""Quick Groq connectivity test. Run: python -m scripts.test_groq"""
import os
import httpx

key = os.environ.get("GROQ_KEY", "").strip()
if not key:
    print("❌ GROQ_KEY env var is empty. Set it first:")
    print('   $env:GROQ_KEY="gsk_your_key_here"')
    raise SystemExit(1)

print(f"Using key starting with: {key[:8]}...")

resp = httpx.post(
    "https://api.groq.com/openai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": "say hi"}],
        "max_tokens": 10,
    },
    timeout=30,
)

print(f"Status: {resp.status_code}")
print(resp.text)