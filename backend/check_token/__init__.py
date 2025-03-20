from typing import List, Optional

import Ice
from flask import Blueprint, Response

from ..service import Service


class CheckTokenService(Service):
    blueprint: Blueprint

    def __init__(self, communicator: Ice.CommunicatorI):
        super().__init__("check_token", communicator)
        self.blueprint = Blueprint("check_token", __name__)
        self.blueprint.route("/", methods=["GET"])(self.check_token)

    def check_token(self) -> Response:
        return Response("", 204)

    def get_api_blueprint(self) -> Blueprint:
        return self.blueprint

    def validate_permission(self, permissions: List[str], method: str, path: str) -> Optional[Response]:
        # check_token does not require special permissions.
        return None
