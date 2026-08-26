"""Plain test helpers (not fixtures) — importable from test modules."""


def signup(client, email="alice@example.com", password="secret123", name="Alice") -> str:
    """Create an account through the API and return the session token."""
    res = client.post(
        "/api/auth/signup",
        json={"name": name, "email": email, "password": password},
    )
    assert res.status_code == 200, res.text
    return res.json()["token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
