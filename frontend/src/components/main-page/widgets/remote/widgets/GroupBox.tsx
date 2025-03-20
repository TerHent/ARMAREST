import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

export default class GroupBox extends Component<GroupBoxProps, {}> {
    render() {
        return (
            <details open={!this.props.collapsed}>
                <summary>{this.props.label}</summary>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </details>
        );
    }
}

export class GroupBoxProps extends WidgetProps {
    label: string;
    collapsed: boolean;
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        label: string,
        collapsed: boolean
    ) {
        super(
            name,
            value,
            state,
            children,
            propsToComponent,
            updateNotificationAccepter
        );
        this.label = label;
        this.collapsed = collapsed;
    }
}
