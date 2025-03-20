import { Component } from "react";
import { Store } from "react-notifications-component";
import { Button, CardBody, Input } from "reactstrap";
import { Type } from "typescript";
import { requestFromApi } from "../../../../util/requestutil";
import { InstanceRemover } from "../WidgetInstance";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    ValueVariantType,
    Vector3,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "./BaseTypes";
import GridLayout, {
    GridLayoutData,
    GridLayoutProps,
} from "./widgets/GridLayout";
import GroupBox, { GroupBoxProps } from "./widgets/GroupBox";
import HBoxLayout, { HBoxLayoutProps } from "./widgets/HBoxLayout";
import HLine, { HLineProps } from "./widgets/HLine";
import HSpacer, { HSpacerProps } from "./widgets/HSpacer";
import SimpleGridLayout, {
    SimpleGridLayoutProps,
} from "./widgets/SimpleGridLayout";
import SimpleGridLayoutSpanningChild, {
    SimpleGridLayoutSpanningChildProps,
} from "./widgets/SimpleGridLayoutSpanningChild";
import VBoxLayout, { VBoxLayoutProps } from "./widgets/VBoxLayout";
import VLine, { VLineProps } from "./widgets/VLine";
import VSpacer, { VSpacerProps } from "./widgets/VSpacer";
import Widget from "./widgets/Widget";
import ButtonWidget, { ButtonProps } from "./widgetswithtooltip/Button";
import CheckBox, { CheckBoxProps } from "./widgetswithtooltip/Checkbox";
import ComboBox, { ComboBoxProps } from "./widgetswithtooltip/ComboBox";
import FloatSlider, {
    FloatSliderProps,
} from "./widgetswithtooltip/FloatSlider";
import FloatSpinBox, {
    FloatSpinBoxProps,
} from "./widgetswithtooltip/FloatSpinBox";
import IntSlider, { IntSliderProps } from "./widgetswithtooltip/IntSlider";
import IntSpinBox, { IntSpinBoxProps } from "./widgetswithtooltip/IntSpinBox";
import Label, { LabelProps } from "./widgetswithtooltip/Label";
import LineEdit, { LineEditProps } from "./widgetswithtooltip/LineEdit";
import PosRPYSpinBoxes, {
    PosRPYSpinBoxesProps,
} from "./widgetswithtooltip/PosRPYSpinBoxes";
import ToggleButton, {
    ToggleButtonProps,
} from "./widgetswithtooltip/ToggleButton";
import Vector3fSpinBoxes, {
    Vector3fSpinBoxesProps,
} from "./widgetswithtooltip/Vector3fSpinBoxes";
import WidgetWithToolTip from "./widgetswithtooltip/WidgetWithToolTip";

export const REMOTE_GUI_API_BASE_PATH = `${
    process.env.API_BASE_URL || "http://localhost:3300/api/v1"
}/remote`;

export type RemoteGuiProps = {
    tabName: string;
};

const REFRESH_PERIOD: number = 1 * 100;

type QueuedUpdate = {
    name: string;
    newValue: ValueVariant;
    oldValue?: ValueVariant;
};

type WidgetCache = {
    [key: string]: ValueVariant;
};

type UpdateCache = {
    [key: string]: QueuedUpdate;
};

type NotificationIdMap = {
    [key: string]: string;
};

type RemoteGuiState = {
    rootWidget?: WidgetProps;
    sendUpdatesLive: boolean;
    interval?: ReturnType<typeof setInterval>;
    queuedUpdates: UpdateCache;
    cachedWidgetValues: WidgetCache;
    notificationIds: NotificationIdMap;
};

type BackendWidget = {
    name: string;
    kind: string;
    value: ValueVariant;
    state: WidgetState;
    children: BackendWidget[];
    tooltip?: string;
    columns?: number;
    row?: number;
    col?: number;
    spawn_row?: number;
    span_col?: number;
    children_layout_info?: GridLayoutData[];
    label?: string;
    collapsed?: boolean;
    min?: number | Vector3;
    max?: number | Vector3;
    steps?: number | Vector3;
    decimals?: number | Vector3;
    options?: string[];
    min_pos?: Vector3;
    max_pos?: Vector3;
    min_rpy?: Vector3;
    max_rpy?: Vector3;
    steps_pos?: Vector3;
    decimals_pos?: Vector3;
    steps_rpy?: Vector3;
    decimals_rpy?: Vector3;
};

export default class RemoteGui extends Component<
    RemoteGuiProps,
    RemoteGuiState
> {
    constructor(props: RemoteGuiProps) {
        super(props);
        this.state = {
            sendUpdatesLive: true,
            cachedWidgetValues: {},
            queuedUpdates: {},
            notificationIds: {},
        };
        this.updateWidgets();
    }

    componentDidMount(): void {
        this.startRemoteGui(REFRESH_PERIOD);
    }

    startRemoteGui = (seconds: number) => {
        this.setState({
            interval: setInterval(() => {
                this.updateWidgets();
            }, seconds),
        });
    };

    componentWillUnmount(): void {
        if (this.state.interval) {
            clearInterval(this.state.interval);
        }
    }

    updateNotificationAccepter: UpdateNotificationAccepter = (
        widgetName: string,
        update: ValueVariant
    ) => {
        if (this.state.sendUpdatesLive)
            this.sendWidgetUpdate(widgetName, update);
        else {
            let queuedUpdates = this.state.queuedUpdates;
            queuedUpdates[widgetName] = {
                name: widgetName,
                newValue: update,
                oldValue: this.state.cachedWidgetValues[widgetName],
            };
            let id = Store.addNotification({
                title: `Stored Update for ${widgetName}`,
                message: "New value: " + update.value,
                type: "info",
                insert: "top",
                container: "top-right",
                dismiss: {
                    duration: 2000,
                },
            });
            if (this.state.notificationIds[widgetName]) {
                Store.removeNotification(
                    this.state.notificationIds[widgetName]
                );
            }
            let idObjectUpdate = this.state.notificationIds;
            idObjectUpdate[widgetName] = id;
            this.setState({ queuedUpdates, notificationIds: idObjectUpdate });
        }
    };

    sendWidgetUpdate = (widgetName: string, update: ValueVariant) => {
        requestFromApi(
            `/remote/tab/${
                this.props.tabName
            }?widgetName=${widgetName}&updatedValue=${
                update.value
            }&updatedValueType=${ValueVariantType[update.type]}`,
            {
                method: "PUT",
            }
        );
    };

    sendAllQueuedUpdates = () => {
        for (let update of Object.values(this.state.queuedUpdates)) {
            if (update.oldValue === undefined) {
                this.sendWidgetUpdate(update.name, update.newValue);
                continue;
            }
            if (
                this.state.cachedWidgetValues[update.name] !== undefined &&
                this.state.cachedWidgetValues[update.name].value ==
                    update.oldValue.value
            ) {
                this.sendWidgetUpdate(update.name, update.newValue);
                continue;
            }
            let message = "";
            if (this.state.cachedWidgetValues[update.name] !== undefined)
                message = `Invalid cached value! \nOld value: ${
                    update.oldValue.value
                } != 
                ${this.state.cachedWidgetValues[update.name].value}
                (This change was ignored)`;
            else message = "The widget you tried to change no longer exists.";

            Store.addNotification({
                title: `Failed to update ${update.name}`,
                message,
                type: "warning",
                insert: "top",
                container: "top-right",
                dismiss: {
                    duration: 5000,
                },
            });
        }
        Store.addNotification({
            title: "Sending Updates!",
            message: Object.keys(this.state.queuedUpdates).length + " Updates",
            type: "success",
            insert: "top",
            container: "top-right",
            dismiss: {
                duration: 1000,
            },
        });
        this.setState({
            queuedUpdates: {},
            notificationIds: {},
        });
    };

    toggleSendingUpdatesLive: React.ChangeEventHandler<HTMLInputElement> = (
        event
    ) => {
        if (event.target.checked) {
            // Send queued updates when sending live updates is checked again.
            this.sendAllQueuedUpdates();
        }
        this.setState({ sendUpdatesLive: event.target.checked });
    };

    propsToComponent: ComponentSupplier = (props?: WidgetProps) => {
        if (props instanceof GridLayoutProps)
            return <GridLayout {...props}></GridLayout>;
        if (props instanceof GroupBoxProps)
            return <GroupBox {...props}></GroupBox>;
        if (props instanceof HBoxLayoutProps)
            return <HBoxLayout {...props}></HBoxLayout>;
        if (props instanceof HLineProps) return <HLine {...props}></HLine>;
        if (props instanceof HSpacerProps)
            return <HSpacer {...props}></HSpacer>;
        if (props instanceof SimpleGridLayoutProps)
            return <SimpleGridLayout {...props}></SimpleGridLayout>;
        if (props instanceof SimpleGridLayoutSpanningChildProps)
            return (
                <SimpleGridLayoutSpanningChild
                    {...props}
                ></SimpleGridLayoutSpanningChild>
            );
        if (props instanceof VBoxLayoutProps)
            return <VBoxLayout {...props}></VBoxLayout>;
        if (props instanceof VLineProps) return <VLine {...props}></VLine>;
        if (props instanceof VSpacerProps)
            return <VSpacer {...props}></VSpacer>;
        if (props instanceof ButtonProps)
            return <ButtonWidget {...props}></ButtonWidget>;
        if (props instanceof CheckBoxProps)
            return <CheckBox {...props}></CheckBox>;
        if (props instanceof ComboBoxProps)
            return <ComboBox {...props}></ComboBox>;
        if (props instanceof FloatSliderProps)
            return <FloatSlider {...props}></FloatSlider>;
        if (props instanceof FloatSpinBoxProps)
            return <FloatSpinBox {...props}></FloatSpinBox>;
        if (props instanceof IntSliderProps)
            return <IntSlider {...props}></IntSlider>;
        if (props instanceof IntSpinBoxProps)
            return <IntSpinBox {...props}></IntSpinBox>;
        if (props instanceof LabelProps) return <Label {...props}></Label>;
        if (props instanceof LineEditProps)
            return <LineEdit {...props}></LineEdit>;
        if (props instanceof PosRPYSpinBoxesProps)
            return <PosRPYSpinBoxes {...props}></PosRPYSpinBoxes>;
        if (props instanceof ToggleButtonProps)
            return <ToggleButton {...props}></ToggleButton>;
        if (props instanceof Vector3fSpinBoxesProps)
            return <Vector3fSpinBoxes {...props}></Vector3fSpinBoxes>;
        if (props instanceof WidgetWithToolTipProps)
            return <WidgetWithToolTip {...props}></WidgetWithToolTip>;
        if (props instanceof WidgetProps) return <Widget {...props}></Widget>;
        return <div>Error parsing {props} to a widget.</div>;
    };

    updateWidgets = () => {
        requestFromApi("/remote/tab/" + this.props.tabName, {
            ignoreErrors: true,
        }).then(async (response) => {
            if (response === undefined) return;
            if (response.status === 400) {
                this.setState({
                    rootWidget: new LabelProps(
                        "Error",
                        new ValueVariant(
                            ValueVariantType.String,
                            "This remote gui tab does not exist anymore. The frontend will now check once per second if it appears again."
                        ),
                        { disabled: false, hidden: false },
                        [],
                        this.propsToComponent,
                        this.updateNotificationAccepter,
                        "Error message"
                    ),
                });
                return;
            }
            const widget = (await response.json()) as BackendWidget;
            this.setState({
                rootWidget: this.convertWidget(widget),
            });
        });
    };

    convertWidget = (widget: BackendWidget): WidgetProps => {
        let newCache: WidgetCache = {};
        let props = convertWidget(
            widget,
            this.propsToComponent,
            this.updateNotificationAccepter,
            newCache
        );
        this.setState({
            cachedWidgetValues: newCache,
        });
        return props;
    };

    render() {
        return (
            <CardBody>
                Send Updates Live:
                <Input
                    type="checkbox"
                    checked={this.state.sendUpdatesLive}
                    onChange={this.toggleSendingUpdatesLive}
                ></Input>
                <Button onClick={() => this.sendAllQueuedUpdates()}>
                    Send updates now
                </Button>
                {this.propsToComponent(this.state.rootWidget)}
            </CardBody>
        );
    }
}

function convertWidget(
    widget: BackendWidget,
    propsToComponent: ComponentSupplier,
    updateNotificationAccepter: UpdateNotificationAccepter,
    widgetCache: WidgetCache
): WidgetProps {
    widgetCache[widget.name] = widget.value;
    const convertedChildren = widget.children
        .filter((child) => !child.state.hidden && !child.state.disabled)
        .map((child) => {
            return convertWidget(
                child,
                propsToComponent,
                updateNotificationAccepter,
                widgetCache
            );
        });
    switch (widget.kind) {
        case "Button":
            if (widget.tooltip === undefined || widget.label === undefined)
                break;
            return new ButtonProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.label
            );
        case "CheckBox":
            if (widget.tooltip === undefined || widget.label === undefined)
                break;
            return new CheckBoxProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.label
            );
        case "ComboBox":
            if (widget.tooltip === undefined || widget.options === undefined)
                break;
            return new ComboBoxProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.options
            );
        case "FloatSlider":
            if (
                widget.tooltip === undefined ||
                widget.min === undefined ||
                widget.max === undefined ||
                widget.steps === undefined
            )
                break;
            if (
                typeof widget.min != "number" ||
                typeof widget.max != "number" ||
                typeof widget.steps != "number"
            )
                break;
            return new FloatSliderProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.min,
                widget.max,
                widget.steps
            );
        case "FloatSpinBox":
            if (
                widget.tooltip === undefined ||
                widget.min === undefined ||
                widget.max === undefined ||
                widget.steps === undefined ||
                widget.decimals === undefined
            )
                break;
            if (
                typeof widget.min != "number" ||
                typeof widget.max != "number" ||
                typeof widget.steps != "number" ||
                typeof widget.decimals != "number"
            )
                break;
            return new FloatSpinBoxProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.min,
                widget.max,
                widget.steps,
                widget.decimals
            );
        case "IntSlider":
            if (
                widget.tooltip === undefined ||
                widget.min === undefined ||
                widget.max === undefined
            )
                break;
            if (typeof widget.min != "number" || typeof widget.max != "number")
                break;
            return new IntSliderProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.min,
                widget.max
            );
        case "IntSpinBox":
            if (
                widget.tooltip === undefined ||
                widget.min === undefined ||
                widget.max === undefined
            )
                break;
            if (typeof widget.min != "number" || typeof widget.max != "number")
                break;
            return new IntSpinBoxProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.min,
                widget.max
            );
        case "Label":
            if (widget.tooltip === undefined) break;
            return new LabelProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip
            );
        case "LineEdit":
            if (widget.tooltip === undefined) break;
            return new LineEditProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip
            );
        case "PosRPYSpinBoxes":
            if (
                widget.tooltip === undefined ||
                widget.min_pos === undefined ||
                widget.max_pos === undefined ||
                widget.min_rpy === undefined ||
                widget.max_rpy === undefined ||
                widget.steps_pos === undefined ||
                widget.decimals_pos === undefined ||
                widget.steps_rpy === undefined ||
                widget.decimals_rpy === undefined
            )
                break;
            return new PosRPYSpinBoxesProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.min_pos,
                widget.max_pos,
                widget.min_rpy,
                widget.max_rpy,
                widget.steps_pos,
                widget.decimals_pos,
                widget.steps_rpy,
                widget.decimals_rpy
            );
        case "ToggleButton":
            if (widget.tooltip === undefined || widget.label === undefined)
                break;
            return new ToggleButtonProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.label
            );
        case "Vector3fSpinBoxes":
            if (
                widget.tooltip === undefined ||
                widget.min === undefined ||
                widget.max === undefined ||
                widget.steps === undefined ||
                widget.decimals === undefined
            )
                break;
            if (
                typeof widget.min == "number" ||
                typeof widget.max == "number" ||
                typeof widget.steps == "number" ||
                typeof widget.decimals == "number"
            )
                break;
            return new Vector3fSpinBoxesProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip,
                widget.min,
                widget.max,
                widget.steps,
                widget.decimals
            );
        case "GridLayout":
            if (widget.children_layout_info === undefined) break;
            return new GridLayoutProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.children_layout_info
            );
        case "GroupBox":
            if (widget.label === undefined || widget.collapsed === undefined)
                break;
            return new GroupBoxProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.label,
                widget.collapsed
            );
        case "HBoxLayout":
            return new HBoxLayoutProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
        case "HLine":
            return new HLineProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
        case "HSpacer":
            return new HSpacerProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
        case "SimpleGridLayout":
            if (widget.columns === undefined) break;
            return new SimpleGridLayoutProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.columns
            );
        case "SimpleGridLayoutSpanningChild":
            if (widget.columns === undefined) break;
            return new SimpleGridLayoutSpanningChildProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.columns
            );
        case "VBoxLayout":
            return new VBoxLayoutProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
        case "VLine":
            return new VLineProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
        case "VSpacer":
            return new VSpacerProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
        case "WidgetWithToolTip":
            if (widget.tooltip === undefined) break;
            return new WidgetWithToolTipProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter,
                widget.tooltip
            );
        case "Widget":
            return new WidgetProps(
                widget.name,
                widget.value,
                widget.state,
                convertedChildren,
                propsToComponent,
                updateNotificationAccepter
            );
    }
    console.log("Widget could not be parsed:", widget);
    return new WidgetProps(
        "Error in " + widget.name,
        widget.value,
        widget.state,
        convertedChildren,
        propsToComponent,
        (widgetName: string, update: ValueVariant) => {}
    );
}
