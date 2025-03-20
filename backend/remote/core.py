import json
from enum import Enum
from typing import Dict, List, Optional, Union

from flask import Blueprint, Response, request
from pydantic import BaseModel

from ..exceptions import ProxyUnreachableException
from ..service import Service


class ValueVariantType(Enum):
    EMPTY = 0
    BOOL = 1
    INT = 2
    FLOAT = 3
    STRING = 4
    VECTOR3 = 5
    MATRIX4 = 6


class ValueVariant(BaseModel):
    type: ValueVariantType
    value: Union[None, bool, int, float, str, List[float]]

    class Config:
        # Without this, floats get coerced into int or bool
        # See https://docs.pydantic.dev/usage/model_config/#smart-union
        smart_union = True


class WidgetState(BaseModel):
    hidden: bool
    disabled: bool


class Widget(BaseModel):
    name: str
    value: ValueVariant
    state: WidgetState
    children: List['Widget']
    kind: str = "Widget"

    def find_widget(self, name: str) -> Optional["Widget"]:
        if self.name == name:
            return self
        for child in self.children:
            widget = child.find_widget(name)
            if widget is not None:
                return widget
        return None


class WidgetWithToolTip(Widget):
    tooltip: str
    kind: str = "WidgetWithToolTip"


class HBoxLayout(Widget):
    kind: str = "HBoxLayout"


class VBoxLayout(Widget):
    kind: str = "VBoxLayout"


class SimpleGridLayoutSpanningChild(Widget):
    columns: int = 1
    kind: str = "SimpleGridLayoutSpanningChild"


class SimpleGridLayout(Widget):
    columns: int = 1
    kind: str = "SimpleGridLayout"


class GridLayoutData(BaseModel):
    row: int
    col: int
    span_row: int
    span_col: int


class GridLayout(Widget):
    children_layout_info: List[GridLayoutData]
    kind: str = "GridLayout"


class GroupBox(Widget):
    label: str
    collapsed: bool = False
    kind: str = "GroupBox"


class HSpacer(Widget):
    kind: str = "HSpacer"


class VSpacer(Widget):
    kind: str = "VSpacer"


class HLine(Widget):
    kind: str = "HLine"


class VLine(Widget):
    kind: str = "VLine"


class CheckBox(WidgetWithToolTip):
    label: str
    kind: str = "CheckBox"


class ToggleButton(WidgetWithToolTip):
    label: str
    kind: str = "ToggleButton"


class IntSpinBox(WidgetWithToolTip):
    min: int = 0
    max: int = 0
    kind: str = "IntSpinBox"


class IntSlider(WidgetWithToolTip):
    min: int = 0
    max: int = 0
    kind: str = "IntSlider"


class Button(WidgetWithToolTip):
    label: str
    kind: str = "Button"


class FloatSpinBox(WidgetWithToolTip):
    min: float = 0
    max: float = 0
    steps: int = 100
    decimals: int = 3
    kind: str = "FloatSpinBox"


class FloatSlider(WidgetWithToolTip):
    min: float = 0
    max: float = 0
    steps: int = 100
    kind: str = "FloatSlider"


class Label(WidgetWithToolTip):
    kind: str = "Label"


class LineEdit(WidgetWithToolTip):
    kind: str = "LineEdit"


class ComboBox(WidgetWithToolTip):
    options: List[str]
    kind: str = "ComboBox"


class Vector3f(BaseModel):
    x: float
    y: float
    z: float
    kind: str = "Vector3f"


class Vector3i(BaseModel):
    x: int
    y: int
    z: int
    kind: str = "Vector3i"


class Vector3fSpinBoxes(WidgetWithToolTip):
    min: Vector3f
    max: Vector3f
    steps: Vector3i
    decimals: Vector3i
    kind: str = "Vector3fSpinBoxes"


class PosRPYSpinBoxes(WidgetWithToolTip):
    min_pos: Vector3f
    max_pos: Vector3f
    min_rpy: Vector3f
    max_rpy: Vector3f
    steps_pos: Vector3i
    decimals_pos: Vector3i
    steps_rpy: Vector3i
    decimals_rpy: Vector3i
    kind: str = "PosRPYSpinBoxes"


class WidgetNames(BaseModel):
    __root__: list[str]


class RemoteGuiCore:
    blueprint: Blueprint
    service: Service
    tabs: Dict[str, Widget]

    def __init__(self, service: Service) -> None:
        self.service = service
        self.blueprint = Blueprint("remote", __name__)
        self.blueprint.route("/tabs/", methods=["GET"])(self.get_tabs)
        self.blueprint.route("/tab/<tab>", methods=["GET"])(self.get_tab)
        self.blueprint.route("/tab/<tab>", methods=["PUT"])(self.set_value)

    def update_tabs(self) -> None:
        try:
            self.tabs = self.service.controller.get_tabs()
        except ProxyUnreachableException:
            pass

    def update_tab(self, tab: str) -> None:
        try:
            self.tabs[tab] = self.service.controller.get_tab(tab)
        except ProxyUnreachableException:
            pass

    def find_widget(self, tab: str, widget: str) -> Widget | None:
        if tab not in self.tabs:
            self.update_tab(tab)
            if tab not in self.tabs:
                return None
        try:
            return self.tabs[tab].find_widget(widget)
        except KeyError:
            return None

    def update_value(self, tab: str, widget: str, value: ValueVariant) -> None:
        found_widget = self.find_widget(tab, widget)
        if found_widget is None:
            return None
        found_widget.value = value

    def update_widget_state(self,
                            tab: str, widget: str, state: WidgetState) -> None:
        found_widget = self.find_widget(tab, widget)
        if found_widget is None:
            return None
        found_widget.state = state

    # @blueprint.route("/tabs/")
    def get_tabs(self) -> Response:
        return Response(WidgetNames(__root__=[key for key in self.tabs]).json(), 200, content_type="application/json")

    # @blueprint.route("/tab/<tab>")
    def get_tab(self, tab: str) -> Response:
        if tab not in self.tabs:
            return Response(json.dumps({"error": f"Unknown tab {tab}"}), 404, content_type="application/json")
        return Response(self.tabs[tab].json(), 200, content_type="application/json")

    # @blueprint.route("/tab/<tab>", methods=["PUT"])
    def set_value(self, tab: str) -> Response:
        if tab not in self.tabs:
            return Response(json.dumps({"error": f"Unknown tab {tab}"}), 404, content_type="application/json")

        widget_name = request.args.get("widgetName")
        updated_value = request.args.get("updatedValue")
        updated_value_type = request.args.get("updatedValueType")

        if widget_name is None or updated_value is None or updated_value_type is None:
            return Response(json.dumps({"error": "Missing query parameters. Required: widgetName, updatedValue, updatedValueType"}), 400, content_type="application/json")

        try:
            value_type_enum = ValueVariantType[updated_value_type.upper()]
        except KeyError:
            return Response(json.dumps({"error": "Invalid value variant type. Try updatedValueType=STRING"}), 400, content_type="application/json")
        try:
            match value_type_enum:
                case ValueVariantType.FLOAT:
                    updated_value = float(updated_value)
                case ValueVariantType.INT:
                    updated_value = int(updated_value)
                case ValueVariantType.BOOL:
                    updated_value = updated_value.lower() == "true"
                case ValueVariantType.VECTOR3 | ValueVariantType.MATRIX4:
                    # parse number array
                    values = []
                    for value in updated_value.split(","):
                        values.append(float(value))
                    updated_value = values
        except ValueError:
            return Response(json.dumps({"error": f"Invalid value for variant type {value_type_enum.name}"}), 400, content_type='application/json')

        new_value = ValueVariant(type=value_type_enum, value=updated_value)
        self.service.controller.set_value(tab, widget_name, new_value)
        return Response("", 204)
