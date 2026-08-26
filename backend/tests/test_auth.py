"""Tests for MongoDB-backed authentication (signup / login / session)."""

from datetime import timedelta
import asyncio

from tests.helpers import signup, auth_headers


def await_db(coro):
    return asyncio.run(coro)


def test_signup_creates_user_and_session(client, db_emulator):
    res = client.post(
        "/api/auth/signup",
        json={"name": "Alice", "email": "alice@example.com", "password": "secret123"},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["success"] is True
    assert body["token"]
    assert body["user"]["email"] == "alice@example.com"
    assert body["user"]["name"] == "Alice"

    # Data is actually stored in the (emulated) MongoDB collections.
    user = await_db(db_emulator.users.find_one({"email": "alice@example.com"}))
    assert user is not None
    # Passwords are never stored in plaintext.
    assert user["password_hash"] != "secret123"
    assert user["password_hash"].startswith("$2")

    session = await_db(db_emulator.sessions.find_one({"user_id": user["_id"]}))
    assert session is not None
    assert session["token"] == body["token"]
    assert session["expires_at"] > session["created_at"]


def test_signup_duplicate_email(client):
    signup(client, email="bob@example.com")
    res = client.post(
        "/api/auth/signup",
        json={"name": "Bob2", "email": "bob@example.com", "password": "secret123"},
    )
    assert res.status_code == 409
    assert res.json()["detail"]["code"] == "EMAIL_TAKEN"


def test_login_success_and_session(client, db_emulator):
    signup(client, email="carol@example.com", password="secret123")
    res = client.post(
        "/api/auth/login",
        json={"email": "carol@example.com", "password": "secret123", "remember": False},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["token"]

    session = await_db(db_emulator.sessions.find_one({"token": body["token"]}))
    assert session is not None
    # Non-remember sessions expire quickly (SESSION_DEFAULT_DAYS = 1).
    assert session["expires_at"] - session["created_at"] <= timedelta(days=1)


def test_login_wrong_password(client):
    signup(client, email="dave@example.com", password="secret123")
    res = client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "wrong-pass"},
    )
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "INVALID_CREDENTIALS"


def test_me_returns_current_user(client):
    token = signup(client, email="erin@example.com")
    res = client.get("/api/auth/me", headers=auth_headers(token))
    assert res.status_code == 200, res.text
    assert res.json()["email"] == "erin@example.com"


def test_me_rejects_bad_token(client):
    res = client.get("/api/auth/me", headers=auth_headers("not-a-real-token"))
    assert res.status_code == 401


def test_logout_destroys_session(client, db_emulator):
    token = signup(client, email="frank@example.com")
    assert await_db(db_emulator.sessions.count_documents({"token": token})) == 1

    res = client.post("/api/auth/logout", headers=auth_headers(token))
    assert res.status_code == 200

    # The session is gone from MongoDB, so the token no longer authenticates.
    assert await_db(db_emulator.sessions.count_documents({"token": token})) == 0
    res = client.get("/api/auth/me", headers=auth_headers(token))
    assert res.status_code == 401


def test_change_password_invalidates_sessions(client):
    token = signup(client, email="grace@example.com")
    res = client.post(
        "/api/auth/change-password",
        json={"currentPassword": "secret123", "newPassword": "newpass456"},
        headers=auth_headers(token),
    )
    assert res.status_code == 200, res.text

    # Old session was invalidated.
    assert client.get("/api/auth/me", headers=auth_headers(token)).status_code == 401

    # New password works for login.
    res = client.post(
        "/api/auth/login",
        json={"email": "grace@example.com", "password": "newpass456"},
    )
    assert res.status_code == 200
