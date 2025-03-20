
import math
from collections import defaultdict
from pathlib import Path
from typing import Callable, Dict, Iterator, List, Optional, Tuple, TypeVar

import armarx
import Ice
import IceStorm

from .. import cmake
from ..ice import IceRequest
from . import core
from .core import Joint, JointStatus, JointType, KinematicUnitError

T = TypeVar('T')

CONTROL_MODE_ICE_TO_CORE = {
    armarx.ControlMode.eDisabled: core.ControlMode.DISABLED,
    armarx.ControlMode.eUnknown: core.ControlMode.UNKNOWN,
    armarx.ControlMode.ePositionControl: core.ControlMode.POSITION_CONTROL,
    armarx.ControlMode.eVelocityControl: core.ControlMode.VELOCITY_CONTROL,
    armarx.ControlMode.eTorqueControl: core.ControlMode.TORQUE_CONTROL,
    armarx.ControlMode.ePositionVelocityControl: core.ControlMode.POSITION_VELOCITY_CONTROL,
}

OPERATION_STATUS_ICE_TO_CORE = {
    armarx.OperationStatus.eOffline: core.OperationStatus.OFFLINE,
    armarx.OperationStatus.eOnline: core.OperationStatus.ONLINE,
    armarx.OperationStatus.eInitialized: core.OperationStatus.INITIALIZED,
}

ERROR_STATUS_ICE_TO_CORE = {
    armarx.ErrorStatus.eOk: core.ErrorStatus.OK,
    armarx.ErrorStatus.eWarning: core.ErrorStatus.WARNING,
    armarx.ErrorStatus.eError: core.ErrorStatus.ERROR,
}


class JointUpdateReceiver(armarx.KinematicUnitListener):
    service: 'KinematicUnitService'
    unit: str

    def __init__(self, service: 'KinematicUnitService', unit: str):
        super().__init__()
        self.service = service
        self.unit = unit
        adapter = service.communicator.createObjectAdapterWithEndpoints(
            "", "tcp")
        proxy = adapter.addWithUUID(self).ice_oneway()
        adapter.activate()
        topic_manager_obj = service.communicator.stringToProxy(
            "IceStorm/TopicManager")
        topic_manager = IceStorm.TopicManagerPrx.checkedCast(topic_manager_obj)
        topic = topic_manager.retrieve(service.controller.get_topic(unit))
        topic.subscribeAndGetPublisher({}, proxy)

    def reportControlModeChanged(self, joint_modes: Dict[str, armarx.ControlMode], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, ice_control_mode in joint_modes.items():
            core_control_mode = CONTROL_MODE_ICE_TO_CORE[ice_control_mode]

            self.service.core.update_joint_control_mode(
                self.unit, name, core_control_mode)

    def reportJointAngles(self, joint_angles: Dict[str, float], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, angle in joint_angles.items():
            if self.service.core.is_revolute(self.unit, name):
                angle *= 360 / math.tau
            self.service.core.update_joint_angle(self.unit, name, angle)

    def reportJointVelocities(self, joint_velocities: Dict[str, float], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, velocity in joint_velocities.items():
            if self.service.core.is_revolute(self.unit, name):
                velocity *= 360 / math.tau
            self.service.core.update_joint_velocity(self.unit, name, velocity)

    def reportJointTorques(self, joint_torques: Dict[str, float], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, torque in joint_torques.items():
            self.service.core.update_joint_torque(self.unit, name, torque)

    def reportJointAccelerations(self, joint_accelerations: Dict[str, float], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, acceleration in joint_accelerations.items():
            if self.service.core.is_revolute(self.unit, name):
                acceleration *= 360 / math.tau
            self.service.core.update_joint_acceleration(
                self.unit, name, acceleration)

    def reportJointCurrents(self, joint_currents: Dict[str, float], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, current in joint_currents.items():
            self.service.core.update_joint_current(self.unit, name, current)

    def reportJointMotorTemperatures(self, joint_motor_temperatures: Dict[str, float], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, motor_temperature in joint_motor_temperatures.items():
            self.service.core.update_joint_motor_temperature(
                self.unit, name, motor_temperature)

    def reportJointStatuses(self, joint_statuses: Dict[str, armarx.JointStatus], timestamp: int, value_changed: bool, current: Ice.Current):
        for name, ice_status in joint_statuses.items():
            self.service.core.update_joint_status(
                self.unit, name, _translate_joint_status(ice_status))


class KinematicUnitController:
    service: 'KinematicUnitService'
    proxies: Dict[str, armarx.KinematicUnitInterfacePrx]

    def __init__(self, service: "KinematicUnitService"):
        self.service = service
        self.proxies = service.find_proxies(
            "*", armarx.KinematicUnitInterfacePrx)

    def get_units(self) -> List[str]:
        return list(self.proxies.keys())

    def get_topic(self, unit: str) -> str:
        with IceRequest():
            return self.proxies[unit].getReportTopicName()

    def get_robot_filename(self, unit: str) -> Optional[Path]:
        with IceRequest():
            filename = Path(self.proxies[unit].getRobotFilename())
            packages = self.proxies[unit].getArmarXPackages()
        for package in packages:
            for data_dir in cmake.get_data_path(package):
                f = data_dir / filename
                if f.exists():
                    return f

    def get_robot_nodeset(self, unit: str) -> str:
        with IceRequest():
            return self.proxies[unit].getRobotNodeSetName()

    def get_joint_data(self, unit: str, name: str, type: JointType) -> Optional[Joint]:
        joint = None

        def get_joint(key: str) -> Optional[Joint]:
            nonlocal joint
            if key != name:
                return None
            if joint is None:
                joint = Joint()
            return joint
        self._collect_joint_info(unit, get_joint)
        return joint

    def get_all_joint_data(self, unit: str) -> Dict[str, Joint]:
        joints = defaultdict(Joint)
        self._collect_joint_info(unit, lambda name: joints[name])
        return dict(joints)

    def _collect_joint_info(self,
                            unit: str,
                            get_joint: Callable[[str], Optional[Joint]],
                            ) -> None:
        try:
            proxy = self.proxies[unit]
        except KeyError:
            return

        def helper(dict: Dict[str, T]) -> Iterator[Tuple[str, Joint, T]]:
            for name, value in dict.items():
                joint = get_joint(name)
                if joint is not None:
                    yield name, joint, value

        with IceRequest():
            debug_info = proxy.getDebugInfo()
        for name, joint, mode in helper(debug_info.jointModes):
            joint.controlMode = CONTROL_MODE_ICE_TO_CORE[mode]
        for name, joint, angle in helper(debug_info.jointAngles):
            if self.service.core.is_revolute(unit, name):
                angle *= 360 / math.tau
            joint.angle = angle
        for name, joint, velocity in helper(debug_info.jointVelocities):
            if self.service.core.is_revolute(unit, name):
                velocity *= 360 / math.tau
            joint.velocity = velocity
        for name, joint, acceleration in helper(debug_info.jointAccelerations):
            if self.service.core.is_revolute(unit, name):
                acceleration *= 360 / math.tau
            joint.acceleration = acceleration
        for name, joint, torque in helper(debug_info.jointTorques):
            joint.torque = torque
        for name, joint, current in helper(debug_info.jointCurrents):
            joint.current = current
        for name, joint, temp in helper(debug_info.jointMotorTemperatures):
            joint.motorTemperature = temp
        for name, joint, status in helper(debug_info.jointStatus):
            joint.status = _translate_joint_status(status)

        with IceRequest():
            control_modes = proxy.getControlModes()
        for name, joint, mode in helper(control_modes):
            joint.controlMode = CONTROL_MODE_ICE_TO_CORE[mode]

    def set_joint_angle(self, unit: str, name: str, angle: float) -> Optional[KinematicUnitError]:
        if self.service.core.is_revolute(unit, name):
            angle /= 360 / math.tau
        return self._control_joint(unit, name,
                                   armarx.ControlMode.ePositionControl,
                                   lambda proxy: proxy.setJointAngles({name: angle}))

    def set_joint_velocity(self, unit: str, name: str, velocity: float) -> Optional[KinematicUnitError]:
        if self.service.core.is_revolute(unit, name):
            velocity /= 360 / math.tau
        return self._control_joint(unit, name,
                                   armarx.ControlMode.eVelocityControl,
                                   lambda proxy: proxy.setJointVelocities({name: velocity}))

    def set_joint_torque(self, unit: str, name: str, torque: float) -> Optional[KinematicUnitError]:
        return self._control_joint(unit, name,
                                   armarx.ControlMode.eTorqueControl,
                                   lambda proxy: proxy.setJointTorques({name: torque}))

    def _control_joint(self,
                       unit: str,
                       joint_name: str,
                       control_mode: armarx.ControlMode,
                       run: Callable[[armarx.KinematicUnitInterfacePrx], None],
                       ) -> Optional[KinematicUnitError]:
        proxy = self.proxies[unit]
        try:
            with IceRequest():
                proxy.switchControlMode({joint_name: control_mode})
                run(proxy)
        except armarx.ControlModeNotSupportedException as error:
            return core.ControlModeNotSupportedException(
                mode=CONTROL_MODE_ICE_TO_CORE[error.mode],
            )
        except armarx.OutOfRangeException as error:
            return core.OutOfRangeException(violation=[
                RangeViolation(
                    range_from=rv.rangeFrom,
                    range_to=rv.rangeTo,
                    actual_value=rv.actualValue,
                )
                for rv in error.violation
            ])
        else:
            return None


def _translate_joint_status(joint_status: armarx.JointStatus) -> JointStatus:
    return JointStatus(
        operation=OPERATION_STATUS_ICE_TO_CORE[joint_status.operation],
        error=ERROR_STATUS_ICE_TO_CORE[joint_status.error],
        enabled=joint_status.enabled,
        emergency_stop=joint_status.emergencyStop,
    )
