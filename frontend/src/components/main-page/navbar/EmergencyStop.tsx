import React, { Component, ReactNode } from "react";
import { Button } from "reactstrap";
import { requestFromApi } from "../../../util/requestutil";

type EmergencyStopState = {
    pressed: boolean;
    error: boolean;
    interval?: ReturnType<typeof setInterval>;
};

const REFRESH_PERIOD = 1 * 1000;

class EmergencyStop extends Component<{}, EmergencyStopState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            pressed: false,
            error: false,
        };
    }

    componentDidMount(): void {
        this.startEmergencyStop(REFRESH_PERIOD);
    }

    startEmergencyStop = (seconds: number) => {
        this.setState({
            interval: setInterval(() => {
                this.stateUpdate();
            }, seconds),
        });
    };

    componentWillUnmount(): void {
        if (this.state.interval) {
            clearInterval(this.state.interval);
        }
    }

    stateUpdate = () => {
        requestFromApi("/emergencystop/", { ignoreErrors: true }).then(
            async (response) => {
                if (response === undefined) return;
                if (!response.ok) {
                    this.setState({ error: true });
                    return;
                }
                const pressed = await response.json();
                this.setState({ pressed });
            }
        );
    };

    buttonClicked = () => {
        requestFromApi(
            `/emergencystop/${this.state.pressed ? "release" : "stop"}`,
            { method: "PUT" }
        ).then(() => this.stateUpdate());
    };

    render(): ReactNode {
        if (this.state.error) {
            return (
                <Button color="danger" disabled>
                    EmergencyStop: Error in console.
                </Button>
            );
        }
        return (
            <Button
                color={this.state.pressed ? "warning" : "danger"}
                onClick={this.buttonClicked}
            >
                {this.state.pressed ? "Release" : "Trigger"} EmergencyStop SS2
            </Button>
        );
    }
}

export default EmergencyStop;
