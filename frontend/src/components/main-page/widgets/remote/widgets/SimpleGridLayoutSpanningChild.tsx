import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";

export default class SimpleGridLayoutSpanningChild extends Component<
    SimpleGridLayoutSpanningChildProps,
    {}
> {
    render() {
        return (
            <div>
                {/* Logic is in SimpleGridLayout. */}
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>
        );
    }
}

export class SimpleGridLayoutSpanningChildProps extends WidgetProps {
    columns: number;

    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        columns: number
    ) {
        super(
            name,
            value,
            state,
            children,
            propsToComponent,
            updateNotificationAccepter
        );
        this.columns = columns;
    }
}
