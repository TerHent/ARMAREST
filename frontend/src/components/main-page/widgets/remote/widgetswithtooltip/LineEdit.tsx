import { Component } from "react";
import { Input } from "reactstrap";
import {
    ComponentSupplier,
    UpdateNotificationAccepter,
    ValueVariant,
    WidgetProps,
    WidgetState,
    WidgetWithToolTipProps,
} from "../BaseTypes";
import withTooltip from "./WithTooltip";

type LineEditState = {
    value: string;
    suspendUpdates: boolean;
};

export default class LineEdit extends Component<LineEditProps, LineEditState> {
    constructor(props: LineEditProps) {
        super(props);
        this.state = {
            value: this.props.value.value + "",
            suspendUpdates: false,
        };
    }

    valueChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        this.setState({
            value: event.target.value,
        });
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(this.props.value.type, event.target.value)
        );
    };

    componentDidUpdate = (prevProps: Readonly<LineEditProps>) => {
        if (this.state.suspendUpdates) return;
        if (this.props != prevProps) {
            this.setState({
                value: this.props.value.value + "",
            });
        }
    };

    render() {
        return withTooltip(
            <div>
                <Input
                    type="text"
                    value={this.state.value}
                    onChange={this.valueChanged}
                    onBlur={() => this.setState({ suspendUpdates: false })}
                    onFocus={() => this.setState({ suspendUpdates: true })}
                />
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class LineEditProps extends WidgetWithToolTipProps {
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string
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
    }
}
