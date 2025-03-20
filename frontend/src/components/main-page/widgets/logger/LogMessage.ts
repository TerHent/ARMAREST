import VerbosityLevel from "./VerbosityLevel";

class LogMessage {
    readonly id: number;
    readonly time: Date;
    readonly component: string;
    readonly tag: string;
    readonly verbosity: VerbosityLevel;
    readonly message: string;
    readonly file: string;
    readonly func: string;
    readonly formattedTime: string;

    constructor(
        time: number,
        tag: string,
        component: string,
        verbosity: VerbosityLevel,
        message: string,
        file: string,
        func: string,
        id: number
    ) {
        this.time = new Date(time);
        this.component = component;
        this.tag = tag;
        this.verbosity = verbosity;
        this.message = message;
        this.file = file;
        this.func = func;
        this.id = id;
        this.formattedTime = parseTime(time); //changeTimezone(new Date(time), "CET").toISOString();
    }
}

function parseTime(time: number): string {
    let date = new Date(time);
    return `${date.getFullYear()}/${
        date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
}
export default LogMessage;
