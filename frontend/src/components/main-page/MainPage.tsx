import React, { Component } from "react";
import LoggerGUI from "./widgets/logger/LoggerGUI";
import NavBar from "./navbar/NavBar";
import Footer from "./navbar/Footer";
import Widget from "./widgets/Widget";
import "./mainPage.css";

import { Responsive, WidthProvider } from "react-grid-layout";

import "../../../node_modules/react-resizable/css/styles.css";

import RemoteGui, {
    REMOTE_GUI_API_BASE_PATH,
} from "./widgets/remote/RemoteGui";
import KinematicUnitGUI from "./widgets/kinematic/KinematicUnitGUI";
import WidgetInstance, { InstanceRemover } from "./widgets/WidgetInstance";
import { requestFromApi } from "../../util/requestutil";

const ResponsiveGridLayout = WidthProvider(Responsive);

type MainPageProps = {};
type MainPageState = {
    widgets: Widget<any>[];
    workspace: WidgetInstance[];
    layout: ReactGridLayout.Layouts;
    interval?: ReturnType<typeof setInterval>;
    canSelectText: boolean;
};
class MainPage extends Component<MainPageProps, MainPageState> {
    state: MainPageState = {
        widgets: [new Widget("Logger", {}, LoggerGUI)],
        workspace: [],
        layout: {},
        canSelectText: true,
    };
    componentDidMount() {
        //make call to get data on kinematic units and add them to the list of widgets
        //maybe init workspace here
        this.refreshTabInfo();
        this.startRefreshing(1000);
    }

    async refreshTabInfo() {
        requestFromApi("/remote/tabs/").then(async (response) => {
            if (response === undefined) return;
            const names = (await response.json()) as string[];
            let remoteGuiWidgets: Widget<any>[] = names.map(
                (name) =>
                    new Widget(
                        "RemoteGui " + name,
                        { tabName: name },
                        RemoteGui
                    )
            );
            let filtered = this.state.widgets.filter(
                (widget) => !widget.name.startsWith("RemoteGui ")
            );
            this.setState({
                widgets: [...filtered, ...remoteGuiWidgets].sort((a, b) =>
                    a.name.localeCompare(b.name)
                ),
            });
        });

        requestFromApi("/kinematic/").then(async (response) => {
            if (response === undefined) return;
            const names = (await response.json()) as string[];
            const kinematicUnitWidgets: Widget<any>[] = names.map(
                (name) =>
                    new Widget(
                        "KinematicUnit " + name,
                        { unitName: name },
                        KinematicUnitGUI
                    )
            );
            const filtered = this.state.widgets.filter(
                (widget) => !widget.name.startsWith("KinematicUnit ")
            );
            this.setState({
                widgets: [...filtered, ...kinematicUnitWidgets].sort((a, b) =>
                    a.name.localeCompare(b.name)
                ),
            });
        });
    }

    startRefreshing = (seconds: number) => {
        this.setState({
            interval: setInterval(() => {
                this.refreshTabInfo();
            }, seconds),
        });
    };

    componentWillUnmount(): void {
        if (this.state.interval) {
            clearInterval(this.state.interval);
        }
    }

    addWidgetToWorkspace = (widget: Widget<any>) => {
        let workspace = this.state.workspace;
        workspace.push(widget.newInstance(this.removeWidgetFromWorkspace));
        this.setState({ workspace });
    };

    moveWidgetToTheEnd = (widget: WidgetInstance) => {
        let list = this.state.workspace;
        list.splice(list.indexOf(widget), 1);
        list.push(widget);
        this.setState({ workspace: list });
    };

    removeWidgetFromWorkspace: InstanceRemover = (widget: WidgetInstance) => {
        this.setState({
            workspace: this.state.workspace.filter((all) => all !== widget),
        });
    };

    removeAllWidgets = () => {
        this.setState({ workspace: [] });
    };

    render() {
        return (
            <div
                className="MainPage"
                style={this.state.canSelectText ? {} : { userSelect: "none" }}
            >
                <NavBar
                    widgets={this.state.widgets}
                    selectWidget={this.addWidgetToWorkspace}
                    removeAll={this.removeAllWidgets}
                />
                <ResponsiveGridLayout
                    className="layout"
                    layouts={this.state.layout}
                    breakpoints={{
                        lg: 1200,
                        md: 996,
                        sm: 768,
                        xs: 480,
                        xxs: 0,
                    }}
                    cols={{ lg: 36, md: 30, sm: 18, xs: 12, xxs: 6 }}
                    rowHeight={30}
                    draggableHandle={".drag-me"}
                    autoSize={false}
                    allowOverlap={true}
                    compactType={undefined}
                    onDragStart={() => this.setState({ canSelectText: false })}
                    onDragStop={() => this.setState({ canSelectText: true })}
                >
                    {this.state.workspace.map((widget) =>
                        widget.renderInstance(this.moveWidgetToTheEnd)
                    )}
                </ResponsiveGridLayout>
                <Footer />
            </div>
        );
    }
}

export default MainPage;
