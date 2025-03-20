import { Component } from "react";
import { Button } from "reactstrap";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "../BaseTypes";
import withTooltip from "./WithTooltip";

export default class ToggleButton extends Component<ToggleButtonProps, {}> {
    buttonClicked = () => {
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(this.props.value.type, !this.props.value.value)
        );
    };

    render() {
        return withTooltip(
            <div>
                <Button
                    aria-pressed={this.props.value.value == true}
                    onClick={this.buttonClicked}
                >
                    {this.props.label}
                </Button>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class ToggleButtonProps extends WidgetWithToolTipProps {
    label: String;
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string,
        label: string
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
        this.label = label;
    }
}
