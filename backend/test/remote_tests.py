

from flask import Blueprint

from backend.remote import core
from backend.service import Service
from backend.test.remote import random_widget, set_widget_value, value_bool
from backend.webserver import Webserver


class SimpleRemoteGuiController:
    tabs: dict[str, core.Widget]
    get_tabs_calls: int
    get_tab_calls: int

    def __init__(self):
        self.tabs = {
            "tab01": core.Button(name="Button",
                                 value=core.ValueVariant(
                                     type=core.ValueVariantType.BOOL, value=False),
                                 state=core.WidgetState(
                                     hidden=False, disabled=False),
                                 children=[], tooltip="Button Tooltip", label="Button label"),
            "tab02": random_widget()
        }
        self.get_tab_calls = 0
        self.get_tabs_calls = 0

    def get_tabs(self) -> dict[str, core.Widget]:
        self.get_tabs_calls += 1
        return self.tabs

    def get_tab(self, tab: str) -> core.Widget:
        self.get_tab_calls += 1
        return self.tabs[tab]

    def set_value(self,
                  tab: str, widget_name: str, new_value: core.ValueVariant) -> None:
        set_widget_value(self.get_tab(tab), widget_name, new_value)


class SimpleRemoteGuiService(Service):
    core: "core.RemoteGuiCore"
    controller: SimpleRemoteGuiController

    def __init__(self):
        super().__init__("remote", None)
        self.controller = SimpleRemoteGuiController()
        self.core = core.RemoteGuiCore(self)
        self.core.update_tabs()

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint


def test_tab_update_request():
    service = SimpleRemoteGuiService()
    service.core.update_tab("tab01")
    assert service.controller.get_tab_calls > 0, "Used get_tab to get information about a tab"
    assert service.core.tabs["tab01"] == service.controller.tabs["tab01"], "Stored the tab correctly"
    service.core.update_tabs()
    assert service.controller.get_tabs_calls > 0, "Used get_tabs to get current tab information"
    assert service.core.tabs == service.controller.tabs, "Stored the tabs correctly"


def test_value_and_state_update():
    service = SimpleRemoteGuiService()
    assert service.core.update_value("tab01", "Button", value_bool(
    )) is None, "Fails silently if a tab does not exist."
    service.core.get_tabs()
    service.core.update_value("tab01", "Button", core.ValueVariant(
        type=core.ValueVariantType.BOOL, value=True))
    assert service.core.tabs["tab01"].value.value is True, "Updates value correctly"
    state = core.WidgetState(hidden=True, disabled=False)
    service.core.update_widget_state("tab01", "Button", state)
    assert service.core.tabs["tab01"].state == state, "Updates state correctly"


def test_get_tabs_api():
    service = SimpleRemoteGuiService()
    webserver = Webserver(services=[service], use_auth=False)
    with webserver.app.test_client() as test_client:
        response = test_client.get("/api/v1/remote/tabs/")
        assert response.status_code == 200, "Successful attempt to get tabs"
        assert response.text == '["tab01", "tab02"]', "Returns correct list of tabs"

        assert test_client.get(
            "/api/v1/remote/tab/tab99").status_code == 404, "Returns an error if a tab does not exist."

        response = test_client.get("/api/v1/remote/tab/tab01")
        assert response.status_code == 200, "Successful attempt to get a known tab"
        assert core.Button.parse_raw(
            response.text) == service.controller.tabs["tab01"], "Sent the tab correctly"


def test_update_values_api():
    service = SimpleRemoteGuiService()
    webserver = Webserver(services=[service], use_auth=False)
    with webserver.app.test_client() as test_client:
        response = test_client.put("/api/v1/remote/tab/tab01")
        assert response.status_code == 400, "Returns Bad Request when request arguments are not set."
        assert response.text.find(
            "query parameters") != -1, "Returns useful error message for params"

        response = test_client.put(
            "/api/v1/remote/tab/tab01?widgetName=Button&updatedValue=True&updatedValueType=DOESNOTEXIST")
        assert response.status_code == 400, "Returns Bad Request when requested value type does not exist"
        assert response.text.find(
            "updatedValueType") != -1, "Returns useful error message for updatedValueType"

        response = test_client.put(
            "/api/v1/remote/tab/tab01?widgetName=Button&updatedValue=True&updatedValueType=BOOL")
        assert response.status_code == 204, "Successful attempt to update known widget value"
        assert response.text == "", "Updating widget value does not return any content"
        assert service.controller.tabs["tab01"].value.value is True, "Value was actually updated in ice"
