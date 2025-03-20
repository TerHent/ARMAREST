from typing import Any

import Ice
from flask import Blueprint

from ..service import Service


class RemoteGuiService(Service):
    controller: Any  # : RemoteGuiController
    core: Any  # RemoteGuiCore

    def __init__(self, communicator: Ice.CommunicatorI):
        super().__init__("remote", communicator)
        from .core import RemoteGuiCore
        from .ice import RemoteGuiReceiver
        self.core = RemoteGuiCore(self)
        self.reconnect()
        RemoteGuiReceiver(self)

    def reconnect(self) -> None:
        from .ice import RemoteGuiController
        self.controller = RemoteGuiController(self)
        self.core.update_tabs()

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint
