import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    ValueVariantType,
    Vector3,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "../BaseTypes";
import Vector3fSpinBoxes from "./Vector3fSpinBoxes";
import withTooltip from "./WithTooltip";

export default class PosRPYSpinBoxes extends Component<
    PosRPYSpinBoxesProps,
    {}
> {
    childUpdate: UpdateNotificationAccepter = (name, update) => {
        let variant = name.replace(this.props.name + "-", "");
        let value = [...(this.props.value.value as number[])];
        if (variant == "pos") {
            value.splice(0, 3);
            value.unshift(...(update.value as number[]));
        }
        if (variant == "rpy") {
            value.splice(4, 7);
            value = [...value.slice(0, 4), ...(update.value as number[])];
            while (value.length < 16) value.push(0);
        }
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(ValueVariantType.Matrix4, value)
        );
    };

    generateVector3SpinBox = (
        variant: "pos" | "rpy",
        min: Vector3,
        max: Vector3,
        steps: Vector3,
        decimals: Vector3,
        value: number[]
    ): JSX.Element => {
        let name = this.props.name + "-" + variant;
        return (
            <Vector3fSpinBoxes
                min={min}
                max={max}
                steps={steps}
                decimals={decimals}
                key={name}
                name={name}
                tooltip=""
                propsToComponent={this.props.propsToComponent}
                state={new WidgetState(true, true)}
                value={new ValueVariant(ValueVariantType.Vector3, value)}
                children={[]}
                updateNotificationAccepter={this.childUpdate}
            />
        );
    };

    render() {
        return withTooltip(
            <div>
                {this.generateVector3SpinBox(
                    "pos",
                    this.props.min_pos,
                    this.props.max_pos,
                    this.props.steps_pos,
                    this.props.decimals_pos,
                    (this.props.value.value as number[]).slice(0, 3)
                )}
                {this.generateVector3SpinBox(
                    "rpy",
                    this.props.min_rpy,
                    this.props.max_rpy,
                    this.props.steps_rpy,
                    this.props.decimals_rpy,
                    (this.props.value.value as number[]).slice(4, 7)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class PosRPYSpinBoxesProps extends WidgetWithToolTipProps {
    min_pos: Vector3;
    max_pos: Vector3;
    min_rpy: Vector3;
    max_rpy: Vector3;
    steps_pos: Vector3;
    decimals_pos: Vector3;
    steps_rpy: Vector3;
    decimals_rpy: Vector3;
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string,
        min_pos: Vector3,
        max_pos: Vector3,
        min_rpy: Vector3,
        max_rpy: Vector3,
        steps_pos: Vector3,
        decimals_pos: Vector3,
        steps_rpy: Vector3,
        decimals_rpy: Vector3
    ) {
        super(
            name,
            value,
            state,
            children,
            propsToComponent,
            updateNotificationAccepter,
            tooltip
        );
        this.min_pos = min_pos;
        this.max_pos = max_pos;
        this.min_rpy = min_rpy;
        this.max_rpy = max_rpy;
        this.steps_pos = steps_pos;
        this.decimals_pos = decimals_pos;
        this.steps_rpy = steps_rpy;
        this.decimals_rpy = decimals_rpy;
    }
}
