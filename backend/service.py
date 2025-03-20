import json
from abc import ABC, abstractmethod
from typing import List, Optional, Type

import Ice
import IceGrid
from flask import Blueprint, Response

from .exceptions import IceGridDownException


class Service(ABC):
    name: str
    communicator: Ice.CommunicatorI

    def __init__(self, name: str, communicator: Ice.CommunicatorI) -> None:
        super().__init__()
        self.name = name
        self.communicator = communicator

    def reconnect(self) -> None:
        pass

    @abstractmethod
    def get_api_blueprint(self) -> Blueprint:
        pass

    def validate_permission(self, permissions: List[str], method: str, path: str) -> Optional[Response]:
        """
        Return None if the permission is valid, which means the request passes through.
        Return the error response if the permission is invalid.
        """
        if "*" in permissions or "write" in permissions:
            return None
        if method == "GET" and "read" in permissions:
            return None
        suffix = ".read" if method == "GET" else ".write"
        # Keep permission format with dots in response and in the cli
        return Response(json.dumps({"permission": [self.name + suffix], "error": "Insufficient permissions to access " + self.name}), 403, content_type="application/json")

    def find_proxies(self, search_string: str, proxy_type: Type[Ice.ObjectPrx]):
        obj = self.communicator.stringToProxy('IceGrid/Registry')
        try:
            registry = IceGrid.RegistryPrx.checkedCast(obj)
        except Ice.ConnectionRefusedException as e:
            raise IceGridDownException() from e
        admin_session = registry.createAdminSession('user', 'password')
        admin = admin_session.getAdmin()
        proxies = {}
        for obj in admin.getAllObjectInfos(search_string):
            try:
                proxy = proxy_type.checkedCast(obj.proxy)
            except Ice.ConnectionRefusedException:
                continue
            if proxy is not None:
                proxies[proxy.ice_getIdentity().name] = proxy
        return proxies
