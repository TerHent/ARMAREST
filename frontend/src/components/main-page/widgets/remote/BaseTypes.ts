export type Value = null | boolean | number | string | number[];

export type ComponentSupplier = (props?: WidgetProps) => JSX.Element;
export type UpdateNotificationAccepter = (
    widgetName: string,
    update: ValueVariant
) => void;

export enum ValueVariantType {
    Empty,
    Bool,
    Int,
    Float,
    String,
    Vector3,
    Matrix4,
}

export class ValueVariant {
    type: ValueVariantType;
    value: Value;

    constructor(type: ValueVariantType, value: Value) {
        this.type = type;
        this.value = value;
    }
}

export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class WidgetState {
    hidden: boolean;
    disabled: boolean;

    constructor(hidden: boolean, disabled: boolean) {
        this.disabled = disabled;
        this.hidden = hidden;
    }
}

export class WidgetProps {
    name: string;
    value: ValueVariant;
    state: WidgetState;
    children: WidgetProps[];
    key: string;

    propsToComponent: ComponentSupplier;
    updateNotificationAccepter: UpdateNotificationAccepter;

    constructor(
        name: string,
        value: ValueVariant,
        state: WidgetState,
        children: WidgetProps[],
        propsToComponent: ComponentSupplier,
        updateNotificationAccepter: UpdateNotificationAccepter
    ) {
        this.name = name;
        this.key = name;
        this.value = value;
        this.state = state;
        this.children = children;
        this.propsToComponent = propsToComponent;
        this.updateNotificationAccepter = updateNotificationAccepter;
    }
}

export class WidgetWithToolTipProps extends WidgetProps {
    tooltip: string;

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
            updateNotificationAccepter
        );
        this.tooltip = tooltip;
    }
}
