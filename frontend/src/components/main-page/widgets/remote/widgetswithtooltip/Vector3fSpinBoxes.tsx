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
import FloatSpinBox from "./FloatSpinBox";
import withTooltip from "./WithTooltip";

export default class Vector3fSpinBoxes extends Component<
    Vector3fSpinBoxesProps,
    {}
> {
    childUpdate: UpdateNotificationAccepter = (name, update) => {
        let index = Number.parseInt(
            name.replace(this.props.name + "-GENERATED-", "")
        );
        let value = [...(this.props.value.value as number[])];
        value[index] = update.value as number;
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(ValueVariantType.Vector3, value)
        );
    };

    generateChild = (index: number): JSX.Element => {
        let name = this.props.name + "-GENERATED-" + index;
        return (
            <FloatSpinBox
                state={new WidgetState(true, true)}
                children={[]}
                min={this.indexVec3(this.props.min, index)}
                max={this.indexVec3(this.props.max, index)}
                decimals={this.indexVec3(this.props.decimals, index)}
                steps={this.indexVec3(this.props.steps, index)}
                key={name}
                name={name}
                tooltip=""
                propsToComponent={this.props.propsToComponent}
                updateNotificationAccepter={this.childUpdate}
                value={
                    new ValueVariant(
                        ValueVariantType.Float,
                        (this.props.value.value as number[])[index]
                    )
                }
            />
        );
    };

    indexVec3 = (vec: Vector3, index: number): number => {
        switch (index) {
            case 0:
                return vec.x;
            case 1:
                return vec.y;
            case 2:
                return vec.z;
            default:
                return -1;
        }
    };

    render() {
        return withTooltip(
            <div>
                {this.generateChild(0)}
                {this.generateChild(1)}
                {this.generateChild(2)}
            </div>,
            this.props.tooltip
        );
    }
}

export class Vector3fSpinBoxesProps extends WidgetWithToolTipProps {
    min: Vector3;
    max: Vector3;
    steps: Vector3;
    decimals: Vector3;
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string,
        min: Vector3,
        max: Vector3,
        steps: Vector3,
        decimals: Vector3
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
        this.min = min;
        this.max = max;
        this.steps = steps;
        this.decimals = decimals;
    }
}
