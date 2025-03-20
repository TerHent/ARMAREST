import json
from enum import Enum
from typing import Dict, List, Literal, Optional, Union

from flask import Blueprint, Response, request
from pydantic import BaseModel, Field
from typing_extensions import Annotated
from werkzeug.exceptions import NotFound

import backend.kinematic_unit as kinematic_unit


class ControlMode(Enum):
    DISABLED = "Disabled"
    UNKNOWN = "Unknown"
    POSITION_CONTROL = "PositionControl"
    VELOCITY_CONTROL = "VelocityControl"
    TORQUE_CONTROL = "TorqueControl"
    POSITION_VELOCITY_CONTROL = "PositionVelocityControl"


class RangeViolation(BaseModel):
    range_from: float
    range_to: float
    actual_value: float


class OutOfRangeException(BaseModel):
    kind: Literal["OutOfRangeException"] = "OutOfRangeException"
    violation: List[RangeViolation]


class ControlModeNotSupportedException(BaseModel):
    kind: Literal["ControlModeNotSupportedException"] = "ControlModeNotSupportedException"
    mode: ControlMode


class KinematicUnitUnavailable(BaseModel):
    kind: Literal["KinematicUnitUnavailable"] = "KinematicUnitUnavailable"
    nodeOwners: Dict[str, str]


class KinematicUnitNotOwnedException(BaseModel):
    kind: Literal["KinematicUnitNotOwnedException"] = "KinematicUnitNotOwnedException"
    nodes: List[str]


KinematicUnitError = Annotated[
    Union[OutOfRangeException, ControlModeNotSupportedException,
          KinematicUnitUnavailable, KinematicUnitNotOwnedException],
    Field(discriminator='kind')
]


class OperationStatus(Enum):
    OFFLINE = "Offline"
    ONLINE = "Online"
    INITIALIZED = "Initialized"


class ErrorStatus(Enum):
    OK = "Ok"
    WARNING = "Warning"
    ERROR = "Error"


class JointStatus(BaseModel):
    operation: OperationStatus
    error: ErrorStatus
    enabled: bool
    emergency_stop: bool


class Joint(BaseModel):
    angle: Optional[float] = None
    velocity: Optional[float] = None
    torque: Optional[float] = None
    acceleration: Optional[float] = None
    current: Optional[float] = None
    motorTemperature: Optional[float] = None
    controlMode: ControlMode = ControlMode.UNKNOWN
    status: Optional[JointStatus] = None


class JointTable(BaseModel):
    __root__: Dict[str, Joint]


class JointType(Enum):
    REVOLUTE = 'Revolute'
    PRISMATIC = 'Prismatic'


class JointStatic(BaseModel):
    type: JointType
    limitLo: float
    limitHi: float


class JointStaticTable(BaseModel):
    __root__: Dict[str, JointStatic]


class KinematicUnitCore:
    blueprint: Blueprint
    service: 'kinematic_unit.KinematicUnitService'
    joints: Dict[str, Dict[str, tuple[JointStatic, Joint]]]

    def __init__(self, service: 'kinematic_unit.KinematicUnitService'):
        self.service = service
        self.joints = {}
        self.blueprint = Blueprint("kinematic", __name__)
        self.blueprint.add_url_rule(
            "/", methods=["GET"], view_func=self.get_units)
        self.blueprint.add_url_rule(
            "/<unit>/joints/", methods=["GET"], view_func=self.get_all_joints)
        self.blueprint.add_url_rule(
            "/<unit>/joints/static", methods=["GET"], view_func=self.get_all_joints_static)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>", methods=["GET"], view_func=self.get_joint)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/static", methods=["GET"], view_func=self.get_joint_static)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/angle", methods=["GET"], view_func=self.get_angle)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/angle", methods=["PUT"], view_func=self.set_angle)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/torque", methods=["GET"], view_func=self.get_torque)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/torque", methods=["PUT"], view_func=self.set_torque)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/velocity", methods=["GET"], view_func=self.get_velocity)
        self.blueprint.add_url_rule(
            "/<unit>/joint/<name>/velocity", methods=["PUT"], view_func=self.set_velocity)

    def setup(self):
        self.joints = {}
        units = self.service.controller.get_units()
        for unit in units:
            robot_path = self.service.controller.get_robot_filename(unit)
            if robot_path is None:
                print(f'Failed to find robot file for {unit}')
                continue
            nodeset = self.service.controller.get_robot_nodeset(unit)
            static_joints = self.service.simox.get_all_joints(
                robot_path, nodeset)
            self.joints[unit] = {
                name: (static, Joint())
                for name, static in static_joints
            }
            current_joints = self.service.controller.get_all_joint_data(unit)
            self.joints[unit] = {
                name: (static, current_joints.get(name, dummy))
                for name, (static, dummy) in self.joints[unit].items()
            }

    def update_joint_control_mode(self,
                                  unit: str,
                                  name: str,
                                  control_mode: ControlMode,
                                  ) -> None:
        self._get_joint_or_dummy(unit, name).controlMode = control_mode

    def update_joint_angle(self,
                           unit: str,
                           name: str,
                           angle: float,
                           ) -> None:
        self._get_joint_or_dummy(unit, name).angle = angle

    def update_joint_velocity(self,
                              unit: str,
                              name: str,
                              velocity: float,
                              ) -> None:
        self._get_joint_or_dummy(unit, name).velocity = velocity

    def update_joint_torque(self,
                            unit: str,
                            name: str,
                            torque: float,
                            ) -> None:
        self._get_joint_or_dummy(unit, name).torque = torque

    def update_joint_acceleration(self,
                                  unit: str,
                                  name: str,
                                  acceleration: float,
                                  ) -> None:
        self._get_joint_or_dummy(unit, name).acceleration = acceleration

    def update_joint_current(self,
                             unit: str,
                             name: str,
                             current: float,
                             ) -> None:
        self._get_joint_or_dummy(unit, name).current = current

    def update_joint_motor_temperature(self,
                                       unit: str,
                                       name: str,
                                       temperature: float,
                                       ) -> None:
        self._get_joint_or_dummy(unit, name).motorTemperature = temperature

    def update_joint_status(self,
                            unit: str,
                            name: str,
                            status: JointStatus,
                            ) -> None:
        self._get_joint_or_dummy(unit, name).status = status

    def is_revolute(self, unit: str, name: str) -> bool:
        try:
            return self.joints[unit][name][0].type == JointType.REVOLUTE
        except KeyError:
            return False

    def get_units(self) -> Response:
        return Response(json.dumps(list(self.joints.keys())), 200, content_type="application/json")

    def _get_unit_joints(self, unit: str) -> Dict[str, Joint]:
        try:
            return self.joints[unit]
        except KeyError:
            raise NotFound(response=Response(json.dumps(
                {"error": "No such KinematicUnit"}), 404, content_type="application/json"))

    def _get_joint(self, unit: str, name: str) -> tuple[JointStatic, Joint]:
        joints = self._get_unit_joints(unit)
        try:
            return joints[name]
        except KeyError:
            raise NotFound(response=Response(json.dumps(
                {"error": "No such joint"}), 404, content_type="application/json"))

    def _get_joint_or_dummy(self, unit: str, name: str) -> Joint:
        try:
            return self._get_joint(unit, name)[1]
        except NotFound:
            return Joint()

    def _value_to_response(self, value: Optional[float]) -> Response:
        if value is None:
            return Response(status=204)
        else:
            return Response(json.dumps(value), content_type='application/json')

    def _error_to_response(self, error: Optional[KinematicUnitError]) -> Response:
        if error is None:
            return Response(status=204)
        else:
            return Response(error.json(), 400, content_type='application/json')

    def get_all_joints(self, unit: str) -> Response:
        joints = self._get_unit_joints(unit)
        joints = {name: joint for name, (static, joint) in joints.items()}
        return Response(JointTable(__root__=joints).json(), 200, content_type="application/json")

    def get_all_joints_static(self, unit: str) -> Response:
        joints = self._get_unit_joints(unit)
        joints = {name: static for name, (static, joint) in joints.items()}
        return Response(JointStaticTable(__root__=joints).json(), 200, content_type="application/json")

    def get_joint(self, unit: str, name: str) -> Response:
        joint = self._get_joint(unit, name)[1]
        return Response(joint.json(), 200, content_type="application/json")

    def get_joint_static(self, unit: str, name: str) -> Response:
        static = self._get_joint(unit, name)[0]
        return Response(static.json(), 200, content_type="application/json")

    def get_angle(self, unit: str, name: str) -> Response:
        joint = self._get_joint(unit, name)[1]
        return self._value_to_response(joint.angle)

    def set_angle(self, unit: str, name: str) -> Response:
        angle = request.args.get('angle', type=float)
        if angle is None:
            return Response(json.dumps({"error": "No angle provided"}), 400, content_type='application/json')
        self._get_joint(unit, name)
        error = self.service.controller.set_joint_angle(unit, name, angle)
        return self._error_to_response(error)

    def get_torque(self, unit: str, name: str) -> Response:
        joint = self._get_joint(unit, name)[1]
        return self._value_to_response(joint.torque)

    def set_torque(self, unit: str, name: str) -> Response:
        torque = request.args.get('torque', type=float)
        if torque is None:
            return Response(json.dumps({"error": "No torque provided"}), 400, content_type='application/json')
        self._get_joint(unit, name)
        error = self.service.controller.set_joint_torque(unit, name, torque)
        return self._error_to_response(error)

    def get_velocity(self, unit: str, name: str) -> Response:
        joint = self._get_joint(unit, name)[1]
        return self._value_to_response(joint.velocity)

    def set_velocity(self, unit: str, name: str) -> Response:
        velocity = request.args.get('velocity', type=float)
        if velocity is None:
            return Response(json.dumps({"error": "No velocity provided"}), 400, content_type='application/json')
        self._get_joint(unit, name)
        error = self.service.controller.set_joint_velocity(
            unit, name, velocity)
        return self._error_to_response(error)
