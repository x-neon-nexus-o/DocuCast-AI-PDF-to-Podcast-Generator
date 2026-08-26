"""Password hashing and session token generation."""

import secrets
from typing import Any

import bcrypt

BCRYPT_ROUNDS = 12


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), password_hash.encode("utf-8")
        )
    except (ValueError, TypeError):
        return False


def generate_session_token() -> str:
    """Generate a cryptographically random opaque session token."""
    return secrets.token_urlsafe(48)


def constant_time_compare(a: str, b: str) -> bool:
    return secrets.compare_digest(a, b)
