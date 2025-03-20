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

type IntSliderState = {
    value: number;
};

export default class IntSlider extends Component<
    IntSliderProps,
    IntSliderState
> {
    constructor(props: IntSliderProps) {
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

    componentDidUpdate = (prevProps: Readonly<IntSliderProps>) => {
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

export class IntSliderProps extends WidgetWithToolTipProps {
    min: number;
    max: number;
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string,
        min: number,
        max: number
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
    }
}
