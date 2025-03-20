import React, { Component, FormEvent, ReactNode } from "react";
import { Store } from "react-notifications-component";
import {
    Card,
    CardHeader,
    CardBody,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Collapse,
    Table,
    Button,
    ButtonGroup,
    ButtonToolbar,
    FormGroup,
    Form,
    Label,
    Input,
} from "reactstrap";
import { requestFromApi } from "../../../../util/requestutil";
import ControlMode from "./ControlMode";
import Joint from "./Joint";
import "./kinematic.css";

const UPDATE_PERIOD_MS: number = 1 * 1000;

export type KinematicProps = {
    unitName: string;
};

type BackendJoint = {
    controlMode: ControlMode;
    angle: number;
    velocity: number;
    torque: number;
    current: number;
    motorTemperature: number;
    status: {
        operation: string;
        error: string;
        enabled: boolean;
        emergency_stop: boolean;
    };
};

type KinematicState = {
    selectControlModeDropdownOpen: boolean;
    selectJointDropdownOpen: boolean;
    running: boolean;
    interval?: ReturnType<typeof setInterval>;
    joints: Joint[];
    currentJoint?: Joint;
    currentControlMode: ControlMode;
    currentValue: string;
    isValueBeingModified: boolean;
};

class KinematicUnitGUI extends Component<KinematicProps, KinematicState> {
    state: KinematicState = {
        selectControlModeDropdownOpen: false,
        selectJointDropdownOpen: false,
        running: false,
        joints: [],
        currentControlMode: ControlMode.Undefined,
        currentValue: "",
        isValueBeingModified: false,
    };

    constructor(props: KinematicProps) {
        super(props);
    }

    componentDidMount(): void {
        this.setState({ running: true });
        this.startUpdate(UPDATE_PERIOD_MS);
    }

    startUpdate = (seconds: number): void => {
        this.setState({
            interval: setInterval(() => {
                this.everySecond();
            }, seconds),
        });
    };

    everySecond = () => {
        if (this.state.running) {
            this.update();
        } else {
            clearInterval(this.state.interval);
        }
    };

    update = () => {
        requestFromApi(`/kinematic/${this.props.unitName}/joints/`)
            .then(async (response) => {
                if (response === undefined) return;
                const entries = Object.entries(await response.json());
                let joints: Joint[];
                if (this.state.joints.length > 0) {
                    joints = this.state.joints;
                    for (let i = 0; i < this.state.joints.length; i++) {
                        let body = entries[i][1] as BackendJoint;
                        joints[i].controlMode = body.controlMode;
                        joints[i].angle = body.angle;
                        joints[i].velocity = body.velocity;
                        joints[i].torque = body.torque;
                        joints[i].current = body.current;
                        joints[i].motorTemperature = body.motorTemperature;
                        if (body.status) {
                            joints[i].status.operation = body.status.operation;
                            joints[i].status.error = body.status.error;
                            joints[i].status.enabled = body.status.enabled;
                            joints[i].status.emergency_stop =
                                body.status.emergency_stop;
                        }
                    }
                } else {
                    joints = entries.map((entry) => {
                        let backendProps = entry[1] as BackendJoint;

                        return new Joint(
                            entry[0],
                            backendProps.controlMode,
                            backendProps.angle,
                            backendProps.velocity,
                            backendProps.torque,
                            backendProps.current,
                            backendProps.motorTemperature,
                            backendProps.status?.operation,
                            backendProps.status?.error,
                            backendProps.status?.enabled,
                            backendProps.status?.emergency_stop
                        );
                    });
                }
                this.setState({ joints: joints });
            })
            .then(() => {
                if (!this.state.isValueBeingModified) {
                    this.updateCurrentValue();
                }
            });
    };

    selectCurrentJoint = (joint: Joint) => {
        this.setState({ currentJoint: joint });
        this.updateCurrentValue();
    };

    selectCurrentControlMode = (controlMode: ControlMode) => {
        this.setState({ currentControlMode: controlMode });
        this.updateCurrentValue();
    };

    updateCurrentValue = () => {
        let value =
            typeof this.state.currentJoint !== "undefined"
                ? String(
                      this.state.currentJoint?.getValueFromControlMode(
                          this.state.currentControlMode
                      )
                  )
                : "";
        this.setState({ currentValue: value });
    };

    toggleSelectJoint = () => {
        this.setState((prevState) => ({
            selectJointDropdownOpen: !prevState.selectJointDropdownOpen,
        }));
    };

    toggleSelectControlMode = () => {
        this.setState((prevState) => ({
            selectControlModeDropdownOpen:
                !prevState.selectControlModeDropdownOpen,
        }));
    };

    handleUpdate = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (typeof this.state.currentJoint === "undefined") {
            return;
        }
        let controlMode =
            ControlMode[this.state.currentControlMode].toLowerCase();
        requestFromApi(
            `/kinematic/${this.props.unitName}/joint/${this.state.currentJoint.name}/${controlMode}?${controlMode}=${this.state.currentValue}`,
            { method: "PUT", ignoreErrors: true }
        ).then(async (res) => {
            if (res === undefined) return;
            if (res.status === 204) return;

            // Handle errors:
            const errorObject = await res.json();
            let message: string;
            switch (errorObject.kind) {
                case "OutOfRangeException":
                    message = "";
                    for (let violation of errorObject.violation)
                        message += `Out of range: Value should be between ${violation.range_from} and ${violation.range_to} but it was ${violation.actual_value}<br/>`;
                    break;
                case "ControlModeNotSupportedException":
                    message =
                        "The joint does not support the control mode " +
                        errorObject.mode;
                    break;
                case "KinematicUnitUnavailable":
                    console.log(
                        "KinematicUnitUnavailable! NodeOwners:",
                        errorObject.nodeOwners
                    );
                    message =
                        "The selected kinematic unit is currently unavailable. Check the console for details.";
                    break;
                case "KinematicUnitNotOwnedException":
                    console.log(
                        "KinematicUnitNotOwnedException! Nodes:",
                        errorObject.nodes
                    );
                    message =
                        "The selected kinematic unit is not owned. Check the console for details.";
                    break;
                default:
                    message =
                        "Unknown Kinematic Unit error " + errorObject.kind;
            }
            Store.addNotification({
                title: "Error: " + errorObject.kind,
                message,
                type: "danger",
                insert: "top",
                container: "top-right",
            });
        });
    };

    render(): ReactNode {
        return (
            <CardBody className="kinematic-body">
                <div className="table-scroll">
                    <Table height="200" bordered className="fixed-header">
                        <thead className="text-primary">
                            <tr>
                                <th>
                                    <div className="resizable">Joint Name</div>
                                </th>
                                <th>
                                    <div className="resizable">
                                        Control Mode
                                    </div>
                                </th>
                                <th>
                                    <div className="resizable">Angle</div>
                                </th>
                                <th>
                                    <div className="resizable">Velocity</div>
                                </th>
                                <th>
                                    <div className="resizable">Torque</div>
                                </th>
                                <th>
                                    <div className="resizable">Current</div>
                                </th>
                                <th>
                                    <div className="resizable">Temperature</div>
                                </th>
                                <th>
                                    <div className="resizable">Operation</div>
                                </th>
                                <th>
                                    <div className="resizable">Error</div>
                                </th>
                                <th>
                                    <div className="resizable">Enabled</div>
                                </th>
                                <th>
                                    <div className="resizable">
                                        Emergency stop
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.joints.map((joint: Joint, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{joint.name}</td>
                                        <td>{joint.controlMode}</td>
                                        <td>{joint.angle?.toFixed(3)}</td>
                                        <td>{joint.velocity?.toFixed(3)}</td>
                                        <td>{joint.torque?.toFixed(3)}</td>
                                        <td>{joint.current?.toFixed(3)}</td>
                                        <td>
                                            {joint.motorTemperature?.toFixed(3)}
                                        </td>
                                        <td>{joint.status.operation ?? ""}</td>
                                        <td>{joint.status.error ?? ""}</td>
                                        <td>
                                            {String(joint.status.enabled ?? "")}
                                        </td>
                                        <td>
                                            {String(
                                                joint.status.emergency_stop ??
                                                    ""
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <Form onSubmit={(e) => this.handleUpdate(e)}>
                    <Dropdown
                        isOpen={this.state.selectJointDropdownOpen}
                        toggle={this.toggleSelectJoint}
                    >
                        <DropdownToggle caret>
                            Current Joint:{" "}
                            {this.state.currentJoint
                                ? this.state.currentJoint.name
                                : "No joint selected yet"}
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu">
                            {this.state.joints.map((joint: Joint, index) => {
                                return (
                                    <DropdownItem
                                        key={index}
                                        onClick={() =>
                                            this.selectCurrentJoint(joint)
                                        }
                                    >
                                        {joint.name}
                                    </DropdownItem>
                                );
                            })}
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown
                        isOpen={this.state.selectControlModeDropdownOpen}
                        toggle={this.toggleSelectControlMode}
                    >
                        <DropdownToggle caret>
                            Current Control Mode:{" "}
                            {ControlMode[this.state.currentControlMode]}
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu">
                            {Object.keys(ControlMode).map((key, index) => {
                                if (!isNaN(Number(key))) {
                                    let controlMode: ControlMode = +key;
                                    return (
                                        <DropdownItem
                                            key={index}
                                            onClick={() =>
                                                this.selectCurrentControlMode(
                                                    controlMode
                                                )
                                            }
                                        >
                                            {ControlMode[controlMode]}
                                        </DropdownItem>
                                    );
                                }
                            })}
                        </DropdownMenu>
                    </Dropdown>

                    <Input
                        value={this.state.currentValue}
                        onChange={(e) => {
                            this.setState({ currentValue: e.target.value });
                        }}
                        onFocus={() => {
                            this.setState({ isValueBeingModified: true });
                        }}
                        onBlur={() => {
                            this.setState({ isValueBeingModified: false });
                        }}
                    ></Input>
                    <Button type="submit">Update</Button>
                </Form>
            </CardBody>
        );
    }
}

export default KinematicUnitGUI;
