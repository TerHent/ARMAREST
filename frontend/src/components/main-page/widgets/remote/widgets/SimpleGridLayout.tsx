import { Component } from "react";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
} from "../BaseTypes";
import { SimpleGridLayoutSpanningChildProps } from "./SimpleGridLayoutSpanningChild";

export default class SimpleGridLayout extends Component<
    SimpleGridLayoutProps,
    {}
> {
    render() {
        return (
            <div className={`row row-cols-${this.props.columns}`}>
                {this.props.children.map((child) => (
                    <div
                        className={
                            child instanceof SimpleGridLayoutSpanningChildProps
                                ? "col-12"
                                : "col"
                        }
                        key={child.name}
                    >
                        {this.props.propsToComponent(child)}
                    </div>
                ))}
            </div>
        );
    }
}

export class SimpleGridLayoutProps extends WidgetProps {
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
