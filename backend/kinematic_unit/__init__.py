import Ice
from flask import Blueprint

from ..service import Service
from .core import KinematicUnitCore
from .simox import Simox


class KinematicUnitService(Service):
    controller: 'KinematicUnitController'
    receivers: dict[str, 'JointUpdateReceiver']
    simox: Simox
    core: KinematicUnitCore

    def __init__(self, communicator: Ice.CommunicatorI):
        super().__init__("kinematic", communicator)
        self.simox = Simox()
        self.core = KinematicUnitCore(self)
        self.receivers = {}
        self.reconnect()

    def reconnect(self) -> None:
        from .ice import JointUpdateReceiver, KinematicUnitController
        self.controller = KinematicUnitController(self)
        self.core.setup()
        for unit in self.controller.get_units():
            if unit not in self.receivers:
                self.receivers[unit] = JointUpdateReceiver(self, unit)

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint
