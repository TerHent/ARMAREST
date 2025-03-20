import Ice
from flask import Blueprint

from ..service import Service
from .core import LoggerCore


class LoggerService(Service):
    core: LoggerCore

    def __init__(self, communicator: Ice.CommunicatorI) -> None:
        from .ice import LogReceiver
        super().__init__("log", communicator)
        self.core = LoggerCore()
        LogReceiver(self)

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint
