
from typing import Optional

import armarx
import Ice

from backend.exceptions import EmergencyStopNotFoundException

from ..ice import IceRequest


class EmergencyStopController:
    from . import EmergencyStopService
    proxy: Optional[armarx.EmergencyStopMasterInterfacePrx]
    communicator: Ice.CommunicatorI

    def __init__(self, service: "EmergencyStopService"):
        self.communicator = service.communicator
        self.aquire_proxy()

    def aquire_proxy(self):
        try:
            base = self.communicator.stringToProxy("EmergencyStopMaster")
            self.proxy = armarx.EmergencyStopMasterInterfacePrx.checkedCast(
                base)
        except (Ice.NotRegisteredException, Ice.ConnectionRefusedException):
            print("Failed attempt to get EmergencyStopMaster proxy")
            self.proxy = None

    def trigger_emergency_stop(self):
        if self.proxy is None:
            self.aquire_proxy()
        if self.proxy is None:
            raise EmergencyStopNotFoundException()

        with IceRequest():
            self.proxy.setEmergencyStopState(
                armarx.EmergencyStopState.eEmergencyStopActive)

    def release_emergency_stop(self):
        if self.proxy is None:
            self.aquire_proxy()
        if self.proxy is None:
            raise EmergencyStopNotFoundException()

        with IceRequest():
            self.proxy.setEmergencyStopState(
                armarx.EmergencyStopState.eEmergencyStopInactive)

    def is_currently_active(self) -> bool:
        if self.proxy is None:
            self.aquire_proxy()
        if self.proxy is None:
            raise EmergencyStopNotFoundException()

        with IceRequest():
            return self.proxy.getEmergencyStopState() == armarx.EmergencyStopState.eEmergencyStopActive
