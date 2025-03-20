import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

export default class VSpacer extends Component<VSpacerProps, {}> {
    render() {
        return (
            <div>
                <br />
                <br />
                <br />
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>
        );
    }
}

export class VSpacerProps extends WidgetProps {}
