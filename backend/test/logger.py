
import random
from datetime import datetime

from backend.logger.core import LoggerCore, LogMessage, Verbosity

from ..service import Service
from ..webserver import Webserver
from .utils import random_str


class MockLoggerService(Service):
    core: LoggerCore

    def __init__(self):
        super().__init__("log", None)
        self.core = LoggerCore()

    def get_api_blueprint(self):
        return self.core.blueprint

    def add_random_message(self) -> LogMessage:
        message = LogMessage(
            verbosity=random.choice(list(Verbosity)),
            message="Random Test Message <" + random_str(1_000_000_000) + ">",
            timestamp=datetime.now(),
            author="TestComp" + random_str(50),
            group="TestGroup" + random_str(10),
            backtrace="",
            file="folder/file" + random_str(100) + ".cpp",
            function="void logSomething" +
            random_str(100) + "(message&: String)",
            line=random.randint(25, 250),
            tag=random.choice(["", "", "tag" + random_str(50)]),
            thread_id=random.randint(0, 10000),
            id=-1,
        )
        self.core.add_message(message)
        return message

    def add_message_for_filtering(self) -> LogMessage:
        message = LogMessage(
            verbosity=random.choice(list(Verbosity)),
            message="Filter Me",
            timestamp=datetime.now(),
            author="Filter Component",
            group="Filter Group",
            backtrace="",
            file="folder/filter.cpp",
            function="void logSomething(message&: String)",
            line=1,
            tag="filtered message tag",
            thread_id=0,
            id=-1,
        )

        self.core.add_message(message)
        return message


def test_add_message():
    service = MockLoggerService()
    assert len(
        service.core.buffer) == 0, "LoggerCore buffer is empty on initialization"
    message = service.add_random_message()
    assert len(service.core.buffer) == 1, "LoggerCore adds messages to the buffer"
    assert service.core.buffer[0] == message, "LoggerCore stores the messages correctly."


def test_api_response():
    service = MockLoggerService()
    webserver = Webserver(services=[service], use_auth=False)
    with webserver.app.test_client() as test_client:
        assert test_client.get(
            "/api/v1/log/").status_code == 400, "No verbosity given errors out"
        assert test_client.get(
            "/api/v1/log/?verbosity=INFO").status_code == 200, "Can get empty array"
        message = service.add_random_message()
        response = test_client.get(
            f"/api/v1/log/?verbosity={message.verbosity.name}")
        message.id = 0
        assert response.status_code == 200, "Can get messages"
        assert response.text == f"[{message.json()}]", "Returns message on query with same verbosity."
