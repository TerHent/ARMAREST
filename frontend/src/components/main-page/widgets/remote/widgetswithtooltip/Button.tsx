import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "../BaseTypes";

import { Button } from "reactstrap";
import withTooltip from "./WithTooltip";

export default class ButtonWidget extends Component<ButtonProps, {}> {
    buttonClicked = () => {
        this.props.updateNotificationAccepter(
            this.props.name,
            // buttons ... count up?
            new ValueVariant(
                this.props.value.type,
                (this.props.value.value as number) + 1
            )
        );
    };

    render() {
        return withTooltip(
            <div>
                <Button onClick={this.buttonClicked}>{this.props.label}</Button>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class ButtonProps extends WidgetWithToolTipProps {
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
