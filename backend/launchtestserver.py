import argparse
import time
from threading import Thread

from backend.check_token import CheckTokenService
from backend.test.emergencystop import MockEmergencyStopService
from backend.test.kinematic_unit import MockKinematicUnitService
from backend.test.logger import MockLoggerService
from backend.test.remote import MockRemoteGuiService
from backend.webserver import Webserver

parser = argparse.ArgumentParser(description='Start the backend')
parser.add_argument('--auth', action=argparse.BooleanOptionalAction,
                    default=True, help='enable or disable authentication')
use_auth = parser.parse_args().auth

logger = MockLoggerService()
emergencystop = MockEmergencyStopService()
kinematic_unit = MockKinematicUnitService()
remote_gui = MockRemoteGuiService()
check_token = CheckTokenService(None)
test_server = Webserver(
    [logger, emergencystop, kinematic_unit, remote_gui, check_token], use_auth)


def every_100_ms():
    while True:
        logger.add_random_message()
        kinematic_unit.send_updates()
        remote_gui.tick()
        time.sleep(0.1)


def every_1000_ms():
    while True:
        logger.add_message_for_filtering()
        time.sleep(2)


t = Thread(target=every_100_ms, daemon=True)
t.start()

t_filter = Thread(target=every_1000_ms, daemon=True)
t_filter.start()

test_server.serve(3300)
