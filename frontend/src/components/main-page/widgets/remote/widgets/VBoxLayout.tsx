import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

const VBoxContainer = {
    width: "100%",
    display: "flex",
    // tell typescript to interpret column not as a string, but as the literal "column"
    flexDirection: "column" as "column",
    justifyContent: "left",
};

export default class VBoxLayout extends Component<VBoxLayoutProps, {}> {
    render() {
        return (
            <div style={VBoxContainer}>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>
        );
    }
}

export class VBoxLayoutProps extends WidgetProps {}
