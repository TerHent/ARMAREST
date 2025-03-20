from backend.check_token import CheckTokenService


def test_check_token():
    service = CheckTokenService(None)
    assert service.validate_permission(
        [], "GET", "/") is None, "Does not require any special permissions."
    assert service.check_token().status_code == 204, "Responds with 204 No Content."
