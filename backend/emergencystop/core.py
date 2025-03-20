import json

from flask import Blueprint, Response

import backend.emergencystop as emergencystop
from backend.exceptions import EmergencyStopNotFoundException


class EmergencyStopCore:
    blueprint: Blueprint
    service: 'emergencystop.EmergencyStopService'

    def __init__(self, service: 'emergencystop.EmergencyStopService'):
        self.blueprint = Blueprint("emergencystop", __name__)
        self.blueprint.route(
            "/stop", methods=["PUT"])(self.trigger_emergency_stop)
        self.blueprint.route(
            "/release", methods=["PUT"])(self.release_emergency_stop)
        self.blueprint.route("/", methods=["GET"])(self.is_active)
        self.service = service

        @self.blueprint.errorhandler(EmergencyStopNotFoundException)
        def proxy_unreachable(error: EmergencyStopNotFoundException) -> tuple[str, int]:
            return json.dumps({'error': 'Emergency Stop Proxy does not exist.'}), 500

    def is_active(self) -> Response:
        status: bool = self.service.controller.is_currently_active()
        return Response(str(status).lower(), 200, content_type='application/json')

    # @blueprint.route("/stop", methods=["PUT"])
    def trigger_emergency_stop(self) -> Response:
        self.service.controller.trigger_emergency_stop()
        return Response("", 204)

    def release_emergency_stop(self) -> Response:
        self.service.controller.release_emergency_stop()
        return Response("", 204)
