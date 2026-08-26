"""Pytest fixtures — run the whole backend against an in-memory MongoDB
emulator (mongomock-motor) so tests never require a live mongod."""

import asyncio


import pytest
from mongomock_motor import AsyncMongoMockClient

from app import db as db_module


@pytest.fixture(autouse=True)
def mongo_emulator(monkeypatch):
    """Swap the app's database layer to an in-memory MongoDB emulator and
    create the indexes, just like the real startup flow would."""
    client = AsyncMongoMockClient()

    async def _fake_connect():
        db_module._emulator_client = client
        db_module._real_client = None
        db_module._using_emulator = True
        await db_module.init_db()
        return {"engine": "mongodb-emulator", "persistent": False}

    async def _fake_close():
        db_module._emulator_client = None
        db_module._real_client = None

    monkeypatch.setattr(db_module, "connect_database", _fake_connect)
    monkeypatch.setattr(db_module, "close_database", _fake_close)
    # Ensure the emulator is active before any request executes.
    asyncio.run(db_module.connect_database())
    yield client


@pytest.fixture()
def db_emulator(mongo_emulator):
    """Direct handle to the emulator database (sync; tests can wrap coroutine
    calls in asyncio.run via tests.helpers.await_db)."""
    return mongo_emulator[db_module.settings.MONGODB_DB_NAME]


@pytest.fixture()
def client():
    """FastAPI TestClient with lifespan (which runs against the emulator)."""
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as c:
        yield c


def signup(client, email="alice@example.com", password="secret123", name="Alice") -> str:
    """Helper: create an account and return the session token."""
    res = client.post(
        "/api/auth/signup",
        json={"name": name, "email": email, "password": password},
    )
    assert res.status_code == 200, res.text
    return res.json()["token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
