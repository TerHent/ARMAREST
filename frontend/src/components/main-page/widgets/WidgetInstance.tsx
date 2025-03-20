import { Button, Card, CardHeader } from "reactstrap";
import Widget from "./Widget";
import CloseButton from "react-bootstrap/CloseButton";

export type InstanceRemover = (instance: WidgetInstance) => void;

export default class WidgetInstance {
    widget: Widget<any>;
    id: number;
    instanceRemover: InstanceRemover;

    constructor(
        widget: Widget<any>,
        id: number,
        instanceRemover: InstanceRemover
    ) {
        this.widget = widget;
        this.id = id;
        this.instanceRemover = instanceRemover;
    }

    renderInstance = (moveWidgetToTheEnd: (widget: WidgetInstance) => void) => {
        return (
            <div
                key={this.widget.name + this.id}
                data-grid={{
                    i: this.widget.name + this.id,
                    x: 0,
                    y: 0,
                    w: 18,
                    h: 15,
                    resizeHandles: ["s", "w", "e", "n"],
                }}
                style={instanceStyle}
            >
                <div
                    className="widget-wrapper"
                    onMouseDown={() => moveWidgetToTheEnd(this)}
                >
                    <Card>
                        <CardHeader className="d-flex">
                            <div className="drag-me" style={{ flexGrow: 1 }}>
                                <h4 className="title d-inline">
                                    {this.widget.name}
                                </h4>
                            </div>
                            <CloseButton
                                onClick={() => this.instanceRemover(this)}
                                variant="white"
                            />
                        </CardHeader>
                        <this.widget.content {...this.widget.props} />
                    </Card>
                </div>
            </div>
        );
    };
}

const instanceStyle = {
    border: "1px black solid",
    borderRadius: "2px",
    overflow: "scroll",
    backgroundAttachment: "fixed",
};
