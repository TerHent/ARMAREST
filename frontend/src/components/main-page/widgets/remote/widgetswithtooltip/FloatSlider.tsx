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

type FloatSliderState = {
    value: number;
};

export default class FloatSlider extends Component<
    FloatSliderProps,
    FloatSliderState
> {
    constructor(props: FloatSliderProps) {
        super(props);
        this.state = {
            // (required for typesafety) + casts to a number, ?? means use 0 if value is null
            value: +(props.value.value ?? 0),
        };
    }

    valueChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        this.setState({
            value: event.target.valueAsNumber,
        });
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(this.props.value.type, event.target.valueAsNumber)
        );
    };

    componentDidUpdate = (prevProps: Readonly<FloatSliderProps>) => {
        if (this.props != prevProps) {
            this.setState({
                value: +(this.props.value.value ?? 0),
            });
        }
    };

    render() {
        return withTooltip(
            <div>
                <Input
                    type="range"
                    value={this.state.value}
                    min={this.props.min}
                    max={this.props.max}
                    // For some reason ice provides the amount of steps, not the value increase of a step.
                    step={(this.props.max - this.props.min) / this.props.steps}
                    onChange={this.valueChanged}
                ></Input>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class FloatSliderProps extends WidgetWithToolTipProps {
    min: number;
    max: number;
    steps: number;
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
        steps: number
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
    }
}
