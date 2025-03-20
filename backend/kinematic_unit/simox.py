
import math
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterator, Optional

from .core import JointStatic, JointType

UNIT_FACTORS_ANGLE = {
    'deg': 1,
    'degree': 1,
    'rad': math.tau / 360,
    'radian': math.tau / 360,
}

UNIT_FACTORS_LENGTH = {
    'mm': 1,
    'millimeter': 1,
    'm': 1000,
    'meter': 1000,
}


class SimoxError(Exception):
    pass


class Simox:
    def get_all_joints(self, path: Path, nodeset: str | set[str]) -> Iterator[tuple[str, JointStatic]]:
        xml = ET.parse(path)
        robot = xml.getroot()
        assert robot.tag.lower() == 'robot'
        nodes = {}
        nodeset_elem = None
        for elem in robot:
            name = elem.get('name')
            match elem.tag.lower():
                case 'robotnode':
                    assert name is not None
                    nodes[name] = elem
                case 'robotnodeset':
                    if name == nodeset:
                        nodeset_elem = elem

        if isinstance(nodeset, set):
            nodeset_nodes = nodeset
        else:
            if nodeset_elem is None:
                raise SimoxError(f'NodeSet {nodeset} not found in {path}')
            nodeset_nodes = {
                elem.get('name')
                for elem in nodeset_elem
                if elem.tag.lower() == 'node'
            }

        def process_node(name: str) -> Iterator[tuple[str, JointStatic]]:
            elem = nodes[name]
            for child in elem:
                match child.tag.lower():
                    case 'joint':
                        if name in nodeset_nodes:
                            joint = process_joint(child)
                            if joint is not None:
                                yield name, joint
                    case 'child': yield from process_node(child.get('name'))
                    case 'childfromrobot':
                        file = find_child(child, 'File')
                        yield from self.get_all_joints(path.parent / file.text, nodeset_nodes)

        def process_joint(joint: ET.Element) -> Optional[JointStatic]:
            type = joint.get('type')
            if type == 'fixed':
                return None
            type = JointType[type.upper()]
            limits = find_child(joint, 'limits')
            if limits is None:
                limits = ET.Element('limits')
            match type:
                case JointType.REVOLUTE:
                    unit_factor = UNIT_FACTORS_ANGLE[limits.get('unit', 'rad')]
                    default = (-math.pi, math.pi)
                case JointType.PRISMATIC:
                    unit_factor = UNIT_FACTORS_LENGTH[limits.get('unit', 'mm')]
                    default = (-1000.0, 1000.0)
            limitLo = float(limits.get('lo', default[0])) / unit_factor
            limitHi = float(limits.get('hi', default[1])) / unit_factor
            return JointStatic(type=type, limitLo=limitLo, limitHi=limitHi)

        return process_node(robot.get('RootNode'))


def find_child(elem: ET.Element, tag: str) -> Optional[ET.Element]:
    tag = tag.casefold()
    for child in elem:
        if child.tag.casefold() == tag:
            return child
    return None
