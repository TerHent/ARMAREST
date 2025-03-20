import Ice
from flask import Blueprint

from ..service import Service
from .core import EmergencyStopCore


class EmergencyStopService(Service):
    controller: "EmergencyStopController"
    core: EmergencyStopCore

    def __init__(self, communicator: Ice.CommunicatorI):
        super().__init__("emergencystop", communicator)
        self.reconnect()
        self.core = EmergencyStopCore(self)

    def reconnect(self) -> None:
        from .ice import EmergencyStopController
        self.controller = EmergencyStopController(self)

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint
