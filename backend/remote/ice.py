from typing import Any, Dict, List, Optional, Union

import armarx
import Ice
import IceStorm

from ..ice import IceRequest
from ..service import Service
from .core import (Button, CheckBox, ComboBox, FloatSlider, FloatSpinBox,
                   GridLayout, GridLayoutData, GroupBox, HBoxLayout, HLine,
                   HSpacer, IntSlider, IntSpinBox, Label, LineEdit,
                   PosRPYSpinBoxes, SimpleGridLayout,
                   SimpleGridLayoutSpanningChild, ToggleButton, ValueVariant,
                   ValueVariantType, VBoxLayout, Vector3f, Vector3fSpinBoxes,
                   Vector3i, VLine, VSpacer, Widget, WidgetState,
                   WidgetWithToolTip)

VV_TYPE_ICE_TO_CORE = {
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_EMPTY: ValueVariantType.EMPTY,
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_BOOL: ValueVariantType.BOOL,
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_INT: ValueVariantType.INT,
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_FLOAT: ValueVariantType.FLOAT,
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_STRING: ValueVariantType.STRING,
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_VECTOR3: ValueVariantType.VECTOR3,
    armarx.RemoteGui.ValueVariantType.VALUE_VARIANT_MATRIX4: ValueVariantType.MATRIX4,
}

VV_TYPE_CORE_TO_ICE = dict([(value, key)
                           for key, value in VV_TYPE_ICE_TO_CORE.items()])


def widget_ice_to_core(widget: Any, value_dict: Dict[str, Any], state_dict: Dict[str, Any]) -> Widget:
    children: list[Widget] = []
    for child in widget.children:
        children.append(widget_ice_to_core(child, value_dict, state_dict))

    name = widget.name
    value: ValueVariant = value_variant_ice_to_core(value_dict[widget.name])
    state = WidgetState(
        hidden=state_dict[widget.name].hidden,
        disabled=state_dict[widget.name].disabled
    )

    tooltip = ""
    if isinstance(widget, armarx.RemoteGui.WidgetWithToolTip):
        tooltip = widget.toolTip

    match type(widget):
        case armarx.RemoteGui.Widget:
            return Widget(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.WidgetWithToolTip:
            return WidgetWithToolTip(
                name=name, value=value, state=state, children=children, tooltip=tooltip
            )
        case armarx.RemoteGui.HBoxLayout:
            return HBoxLayout(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.VBoxLayout:
            return VBoxLayout(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.SimpleGridLayoutSpanningChild:
            return SimpleGridLayoutSpanningChild(
                name=name, value=value, state=state, children=children,
                columns=widget.columns
            )
        case armarx.RemoteGui.SimpleGridLayout:
            return SimpleGridLayout(
                name=name, value=value, state=state, children=children,
                columns=widget.columns
            )
        case armarx.RemoteGui.GridLayout:
            children_layout_info: list[GridLayoutData] = []
            for layout_info in widget.childrenLayoutInfo:
                children_layout_info.append(
                    layout_data_ice_to_core(layout_info))
            return GridLayout(
                name=name, value=value, state=state, children=children,
                children_layout_info=children_layout_info
            )
        case armarx.RemoteGui.GroupBox:
            return GroupBox(
                name=name, value=value, state=state, children=children,
                label=widget.label,
                collapsed=widget.collapsed,
            )
        case armarx.RemoteGui.HSpacer:
            return HSpacer(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.VSpacer:
            return VSpacer(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.HLine:
            return HLine(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.VLine:
            return VLine(
                name=name, value=value, state=state, children=children,
            )
        case armarx.RemoteGui.CheckBox:
            return CheckBox(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                label=widget.label
            )
        case armarx.RemoteGui.ToggleButton:
            return ToggleButton(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                label=widget.label
            )
        case armarx.RemoteGui.IntSpinBox:
            return IntSpinBox(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                min=widget.min,
                max=widget.max,
            )
        case armarx.RemoteGui.IntSlider:
            return IntSlider(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                min=widget.min,
                max=widget.max,
            )
        case armarx.RemoteGui.Button:
            return Button(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                label=widget.label
            )
        case armarx.RemoteGui.FloatSpinBox:
            return FloatSpinBox(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                min=widget.min,
                max=widget.max,
                steps=widget.steps,
                decimals=widget.decimals
            )
        case armarx.RemoteGui.FloatSlider:
            return FloatSlider(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                min=widget.min,
                max=widget.max,
                steps=widget.steps,
            )
        case armarx.RemoteGui.Label:
            return Label(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
            )
        case armarx.RemoteGui.LineEdit:
            return LineEdit(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
            )
        case armarx.RemoteGui.ComboBox:
            return ComboBox(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                options=widget.options
            )
        case armarx.RemoteGui.Vector3fSpinBoxes:
            return Vector3fSpinBoxes(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                min=vector_3f_ice_to_core(widget.min),
                max=vector_3f_ice_to_core(widget.max),
                steps=vector_3i_ice_to_core(widget.steps),
                decimals=vector_3i_ice_to_core(widget.decimals),
            )
        case armarx.RemoteGui.PosRPYSpinBoxes:
            return PosRPYSpinBoxes(
                name=name, value=value, state=state, children=children, tooltip=tooltip,
                min_pos=vector_3f_ice_to_core(widget.minPos),
                max_pos=vector_3f_ice_to_core(widget.maxPos),
                min_rpy=vector_3f_ice_to_core(widget.minRPY),
                max_rpy=vector_3f_ice_to_core(widget.maxRPY),
                steps_pos=vector_3i_ice_to_core(widget.stepsPos),
                decimals_pos=vector_3i_ice_to_core(widget.decimalsPos),
                steps_rpy=vector_3i_ice_to_core(widget.stepsRPY),
                decimals_rpy=vector_3i_ice_to_core(widget.decimalsRPY),
            )
        case _:
            print(f"Error parsing type {type(widget)}, missing case?")
            return Widget(
                name=name, value=value, state=state, children=children
            )


def value_variant_ice_to_core(value: Any) -> ValueVariant:
    core_type: ValueVariantType = VV_TYPE_ICE_TO_CORE[value.type]
    used_value: Union[None, bool, int, float, str, List[float]] = None
    if core_type == ValueVariantType.INT:
        used_value = value.i
    elif core_type == ValueVariantType.FLOAT:
        used_value = value.f
    elif core_type == ValueVariantType.STRING:
        used_value = value.s
    elif core_type == ValueVariantType.VECTOR3 or core_type == ValueVariantType.MATRIX4:
        used_value = value.v
    elif core_type == ValueVariantType.BOOL:
        used_value = bool(value.i)
    elif core_type != ValueVariantType.EMPTY:
        # Type is none of the types we know, not even empty
        print(f"Unknown value: {value}")
    return ValueVariant(type=core_type, value=used_value)


def value_variant_core_to_ice(value: ValueVariant) -> Any:
    base = armarx.RemoteGui.ValueVariant(
        type=VV_TYPE_CORE_TO_ICE[value.type],
        i=0,
        f=0.0,
        s="",
        v=[]
    )
    core_type = value.type
    if core_type == ValueVariantType.INT:
        base.i = value.value
    elif core_type == ValueVariantType.FLOAT:
        base.f = value.value
    elif core_type == ValueVariantType.STRING:
        base.s = value.value
    elif core_type == ValueVariantType.VECTOR3 or core_type == ValueVariantType.MATRIX4:
        base.v = value.value
    elif core_type == ValueVariantType.BOOL:
        base.i = 1 if value.value else 0

    return base


def layout_data_ice_to_core(grid_layout_data: Any) -> GridLayoutData:
    return GridLayoutData(
        row=grid_layout_data.row,
        col=grid_layout_data.col,
        span_row=grid_layout_data.spanRow,
        span_col=grid_layout_data.spanCol,
    )


def vector_3i_ice_to_core(vector: Any) -> Vector3i:
    return Vector3i(
        x=vector.x,
        y=vector.y,
        z=vector.z,
    )


def vector_3f_ice_to_core(vector: Any) -> Vector3f:
    return Vector3f(
        x=vector.x,
        y=vector.y,
        z=vector.z,
    )


class RemoteGuiReceiver(armarx.RemoteGuiListenerInterface):
    service: Service  # RemoteGuiService

    def __init__(self, service: Service):
        self.service = service

        topic_name = service.controller.get_topic_name()
        if topic_name is None:
            return

        topicMgrProxy = service.communicator.stringToProxy(
            "IceStorm/TopicManager")
        topicManager = IceStorm.TopicManagerPrx.checkedCast(topicMgrProxy)
        adapter = service.communicator.createObjectAdapterWithEndpoints(
            "RemoteGuiAdapter", "tcp")

        proxy = adapter.addWithUUID(self).ice_oneway()
        adapter.activate()

        topic = topicManager.retrieve(topic_name)
        topic.subscribeAndGetPublisher({}, proxy)

    def reportTabChanged(self, tab: str, current: Ice.Current) -> None:
        self.service.core.update_tab(tab)

    def reportTabsRemoved(self, current: Ice.Current) -> None:
        self.service.core.update_tabs()

    def reportStateChanged(self,
                           tab: str,
                           valueDelta: Dict[str, armarx.RemoteGui.ValueVariant],
                           current: Ice.Current,
                           ) -> None:
        for widget_name, ice_value in valueDelta.items():
            value = value_variant_ice_to_core(ice_value)
            self.service.core.update_value(tab, widget_name, value)

    def reportWidgetChanged(self,
                            tab: str,
                            stateDelta: Dict[str, armarx.RemoteGui.WidgetState],
                            current: Ice.Current,
                            ) -> None:
        for widget_name, ice_state in stateDelta.items():
            self.service.core.update_widget_state(tab, widget_name, WidgetState(
                hidden=ice_state.hidden,
                disabled=ice_state.disabled
            ))


class RemoteGuiController:
    proxy: armarx.RemoteGuiInterfacePrx

    def __init__(self, service: Service) -> None:
        proxies: dict[str, Any] = service.find_proxies(
            search_string="*", proxy_type=armarx.RemoteGuiInterfacePrx)
        if len(proxies) == 1:
            _, self.proxy = proxies.popitem()
        else:
            print(f"RemoteGui: Proxies could not be read. proxies={proxies}")
            self.proxy = None

    """Used by RemoteGuiReceiver to listen to the topic."""

    def get_topic_name(self) -> Optional[str]:
        if self.proxy is None:
            return None
        with IceRequest():
            return self.proxy.getTopicName()

    def get_tabs(self) -> Dict[str, Widget]:
        if self.proxy is None:
            return {}

        with IceRequest():
            values: Dict[str, Dict[str, Any]
                         ] = self.proxy.getValuesForAllTabs()
            states: Dict[str, Dict[str, Any]] = self.proxy.getTabStates()
            tabs: Dict[str, Any] = self.proxy.getTabs()

        parsed_tabs: Dict[str, Widget] = {}

        for tab_name, tab in tabs.items():
            parsed_tabs[tab_name] = widget_ice_to_core(
                tab, values[tab_name], states[tab_name])

        return parsed_tabs

    def get_tab(self, tab: str) -> Widget:
        if self.proxy is None:
            raise KeyError(tab)

        with IceRequest():
            values: Dict[str, Any] = self.proxy.getValues(tab)
            states: Dict[str, Any] = self.proxy.getWidgetStates(tab)
            tabs: Dict[str, Any] = self.proxy.getTabs()

        return widget_ice_to_core(tabs[tab], values, states)

    def set_value(self,
                  tab: str, widget_name: str, new_value: ValueVariant) -> None:
        if self.proxy is not None:
            with IceRequest():
                self.proxy.setValue(
                    tab, widget_name, value_variant_core_to_ice(new_value))
