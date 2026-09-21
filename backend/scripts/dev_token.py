"""Generate a dev JWT for local Swagger testing. Do NOT use in production."""
import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings

payload = {
    "sub": str(uuid.uuid4()),          # any UUID = any user
    "role": "admin",                    # gives all permissions
    "exp": datetime.now(timezone.utc) + timedelta(hours=24),
}

token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
print(token)