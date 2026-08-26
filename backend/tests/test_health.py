


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    # The health endpoint reports the active database engine.
    assert data["database"]["connected"] is True
    assert data["database"]["engine"] == "mongodb-emulator"
