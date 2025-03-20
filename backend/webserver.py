import json
import uuid
from dataclasses import dataclass
from os import environ
from typing import List, Optional

import jwt
from flask import Flask, Response, request
from flask_cors import CORS

from .exceptions import ProxyUnreachableException
from .service import Service

SECRET: str = environ.get("SECRET_SIGNING_KEY", "")


@dataclass
class Webserver:
    app: Flask
    use_auth: bool
    uuid: str

    def __init__(self, services: List[Service], use_auth: bool) -> None:
        self.app = Flask(__name__)
        self.use_auth = use_auth
        self.uuid = str(uuid.uuid4())
        CORS(self.app, resources={
             r"/api/*": {"origins": "*"}}, expose_headers="Backend-UUID")

        @self.app.errorhandler(ProxyUnreachableException)
        def proxy_unreachable(error: ProxyUnreachableException) -> tuple[str, int]:
            return json.dumps({'error': 'Proxy is unreachable'}), 500

        @self.app.after_request
        def add_uuid(response: Response):
            response.headers['Backend-UUID'] = self.uuid
            return response

        for service in services:
            self.register_service(service)

    def register_service(self, service: Service) -> None:
        blueprint = service.get_api_blueprint()
        if self.use_auth:
            blueprint.before_request(AuthMiddleware(service))
        self.app.register_blueprint(
            blueprint,
            url_prefix='/api/v1/' + service.name,
        )

    def serve(self, port: int) -> None:
        # good for testing (grab port data etc. from env or config in armarest,
        # makes this method more easily testable)
        self.app.run("0.0.0.0", port)


class AuthMiddleware:
    service: Service

    def __init__(self, service: Service):
        self.service = service

    def __call__(self) -> Optional[Response]:
        if request.method == "OPTIONS":  # CORS OPTIONS requests should always be permitted.
            return None
        try:
            token = jwt.decode(str(request.headers.get("access_token", None)),
                               SECRET, leeway=10, algorithms=["HS256"], options={"require": ["exp"]})
        except jwt.DecodeError:
            return Response(json.dumps({"error": "Invalid authentication token header."}), 401, content_type="application/json")
        except jwt.ExpiredSignatureError:
            return Response(json.dumps({"error": "Your token is expired."}), 401, content_type="application/json")

        if "permissions" not in token or not isinstance(token["permissions"], (dict)):
            return Response(json.dumps({"error": "Your token does not contain an array of permissions."}), 401, content_type="application/json")

        if self.service.name not in token["permissions"]:
            specific_permissions = []
        else:
            specific_permissions = token["permissions"][self.service.name]

        # Allow for custom error messages. validate_permission should return None if the permission is valid.
        return self.service.validate_permission(specific_permissions, request.method, request.path)
