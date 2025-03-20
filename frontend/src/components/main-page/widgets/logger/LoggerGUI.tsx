import { Component, FormEvent, MouseEvent } from "react";
import LogMessage from "./LogMessage";
import VerbosityLevel from "./VerbosityLevel";
import "./logger.css";
import "react-base-table/styles.css";
import {
    Card,
    CardHeader,
    CardBody,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    Table,
    Button,
    ButtonGroup,
    ButtonToolbar,
    FormGroup,
    Form,
    Label,
    Input,
    InputGroup,
    InputGroupText,
} from "reactstrap";
import { requestFromApi } from "../../../../util/requestutil";
import BaseTable, { AutoResizer, Column } from "react-base-table";
import { Store } from "react-notifications-component";

const DEFAULT_VERBOSITY: VerbosityLevel = VerbosityLevel.Important;
const LOG_PERIOD_MS: number = 1 * 1000;

type LoggerProps = {};

type Filter = {
    component?: string;
    tag?: string;
    file?: string;
    func?: string;
};

type LoggerState = {
    buffer: LogMessage[];
    running: boolean;
    verbosity: VerbosityLevel;
    interval?: ReturnType<typeof setInterval>;
    after?: number;
    before?: number;
    filter: Filter;
    displayNewLogs: boolean;
    fetchNewLogs: boolean;
    autoScroll: boolean;
    lastBackendUUID?: string;
};

type BackendLog = {
    tag: string;
    threadId: string;
    backtrace: string;
    line: string;
    message: string;
    verbosity: number;
    file: string;
    author: string;
    group: string;
    function: string;
    timestamp: number;
    id: number;
};

class LoggerGUI extends Component<LoggerProps, LoggerState> {
    private tagRef: string;
    private componentRef: string;
    private fileRef: string;
    private functionRef: string;
    private table?: BaseTable;

    constructor(props: LoggerProps) {
        super(props);
        this.tagRef = "";
        this.componentRef = "";
        this.fileRef = "";
        this.functionRef = "";
    }

    state: LoggerState = {
        buffer: [],
        running: false,
        verbosity: DEFAULT_VERBOSITY,
        filter: {},
        displayNewLogs: true,
        fetchNewLogs: true,
        autoScroll: true,
    };

    setRef = (ref: BaseTable) => (this.table = ref);

    componentDidMount(): void {
        this.setState({ running: true });
        this.startLogger(LOG_PERIOD_MS);
    }

    startLogger = (seconds: number): void => {
        this.setState({
            interval: setInterval(() => {
                this.everySecond();
            }, seconds),
        });
    };

    everySecond = () => {
        if (this.state.running) {
            this.getLog();
        } else {
            clearInterval(this.state.interval);
        }
    };

    componentWillUnmount(): void {
        if (this.state.interval) {
            clearInterval(this.state.interval);
        }
    }

    getLog = () => {
        const path = `/log/?verbosity=${VerbosityLevel[this.state.verbosity]}${
            this.state.filter.component
                ? `&component=${this.state.filter.component}`
                : ""
        }${this.state.filter.tag ? `&tag=${this.state.filter.tag}` : ""}${
            this.state.filter.file ? `&file=${this.state.filter.file}` : ""
        }${
            this.state.filter.func ? `&function=${this.state.filter.func}` : ""
        }${
            this.state.after && this.state.fetchNewLogs
                ? `&after=${this.state.after + 1}`
                : ""
        }${
            this.state.before && !this.state.fetchNewLogs
                ? `&before=${this.state.before + 1}`
                : ""
        }`;
        requestFromApi(path)
            .then(async (response) => {
                if (response === undefined) return;
                let uuid = response.headers.get("Backend-UUID") || "";
                if (uuid === "") {
                    Store.addNotification({
                        title: "Backend unavailable!",
                        message: "",
                        type: "warning",
                        container: "top-right",
                        dismiss: {
                            duration: 900,
                        },
                    });
                }
                if (this.state.lastBackendUUID != uuid) {
                    if (this.state.lastBackendUUID !== undefined)
                        Store.addNotification({
                            title: "Backend Restarted!",
                            message: "New backend UUID: " + uuid,
                            type: "warning",
                            container: "top-right",
                        });
                    this.setState({
                        buffer: [],
                        lastBackendUUID: uuid,
                        after: 1,
                        before: 1,
                    });
                    return;
                }
                const unparsedLogs = (await response.json()) as BackendLog[];
                const newBuffer = unparsedLogs.map(
                    (log) =>
                        new LogMessage(
                            log["timestamp"],
                            log["tag"],
                            log["author"],
                            log["verbosity"],
                            log["message"],
                            log["file"],
                            log["function"],
                            log["id"]
                        )
                );
                if (newBuffer.length == 0) return;

                const buffer: LogMessage[] = this.state.buffer;

                if (this.state.buffer.length === 0) {
                    // buffer is empty, we fetch new logs by default
                    buffer.push(...newBuffer);
                    this.setState({
                        buffer: buffer,
                        after: newBuffer[newBuffer.length - 1].id,
                        before: newBuffer[0].id,
                    });
                } else if (this.state.fetchNewLogs) {
                    // user has scrolled down to view new logs
                    buffer.push(...newBuffer);
                    this.setState({
                        after: newBuffer[newBuffer.length - 1].id,
                    });
                } else {
                    // user has scrolled up to view older logs
                    if (
                        newBuffer[0].id === this.state.before ||
                        this.state.before === 0
                    ) {
                        return;
                    }
                    buffer.unshift(...newBuffer);
                    this.setState({ before: newBuffer[0].id });
                }
            })
            .then(() => {
                if (this.state.autoScroll) {
                    if (this.table)
                        this.table.scrollToRow(this.state.buffer.length);
                }
            });
    };

    updateVerbosity = (
        newVerbosity: VerbosityLevel,
        e: MouseEvent<HTMLElement>
    ) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ verbosity: newVerbosity });
        this.clearBuffer();
    };

    clearBuffer = (): void => {
        this.setState({ buffer: [], fetchNewLogs: true });
    };

    handleApplyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.setState({
            filter: {
                component: this.componentRef,
                tag: this.tagRef,
                file: this.fileRef,
                func: this.functionRef,
            },
        });
        this.clearBuffer();
    };

    handleTableScroll = (e: {
        scrollLeft: number;
        scrollTop: number;
        horizontalScrollDirection: "forward" | "backward";
        verticalScrollDirection: "forward" | "backward";
        scrollUpdateWasRequested: boolean;
    }) => {
        if (this.state.buffer.length === 0) {
            return;
        }
        if (e.verticalScrollDirection === "backward") {
            this.stopAutoScroll();
            this.setState({ fetchNewLogs: false });
        } else {
            this.setState({ fetchNewLogs: true });
        }
    };

    generateData = () => {
        return this.state.buffer.map((log) => {
            return {
                id: log.id,
                time: log.formattedTime,
                component: log.component,
                tag: log.tag,
                verbosity: VerbosityLevel[log.verbosity],
                message: log.message,
                file: log.file,
                function: log.func,
            };
        });
    };

    toggleAutoScroll = () => {
        this.setState({ autoScroll: !this.state.autoScroll });
    };

    stopAutoScroll = () => {
        this.setState({ autoScroll: false });
    };

    render(): JSX.Element {
        return (
            <div>
                <InputGroup id="range-input-group">
                    <Input
                        className="range"
                        type="range"
                        color="danger"
                        min={VerbosityLevel.Undefined}
                        max={VerbosityLevel.Fatal}
                        step={1}
                        value={this.state.verbosity}
                        onInput={(event) => {
                            this.setState({
                                verbosity: (event.target as HTMLFormElement)
                                    .value,
                            });
                        }}
                    />
                </InputGroup>
                <p className="verblevel">
                    Current verbosity level:
                    {VerbosityLevel[this.state.verbosity]}
                </p>
                <UncontrolledDropdown>
                    <DropdownToggle
                        caret
                        className="btn-icon"
                        color="link"
                        data-toggle="dropdown"
                        type="button"
                    >
                        <i className="tim-icons icon-settings-gear-63" />
                    </DropdownToggle>
                    <DropdownMenu aria-labelledby="dropdownMenuLink" end>
                        <DropdownItem href="#" onClick={this.clearBuffer}>
                            Clear logs
                        </DropdownItem>
                        <DropdownItem
                            href="#"
                            onClick={(e) => e.preventDefault()}
                        >
                            Add Filter
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
                <CardBody className="logger-body">
                    <div>
                        <FormGroup switch>
                            <Input
                                className="auto-scroll-button"
                                type="switch"
                                role="switch"
                                checked={this.state.autoScroll}
                                onChange={this.toggleAutoScroll}
                            ></Input>
                            <Label>Auto Scroll to Latest Logs</Label>
                        </FormGroup>
                        <AutoResizer>
                            {({ width, height }) => (
                                <BaseTable
                                    ref={this.setRef}
                                    onScroll={(e) => this.handleTableScroll(e)}
                                    data={this.generateData()}
                                    height={height}
                                    width={width}
                                    bordered
                                    className="fixed-header"
                                    rowHeight={35}
                                >
                                    <Column
                                        resizable={true}
                                        width={100}
                                        key="id"
                                        dataKey="id"
                                        title="ID"
                                    />
                                    <Column
                                        resizable={true}
                                        width={100}
                                        key="time"
                                        dataKey="time"
                                        title="Time"
                                    />
                                    <Column
                                        resizable={true}
                                        width={100}
                                        key="component"
                                        dataKey="component"
                                        title="Component"
                                    />
                                    <Column
                                        resizable={true}
                                        width={100}
                                        key="tag"
                                        dataKey="tag"
                                        title="Tag"
                                    />
                                    <Column
                                        className={({ cellData }) =>
                                            `${cellData.toLowerCase()}-cell verbosity-cell`
                                        }
                                        resizable={true}
                                        width={100}
                                        key="verbosity"
                                        dataKey="verbosity"
                                        title="Level"
                                    />
                                    <Column
                                        resizable={true}
                                        width={200}
                                        key="message"
                                        dataKey="message"
                                        title="Message"
                                    />
                                    <Column
                                        resizable={true}
                                        width={100}
                                        key="file"
                                        dataKey="file"
                                        title="File"
                                    />
                                    <Column
                                        className={"function-cell"}
                                        resizable={true}
                                        width={100}
                                        key="function"
                                        dataKey="function"
                                        title="Function"
                                    />
                                </BaseTable>
                            )}
                        </AutoResizer>
                    </div>
                    <Form onSubmit={(e) => this.handleApplyFilter(e)}>
                        <FormGroup>
                            <Input
                                color="black"
                                onChange={(e) => {
                                    this.tagRef = e.target.value;
                                }}
                                name="Tag"
                                id="Tag"
                                placeholder="Tag"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                onChange={(e) => {
                                    this.componentRef = e.target.value;
                                }}
                                name="Component"
                                id="Component"
                                placeholder="Component"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                onChange={(e) => {
                                    this.functionRef = e.target.value;
                                }}
                                name="Function"
                                id="Function"
                                placeholder="Function"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                onChange={(e) => {
                                    this.fileRef = e.target.value;
                                }}
                                name="File"
                                id="File"
                                placeholder="File"
                            />
                        </FormGroup>
                        <Button type="submit" color="danger">
                            Apply
                        </Button>
                    </Form>
                </CardBody>
            </div>
        );
    }
}

export default LoggerGUI;
