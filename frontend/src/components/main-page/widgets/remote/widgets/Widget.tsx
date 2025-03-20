import { Component } from "react";
import { WidgetProps } from "../BaseTypes";

export default class Widget extends Component<WidgetProps, {}> {
    render() {
        return (
            <div>
                Default Widget named {this.props.name} <br />
                You are probably expecting a different widget here. Check the
                console for errors. <br />
                <div>
                    {this.props.children.map((child) =>
                        this.props.propsToComponent(child)
                    )}
                </div>
            </div>
        );
    }
}
