import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

export default class HSpacer extends Component<HSpacerProps, {}> {
    render() {
        return (
            <div>
                {/* Spacers are only used in Layouts and are managed by them.
                Therefore, the element can be empty. */}
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>
        );
    }
}

export class HSpacerProps extends WidgetProps {}
