import { Component } from "react";
import { WidgetWithToolTipProps } from "../BaseTypes";
import withTooltip from "./WithTooltip";

export default class WidgetWithToolTip extends Component<
    WidgetWithToolTipProps,
    {}
> {
    render() {
        return withTooltip(
            <div>
                WidgetWithToolTip should never be used directly.
                <br />
                You are probably seeing this message due to an error while
                parsing {this.props.name}.<br />
                {this.props.children.map((child) =>
                    this.props.propsToComponent(child)
                )}
            </div>,
            this.props.tooltip
        );
    }
}
