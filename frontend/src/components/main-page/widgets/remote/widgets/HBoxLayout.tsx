import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

const HBoxContainer = {
    width: "100%",
    display: "flex",
    // tell typescript to interpret row not as a string, but as the literal "row"
    flexDirection: "row" as "row",
    justifyContent: "left",
};

export default class HBoxLayout extends Component<HBoxLayoutProps, {}> {
    render() {
        return (
            <div style={HBoxContainer}>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>
        );
    }
}

export class HBoxLayoutProps extends WidgetProps {
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter
    ) {
        super(
            name,
            value,
            state,
            children,
            propsToComponent,
            updateNotificationAccepter
        );
    }
}
