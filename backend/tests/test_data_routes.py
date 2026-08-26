"""Tests for MongoDB-backed document & podcast persistence."""

from tests.helpers import signup, auth_headers


def test_documents_are_user_scoped(client):
    token_a = signup(client, email="alice@data.com")
    token_b = signup(client, email="bob@data.com")

    res = client.post(
        "/api/documents",
        json={
            "name": "Report.pdf",
            "type": "pdf",
            "pages": 12,
            "status": "ready",
            "category": "Reports",
            "sizeMb": 2.5,
            "hasAudio": True,
        },
        headers=auth_headers(token_a),
    )
    assert res.status_code == 201, res.text
    doc_id = res.json()["id"]

    # Alice sees her document...
    res = client.get("/api/documents", headers=auth_headers(token_a))
    assert res.status_code == 200
    assert [d["id"] for d in res.json()] == [doc_id]

    # ...but Bob never sees it.
    res = client.get("/api/documents", headers=auth_headers(token_b))
    assert res.json() == []

    # Bob cannot modify or delete Alice's document.
    res = client.patch(
        f"/api/documents/{doc_id}",
        json={"favorite": True},
        headers=auth_headers(token_b),
    )
    assert res.status_code == 404
    res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers(token_b))
    assert res.status_code == 404


def test_document_update_and_delete(client):
    token = signup(client, email="carol@data.com")
    res = client.post(
        "/api/documents",
        json={"name": "Notes.pdf", "pages": 4},
        headers=auth_headers(token),
    )
    doc_id = res.json()["id"]

    res = client.patch(
        f"/api/documents/{doc_id}",
        json={"name": "Renamed.pdf", "favorite": True},
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "Renamed.pdf"
    assert body["favorite"] is True

    res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers(token))
    assert res.status_code == 200
    res = client.get("/api/documents", headers=auth_headers(token))
    assert res.json() == []


def test_podcast_save_roundtrip_with_audio(client):
    token = signup(client, email="dave@data.com")
    res = client.post(
        "/api/podcasts",
        json={
            "docId": "doc-xyz",
            "title": "AI Explained",
            "durationSec": 125.5,
            "pages": 3,
            "language": "English",
            "voice": "sarah",
            "style": "conversational",
            "script": [
                {"id": "line-0", "speaker": "HOST", "text": "Welcome to AI Explained."}
            ],
            "summary": {
                "overview": "A podcast about AI.",
                "keyConcepts": ["AI"],
                "takeaways": ["Listen!"],
            },
            "chapters": [{"id": "c1", "title": "Intro", "startSec": 0}],
            "audioBase64": "QUlGT1JNQVRFRF9BVURJTw==",
            "audioFormat": "mp3",
        },
        headers=auth_headers(token),
    )
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["title"] == "AI Explained"
    assert body["hasAudio"] is True

    # List endpoint omits heavy audio by default...
    res = client.get("/api/podcasts", headers=auth_headers(token))
    assert len(res.json()) == 1
    assert res.json()[0]["audioBase64"] is None

    # ...and the detail endpoint can include it.
    res = client.get(
        f"/api/podcasts/{body['id']}",
        params={"include_audio": True},
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    assert res.json()["audioBase64"] == "QUlGT1JNQVRFRF9BVURJTw=="


def test_podcast_favorite_toggle(client):
    token = signup(client, email="erin@data.com")
    res = client.post(
        "/api/podcasts",
        json={"title": "Pod", "durationSec": 60},
        headers=auth_headers(token),
    )
    pod_id = res.json()["id"]

    res = client.patch(
        f"/api/podcasts/{pod_id}",
        json={"favorite": True},
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    assert res.json()["favorite"] is True

    res = client.delete(f"/api/podcasts/{pod_id}", headers=auth_headers(token))
    assert res.status_code == 200
    res = client.get("/api/podcasts", headers=auth_headers(token))
    assert res.json() == []


def test_unauthorized_requests_rejected(client):
    assert client.get("/api/documents").status_code == 401
    assert client.get("/api/podcasts").status_code == 401
    assert client.post("/api/documents", json={"name": "x.pdf"}).status_code == 401
