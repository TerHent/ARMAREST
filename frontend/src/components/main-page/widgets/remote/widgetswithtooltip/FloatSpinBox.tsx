import { Component } from "react";
import { Input } from "reactstrap";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "../BaseTypes";
import withTooltip from "./WithTooltip";

type FloatSpinBoxState = {
    value: number;
    suspendUpdates: boolean;
};

export default class FloatSpinBox extends Component<
    FloatSpinBoxProps,
    FloatSpinBoxState
> {
    constructor(props: FloatSpinBoxProps) {
        super(props);
        // (required for typesafety) + casts to a number, ?? means use 0 if value is null.
        let numberValue: number = +(props.value.value ?? 0);
        this.state = {
            value: Number.parseFloat(
                Number.parseFloat(numberValue + "").toFixed(props.decimals)
            ),
            suspendUpdates: false,
        };
    }

    componentDidUpdate = (prevProps: Readonly<FloatSpinBoxProps>) => {
        if (this.state.suspendUpdates) return;
        if (this.props != prevProps) {
            this.setState({
                value: Number((+(this.props.value.value ?? 0)).toFixed(3)),
            });
        }
    };

    valueChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        let newValue = event.target.valueAsNumber || 0;
        this.setState({
            value: newValue,
        });
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(this.props.value.type, newValue)
        );
    };

    render() {
        return withTooltip(
            <div>
                <Input
                    type="number"
                    value={this.state.value}
                    min={this.props.min}
                    max={this.props.max}
                    // For some reason ice provides the amount of steps, not the value increase of a step.
                    step={(this.props.max - this.props.min) / this.props.steps}
                    onChange={this.valueChanged}
                    required={true}
                    onFocus={() => this.setState({ suspendUpdates: true })}
                    onBlur={() => this.setState({ suspendUpdates: false })}
                />
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class FloatSpinBoxProps extends WidgetWithToolTipProps {
    min: number;
    max: number;
    steps: number;
    decimals: number;
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string,
        min: number,
        max: number,
        steps: number,
        decimals: number
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
