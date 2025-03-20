import Popup from "reactjs-popup";

export default function withTooltip(
    content: JSX.Element,
    tooltip: string
): JSX.Element {
    if (tooltip != "")
        return (
            <Popup
                trigger={content}
                position="right center"
                closeOnDocumentClick
            >
                <span>{tooltip}</span>
            </Popup>
        );
    else return content;
}
