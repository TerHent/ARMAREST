import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "../BaseTypes";

import { Input } from "reactstrap";
import withTooltip from "./WithTooltip";

export default class CheckBox extends Component<CheckBoxProps, {}> {
    onCheckboxClick = () => {
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(
                this.props.value.type,
                // negate current value:
                !this.props.value.value
            )
        );
    };

    render() {
        // Beautiful javascript boolean cast :)
        let value: boolean = this.props.value.value == true;
        return withTooltip(
            <div>
                <Input
                    checked={value}
                    type="checkbox"
                    onChange={this.onCheckboxClick}
                ></Input>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class CheckBoxProps extends WidgetWithToolTipProps {
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
