import argparse

from typeguard.importhook import TypeguardFinder, install_import_hook

from .armarest import Armarest
from .check_token import CheckTokenService
from .emergencystop import EmergencyStopService
from .exceptions import IceGridDownException
from .kinematic_unit import KinematicUnitService
from .logger import LoggerService
from .remote import RemoteGuiService


class CustomFinder(TypeguardFinder):
    """
    Only check backend, do not check backend ice modules, and NEVER check other modules (IcePy really hates typechecking)
    """

    def should_instrument(self, module_name: str):
        return module_name.startswith("backend.") and not module_name.endswith(".ice")


install_import_hook(packages=["backend"], cls=CustomFinder)


parser = argparse.ArgumentParser(description='Start the backend')
parser.add_argument('--auth', action=argparse.BooleanOptionalAction,
                    default=True, help='enable or disable authentication')
use_auth = parser.parse_args().auth

try:
    with Armarest() as armarest:
        armarest.register_service(EmergencyStopService(armarest.communicator))
        armarest.register_service(KinematicUnitService(armarest.communicator))
        armarest.register_service(LoggerService(armarest.communicator))
        armarest.register_service(RemoteGuiService(armarest.communicator))
        armarest.register_service(CheckTokenService(armarest.communicator))

        armarest.run(use_auth)
except IceGridDownException:
    print("Error: IceGrid is not running, try `armarx start'")
