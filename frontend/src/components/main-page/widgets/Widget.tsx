import { ComponentType } from "react";
import { KinematicProps } from "./kinematic/KinematicUnitGUI";
import { RemoteGuiProps } from "./remote/RemoteGui";
import WidgetInstance, { InstanceRemover } from "./WidgetInstance";

export type ValidPropTypes = KinematicProps | RemoteGuiProps | {};

export default class Widget<PropType extends ValidPropTypes> {
    name: string;
    props: PropType;
    content: ComponentType<PropType>;

    nextid: number = 1;

    constructor(
        name: string,
        props: PropType,
        content: ComponentType<PropType>
    ) {
        this.name = name;
        this.props = props;
        this.content = content;
    }

    newInstance = (instanceRemover: InstanceRemover) => {
        return new WidgetInstance(this, this.nextid++, instanceRemover);
    };
}
