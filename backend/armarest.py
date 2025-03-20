import os
from threading import Thread
from time import sleep
from typing import List, Optional

import Ice

from .service import Service
from .webserver import Webserver


class Armarest:
    """Main class."""
    services: List[Service]
    webserver: Optional[Webserver]
    communicator: Optional[Ice.CommunicatorI]

    def __init__(self) -> None:
        """Initialise the Ice communicator."""
        self.communicator = None
        self.webserver = None
        self.services = []

    def __enter__(self) -> 'Armarest':
        config_dir = os.environ['ARMARX_USER_CONFIG_DIR']
        parameters = ['--Ice.Config=' + config_dir + '/default.cfg']
        self.communicator = Ice.initialize(parameters)
        return self

    def register_service(self, service: Service) -> None:
        """Register a new service."""
        self.services.append(service)
        if self.webserver is not None:
            self.webserver.register_service(service)

    def run(self, use_auth: bool) -> None:
        """Start the server."""
        Thread(target=self._reconnect, daemon=True).start()
        self.webserver = Webserver(self.services, use_auth)
        self.webserver.serve(int(os.environ.get('ARMAREST_PORT', 3300)))

    def _reconnect(self):
        while True:
            sleep(60)
            for service in self.services:
                service.reconnect()

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        self.communicator.destroy()
