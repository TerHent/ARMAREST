
import json
import random
from pathlib import Path
from typing import Callable, Dict, List, Optional

from flask import Blueprint

from backend.kinematic_unit import core
from backend.kinematic_unit.core import (ControlMode, ErrorStatus, Joint,
                                         JointStatic, JointStatus,
                                         KinematicUnitCore, OperationStatus)
from backend.kinematic_unit.simox import Simox
from backend.service import Service

from ..webserver import Webserver


class FakeKinematicUnitController():
    service: 'MockKinematicUnitService'
    fake_joints: dict[str, Joint]

    def __init__(self, service: 'MockKinematicUnitService', fake_joints: int = 10):
        self.service = service
        joint_names = (f'Fake Joint {i}' for i in range(1, fake_joints + 1))
        self.fake_joints = {
            name: self.make_joint(name)
            for name in joint_names
        }

    def get_units(self) -> List[str]:
        return ['FakeKinematicUnit']

    def get_robot_filename(self, unit: str) -> Path:
        if unit != 'FakeKinematicUnit':
            raise KeyError(unit)
        return Path(__file__).parent / 'FakeRobot.xml'

    def get_robot_nodeset(self, unit: str) -> str:
        if unit != 'FakeKinematicUnit':
            raise KeyError(unit)
        return 'FakeNodeSet'

    def get_joint_data(self, unit: str, joint: str) -> Optional[Joint]:
        if unit != 'FakeKinematicUnit':
            return None
        return self.fake_joints.get(joint)

    def get_all_joint_data(self, unit: str) -> Dict[str, Joint]:
        if unit != 'FakeKinematicUnit':
            return {}
        return {
            key: value.copy(deep=True)
            for key, value in self.fake_joints.items()
        }

    def set_joint_angle(self, unit: str, name: str, angle: float) -> Optional[core.KinematicUnitError]:
        return self._set(unit, name, ControlMode.POSITION_CONTROL, angle)

    def set_joint_velocity(self, unit: str, name: str, velocity: float) -> Optional[core.KinematicUnitError]:
        return self._set(unit, name, ControlMode.VELOCITY_CONTROL, velocity)

    def set_joint_torque(self, unit: str, name: str, torque: float) -> Optional[core.KinematicUnitError]:
        return self._set(unit, name, ControlMode.TORQUE_CONTROL, torque)

    def _set(self, unit: str, name: str, control_mode: ControlMode, value: float) -> Optional[core.KinematicUnitError]:
        if unit != 'FakeKinematicUnit':
            raise KeyError(unit)
        joint = self.fake_joints[name]
        match control_mode:
            case ControlMode.POSITION_CONTROL:
                if value < -10 or value > 10:
                    return core.OutOfRangeException(violation=[
                        core.RangeViolation(range_from=-10.0,
                                            range_to=10.0,
                                            actual_value=value)
                    ])
                joint.angle = value
                self.service.core.update_joint_angle(unit, name, value)
            case ControlMode.VELOCITY_CONTROL:
                joint.velocity = value
                self.service.core.update_joint_velocity(unit, name, value)
            case ControlMode.TORQUE_CONTROL:
                joint.torque = value
                self.service.core.update_joint_torque(unit, name, value)

    def make_joint(self, name: str) -> Joint:
        return _make_fake_joint()


def _random_choice(p: float):
    return random.random() < p


def _make_fake_joint():
    j = Joint()
    if _random_choice(0.7):
        j.angle = random.gauss(sigma=30)
    if _random_choice(0.7):
        j.velocity = random.gauss(sigma=10)
    if _random_choice(0.7):
        j.torque = random.gauss(sigma=10)
    if _random_choice(0.3):
        j.acceleration = random.gauss(sigma=10)
    if _random_choice(0.3):
        j.current = abs(random.gauss(sigma=10))
    if _random_choice(0.3):
        j.motorTemperature = random.gauss(mu=50, sigma=5)
    if _random_choice(0.7):
        j.controlMode = random.choice([
            ControlMode.DISABLED,
            ControlMode.POSITION_CONTROL,
            ControlMode.VELOCITY_CONTROL,
            ControlMode.TORQUE_CONTROL,
            ControlMode.POSITION_VELOCITY_CONTROL,
        ])
    if _random_choice(0.3):
        j.status = JointStatus(
            operation=random.choice([
                OperationStatus.OFFLINE,
                OperationStatus.ONLINE,
                OperationStatus.INITIALIZED,
            ]),
            error=random.choice([
                ErrorStatus.OK,
                ErrorStatus.WARNING,
                ErrorStatus.ERROR,
            ]),
            enabled=_random_choice(0.8),
            emergency_stop=_random_choice(0.1),
        )
    return j


class MockKinematicUnitService(Service):
    core: KinematicUnitCore
    simox: Simox
    controller: FakeKinematicUnitController

    def __init__(self, controller: Callable[['MockKinematicUnitService'], FakeKinematicUnitController] = FakeKinematicUnitController):
        super().__init__("kinematic", None)
        self.controller = controller(self)
        self.simox = Simox()
        self.core = KinematicUnitCore(self)
        self.core.setup()

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint

    def send_updates(self) -> None:
        name = random.choice(list(self.controller.fake_joints.keys()))
        self.update_joint('FakeKinematicUnit', name,
                          self.controller.make_joint(name))

    def update_joint(self, unit: str, name: str, joint: Joint):
        self.controller.fake_joints[name] = joint
        if joint.angle is not None:
            self.core.update_joint_angle(unit, name, joint.angle)
        if joint.velocity is not None:
            self.core.update_joint_velocity(unit, name, joint.velocity)
        if joint.torque is not None:
            self.core.update_joint_torque(unit, name, joint.torque)
        if joint.acceleration is not None:
            self.core.update_joint_acceleration(unit, name, joint.acceleration)
        if joint.current is not None:
            self.core.update_joint_current(unit, name, joint.current)
        if joint.motorTemperature is not None:
            self.core.update_joint_motor_temperature(
                unit, name, joint.motorTemperature)
        self.core.update_joint_control_mode(unit, name, joint.controlMode)
        if joint.status is not None:
            self.core.update_joint_status(unit, name, joint.status)


def test_initial_joints():
    service = MockKinematicUnitService()

    assert has_joints(
        service.core.joints['FakeKinematicUnit'], service.controller.fake_joints)


def test_update():
    class NoValuesController(FakeKinematicUnitController):
        def make_joint(self, name: str) -> Joint:
            return Joint()

    service = MockKinematicUnitService(NoValuesController)

    joint_name = 'Fake Joint 1'
    joint = _make_fake_joint()
    service.update_joint('FakeKinematicUnit', joint_name, joint)
    assert service.core.joints['FakeKinematicUnit'][joint_name][1] == joint

    service.core.update_joint_angle('FakeKinematicUnit', joint_name, 42.0)
    assert service.core.joints['FakeKinematicUnit'][joint_name][1].angle == 42.0

    webserver = Webserver(services=[service], use_auth=False)
    with webserver.app.test_client() as test_client:
        response = test_client.get(
            '/api/v1/kinematic/FakeKinematicUnit/joint/Fake Joint 2/velocity')
        print(response.text)
        assert response.status_code == 204


def test_webserver():
    BASE_URL = '/api/v1/kinematic'
    UNIT_URL = f'{BASE_URL}/FakeKinematicUnit'
    JOINT_URL = f'{UNIT_URL}/joint/Fake Joint 1'
    service = MockKinematicUnitService()
    webserver = Webserver(services=[service], use_auth=False)
    with webserver.app.test_client() as test_client:
        response = test_client.get(f'{BASE_URL}/')
        assert response.status_code == 200
        assert json.loads(response.text) == ["FakeKinematicUnit"]
        response = test_client.get(f'{BASE_URL}/BadKinematicUnit/joints/')
        assert response.status_code == 404
        assert 'kinematicunit' in json.loads(response.text)['error'].lower()
        response = test_client.get(f'{UNIT_URL}/joints/')
        assert response.status_code == 200
        assert len(json.loads(response.text)) == 10
        response = test_client.get(f'{UNIT_URL}/joints/static')
        assert response.status_code == 200
        assert len(json.loads(response.text)) == 10
        response = test_client.get(f'{UNIT_URL}/joint/Bad Joint')
        assert response.status_code == 404
        assert 'joint' in json.loads(response.text)['error'].lower()
        response = test_client.get(f'{JOINT_URL}')
        assert response.status_code == 200
        json.loads(response.text)
        response = test_client.get(f'{JOINT_URL}/static')
        assert response.status_code == 200
        json.loads(response.text)
        for _ in range(10):
            service.send_updates()
        for parameter in 'angle', 'velocity', 'torque':
            response = test_client.put(f'{JOINT_URL}/{parameter}')
            assert response.status_code == 400
            response = test_client.put(
                f'{JOINT_URL}/{parameter}?{parameter}=5')
            assert response.status_code == 204
            response = test_client.get(f'{JOINT_URL}/{parameter}')
            assert response.status_code == 200
            assert json.loads(response.text) == 5


def has_joints(core_joints: dict[str, tuple[JointStatic, Joint]],
               real_joints: dict[str, Joint]) -> bool:
    return {name: joint for name, (static, joint) in core_joints.items()} == real_joints
