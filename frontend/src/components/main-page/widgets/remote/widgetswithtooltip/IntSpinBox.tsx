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

type IntSpinBoxState = {
    value: number;
    suspendUpdates: boolean;
};

export default class IntSpinBox extends Component<
    IntSpinBoxProps,
    IntSpinBoxState
> {
    constructor(props: IntSpinBoxProps) {
        super(props);
        this.state = {
            // (required for typesafety) + casts to a number, ?? means use 0 if value is null
            value: +(props.value.value ?? 0),
            suspendUpdates: false,
        };
    }

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

    componentDidUpdate = (prevProps: Readonly<IntSpinBoxProps>) => {
        if (this.state.suspendUpdates) return;
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
                    type="number"
                    value={this.state.value}
                    min={this.props.min}
                    max={this.props.max}
                    step={1}
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

export class IntSpinBoxProps extends WidgetWithToolTipProps {
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
