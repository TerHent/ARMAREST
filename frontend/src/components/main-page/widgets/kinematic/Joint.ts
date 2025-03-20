import ControlMode from "./ControlMode";

class Joint {
    public name?: string;
    public controlMode?: ControlMode;
    public angle?: number;
    public velocity?: number;
    public torque?: number;
    public current?: number;
    public motorTemperature?: number;
    public status: {
        operation?: string;
        error?: string;
        enabled?: boolean;
        emergency_stop?: boolean;
    };

    public getValueFromControlMode = (
        controlMode: ControlMode
    ): number | undefined => {
        switch (controlMode) {
            case ControlMode.Angle:
                return this.angle;

            case ControlMode.Torque:
                return this.torque;

            case ControlMode.Velocity:
                return this.velocity;

            default:
                return 0;
        }
    };
    constructor(
        name?: string,
        controlMode?: ControlMode,
        angle?: number,
        velocity?: number,
        torque?: number,
        current?: number,
        motorTemperature?: number,
        operation?: string,
        error?: string,
        enabled?: boolean,
        emergency_stop?: boolean
    ) {
        this.name = name;
        this.controlMode = controlMode;
        this.angle = angle;
        this.velocity = velocity;
        this.torque = torque;
        this.current = current;
        this.motorTemperature = motorTemperature;
        this.status = {
            operation: operation,
            error: error,
            enabled: enabled,
            emergency_stop: emergency_stop,
        };
    }
}

export default Joint;
