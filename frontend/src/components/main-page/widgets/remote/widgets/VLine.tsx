import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

export default class VLine extends Component<VLineProps, {}> {
    render() {
        return <div style={{ borderLeft: "1px solid black" }}></div>;
    }
}

export class VLineProps extends WidgetProps {}
