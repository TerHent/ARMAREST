
import random
from typing import Dict, List, Optional, Tuple

from flask import Blueprint

from backend.remote import core

from ..service import Service
from .utils import random_str


def random_tab() -> core.Widget:
    test_button = core.Button(name="TestButton", value=value_bool(), state=core.WidgetState(hidden=False, disabled=False),
                              children=[], label='TestButton' +
                              random_str(10),
                              tooltip='test button tooltop')
    return core.VBoxLayout(name='root', value=value_empty(),
                           state=core.WidgetState(
                               hidden=False, disabled=False),
                           children=[test_button] + [random_widget() for i in range(10)])


def random_widget() -> core.Widget:
    k = random.randrange(21)
    name = 'w' + random_str(10**9)
    state = core.WidgetState(hidden=random.random() < 0.1,
                             disabled=random.random() < 0.1)
    if k == 0:
        return core.VBoxLayout(name=name, value=value_empty(),
                               state=state, children=random_children())
    elif k == 1:
        return core.HBoxLayout(name=name, value=value_empty(),
                               state=state, children=random_children())
    elif k == 2:
        return core.SimpleGridLayoutSpanningChild(
            name=name, value=value_empty(), state=state,
            children=random_children(), columns=random.randrange(1, 3))
    elif k == 3:
        return core.SimpleGridLayout(
            name=name, value=value_empty(), state=state,
            children=random_children(), columns=random.randrange(1, 3))
    elif k == 4:
        return core.GridLayout(name=name, value=value_empty(), state=state,
                               children=[random_widget() for i in range(3)],
                               children_layout_info=[
            core.GridLayoutData(row=0, col=0, span_row=2, span_col=2),
            core.GridLayoutData(row=2, col=0, span_row=3, span_col=1),
            core.GridLayoutData(row=0, col=2, span_row=1, span_col=1),
        ])
    elif k == 5:
        return core.GroupBox(name=name, value=value_empty(), state=state,
                             children=random_children(), label='Group ' + random_str(10))
    elif k == 6:
        return core.HSpacer(name=name, value=value_empty(), state=state,
                            children=[])
    elif k == 7:
        return core.VSpacer(name=name, value=value_empty(), state=state,
                            children=[])
    elif k == 8:
        return core.HLine(name=name, value=value_empty(), state=state,
                          children=[])
    elif k == 9:
        return core.VLine(name=name, value=value_empty(), state=state,
                          children=[])
    elif k == 10:
        return core.CheckBox(name=name, value=value_bool(), state=state,
                             children=[], label='Checkbox ' + random_str(10),
                             tooltip='checkbox tooltip')
    elif k == 11:
        return core.ToggleButton(name=name, value=value_bool(), state=state,
                                 children=[], label='ToggleButton ' +
                                 random_str(10),
                                 tooltip='togglebutton tooltip')
    elif k == 12 or k == 13:
        min = random.randrange(-20, 20)
        max = random.randrange(min + 1, 40)
        f = core.IntSpinBox if k == 12 else core.IntSlider
        return f(name=name, value=value_int(min, max), state=state,
                 children=[], min=min, max=max, tooltip='int tooltip')
    elif k == 14:
        return core.Button(name=name, value=value_int(0, 10), state=state,
                           children=[], label='Button ' + random_str(10),
                           tooltip='button tooltip')
    elif k == 15:
        min = random.uniform(-20, 20)
        max = random.uniform(min, 40)
        steps = random.randrange(20, 100)
        return core.FloatSpinBox(name=name, value=value_float(min, max, steps),
                                 state=state, children=[], min=min, max=max, steps=steps,
                                 decimals=random.randrange(5), tooltip='float tooltip')
    elif k == 16:
        min = random.uniform(-20, 20)
        max = random.uniform(min, 40)
        steps = random.randrange(20, 100)
        return core.FloatSlider(name=name, value=value_float(min, max, steps),
                                state=state, children=[], min=min, max=max, steps=steps,
                                tooltip='float tooltip')
    elif k == 17:
        return core.Label(name=name, value=value_string('Label'),
                          state=state, children=[], tooltip='label tooltip')
    elif k == 18:
        return core.LineEdit(name=name, value=value_string('LineEdit'),
                             state=state, children=[], tooltip='lineedit tooltip')
    elif k == 19:
        return core.ComboBox(name=name, value=value_string('ComboBox'),
                             state=state, children=[], tooltip='combo tooltip',
                             options=[f'ComboBox {i}' for i in range(11)])
    elif k == 20:
        min = core.Vector3f(x=random.uniform(-20, 20),
                            y=random.uniform(-20, 20),
                            z=random.uniform(-20, 20))
        max = core.Vector3f(x=random.uniform(min.x, 40),
                            y=random.uniform(min.y, 40),
                            z=random.uniform(min.z, 40))
        steps = core.Vector3i(x=random.randrange(20, 100),
                              y=random.randrange(20, 100),
                              z=random.randrange(20, 100))
        decimals = core.Vector3i(x=random.randrange(5),
                                 y=random.randrange(5),
                                 z=random.randrange(5))
        value = [random_float_steps(min.x, max.x, steps.x),
                 random_float_steps(min.y, max.y, steps.y),
                 random_float_steps(min.z, max.z, steps.z)]
        return core.Vector3fSpinBoxes(name=name,
                                      value=core.ValueVariant(type=core.ValueVariantType.VECTOR3,
                                                              value=value),
                                      state=state, children=[], min=min, max=max, steps=steps,
                                      decimals=decimals, tooltip='vector3 tooltip')


def random_children() -> List[core.Widget]:
    n = random.randrange(5)
    return [random_widget() for i in range(n)]


def value_empty() -> core.ValueVariant:
    return core.ValueVariant(type=core.ValueVariantType.EMPTY, value=None)


def value_bool() -> core.ValueVariant:
    return core.ValueVariant(type=core.ValueVariantType.BOOL,
                             value=random.random() < 0.5)


def value_int(min: int, max: int) -> core.ValueVariant:
    return core.ValueVariant(type=core.ValueVariantType.INT,
                             value=random.randrange(min, max + 1))


def random_float_steps(min: float, max: float, steps: int):
    return min + (max - min) * random.randrange(0, steps + 1) / steps


def value_float(min: float, max: float, steps: int) -> core.ValueVariant:
    return core.ValueVariant(type=core.ValueVariantType.FLOAT,
                             value=random_float_steps(min, max, steps))


def value_string(kind: str) -> core.ValueVariant:
    return core.ValueVariant(type=core.ValueVariantType.STRING,
                             value=kind + ' ' + random_str(10))


def set_widget_value(widget: core.Widget, name: str, value: core.ValueVariant):
    if widget.name == name:
        widget.value = value.copy()
    for child in widget.children:
        set_widget_value(child, name, value.copy())


class FakeRemoteGuiController:
    service: 'MockRemoteGuiService'

    def __init__(self, service: 'MockRemoteGuiService'):
        self.service = service

    def get_tabs(self) -> Dict[str, core.Widget]:
        tabs = {'MainTab': self.service.main_tab.copy(deep=True)}
        if self.service.extra_tab is not None:
            tabs['ExtraTab'] = self.service.extra_tab.copy(deep=True)
        return tabs

    def get_tab(self, tab: str) -> core.Widget:
        if tab == 'MainTab':
            return self.service.main_tab.copy(deep=True)
        if tab == 'ExtraTab' and self.service.extra_tab is not None:
            return self.service.extra_tab.copy(deep=True)
        raise KeyError(tab)

    def set_value(self,
                  tab: str, widget_name: str, new_value: core.ValueVariant) -> None:
        if tab == 'MainTab':
            set_widget_value(self.service.main_tab, widget_name,
                             new_value.copy())
        elif tab == 'ExtraTab' and self.service.extra_tab is not None:
            set_widget_value(self.service.extra_tab, widget_name,
                             new_value.copy())
        self.service.state_updates.append((tab, widget_name, new_value.copy()))


TAB_CHANGE_INTERVAL: int = 300  # 30 seconds


class MockRemoteGuiService(Service):
    core: core.RemoteGuiCore
    controller: FakeRemoteGuiController
    main_tab: core.Widget
    extra_tab: Optional[core.Widget]
    state_updates: List[Tuple[str, str, core.ValueVariant]]
    countdown: int

    def __init__(self):
        super().__init__("remote", None)
        self.main_tab = random_tab()
        self.extra_tab = None
        self.state_updates = []
        self.countdown = TAB_CHANGE_INTERVAL
        self.controller = FakeRemoteGuiController(self)
        self.core = core.RemoteGuiCore(self)
        self.core.update_tabs()

    def get_api_blueprint(self) -> Blueprint:
        return self.core.blueprint

    def tick(self) -> None:
        self.random_update('MainTab', self.main_tab)
        for tab, widget, value in self.state_updates:
            self.core.update_value(tab, widget, value)
        self.state_updates = []

        self.countdown -= 1
        if self.countdown > 0:
            return
        self.countdown = TAB_CHANGE_INTERVAL

        self.main_tab = random_tab()
        self.core.update_tab('MainTab')
        if self.extra_tab is None:
            self.extra_tab = random_tab()
            self.core.update_tab('ExtraTab')
        else:
            self.extra_tab = None
            self.core.update_tabs()

    def random_update(self, tab: str, widget: core.Widget):
        while widget.children:
            widget = random.choice(widget.children)
        if widget.value.type == core.ValueVariantType.BOOL:
            widget.value.value = not widget.value.value
        elif (isinstance(widget, core.IntSpinBox) or
              isinstance(widget, core.IntSlider)):
            widget.value.value = random.randrange(widget.min, widget.max + 1)
        elif isinstance(widget, core.Button):
            widget.value.value += 1
        elif (isinstance(widget, core.FloatSpinBox) or
              isinstance(widget, core.FloatSlider)):
            widget.value.value = random_float_steps(
                widget.min, widget.max, widget.steps)
        elif isinstance(widget, core.Label):
            widget.value = value_string('Label')
        elif isinstance(widget, core.LineEdit):
            widget.value = value_string('LineEdit')
        elif isinstance(widget, core.ComboBox):
            widget.value = value_string('ComboBox')
        else:
            return
        self.state_updates.append((tab, widget.name, widget.value.copy()))
