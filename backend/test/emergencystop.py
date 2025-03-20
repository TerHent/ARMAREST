

from flask import Blueprint

from backend.emergencystop.core import EmergencyStopCore
from backend.service import Service
from backend.webserver import Webserver


class MockEmergencyStopService(Service):
    core: EmergencyStopCore

    def __init__(self):
        super().__init__("emergencystop", None)
        self.core = EmergencyStopCore(self)
        self.controller = FakeEmergencyStop()

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint


class FakeEmergencyStop():
    active: bool

    def __init__(self):
        self.active = False

    def trigger_emergency_stop(self):
        print("Fake EmergencyStop triggered.")
        self.active = True

    def release_emergency_stop(self):
        print("Fake EmergenvyStop released.")
        self.active = False

    def is_currently_active(self) -> bool:
        return self.active


def test_emergency_stop():
    service = MockEmergencyStopService()
    webserver = Webserver(services=[service], use_auth=False)
    with webserver.app.test_client() as test_client:
        response = test_client.get("/api/v1/emergencystop/")
        assert response.status_code == 200, "Emergency Stop Status can be queried"
        assert response.text == str(
            service.controller.active).lower(), "Correct status response"

        response = test_client.put("/api/v1/emergencystop/stop")
        assert response.status_code == 204, "Emergency Stop can be triggered"
        assert service.controller.active, "Trigger went through to Ice"

        response = test_client.put("/api/v1/emergencystop/stop")
        assert response.status_code == 204, "Emergency Stop can be triggered multiple times"
        assert service.controller.active, "Trigger went through to Ice again"

        response = test_client.put("/api/v1/emergencystop/release")
        assert response.status_code == 204, "Emergency Stop can be released"
        assert service.controller.active is False, "Release went through to Ice"
