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

type ComboBoxState = {
    value: string;
};

export default class ComboBox extends Component<ComboBoxProps, ComboBoxState> {
    constructor(props: ComboBoxProps) {
        super(props);
        this.state = {
            value: this.props.value.value + "",
        };
    }

    valueChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        this.setState({
            value: event.target.value,
        });
        if (!this.props.options.includes(event.target.value)) {
            // Ignore invalid input
            return;
        }
        this.props.updateNotificationAccepter(
            this.props.name,
            new ValueVariant(this.props.value.type, event.target.value)
        );
    };

    componentDidUpdate = (prevProps: Readonly<ComboBoxProps>) => {
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
                    value={this.state.value + ""}
                    type="text"
                    list={this.props.name + "-combobox-list"}
                    onChange={this.valueChanged}
                />
                <datalist id={this.props.name + "-combobox-list"}>
                    {/* "key" is necessary here as it is a react list.  */}
                    {this.props.options.map((option) => (
                        <option key={option} value={option} />
                    ))}
                </datalist>
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}

export class ComboBoxProps extends WidgetWithToolTipProps {
    options: string[];
    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter,
        tooltip: string,
        options: string[]
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
        this.options = options;
    }
}
