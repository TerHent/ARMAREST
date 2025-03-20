import { act, render, screen } from "@testing-library/react";
import { ValueVariant, ValueVariantType, WidgetState } from "../../BaseTypes";
import Button, { ButtonProps } from "../Button";

export {}; // for tooling

test("Button can be clicked.", () => {
    let givenName, givenValue;
    let timesRan = 0;
    let props = new ButtonProps(
        "Button Component Name",
        new ValueVariant(ValueVariantType.Int, 0),
        new WidgetState(true, true),
        [],
        (props) => {
            return <div></div>;
        },
        (widgetName, updatedValue) => {
            givenName = widgetName;
            givenValue = updatedValue;
            timesRan++;
        },
        "Tooltip",
        "Button Text"
    );
    render(<Button {...props}></Button>);
    const labelElement = screen.getByText("Button Text");
    expect(labelElement).toBeInTheDocument();
    expect(givenName).toBeUndefined();
    expect(givenValue).toBeUndefined();
    expect(timesRan).toBe(0);
    act(() => {
        labelElement.click();
    });

    expect(givenName).toBe("Button Component Name");
    expect(givenValue).toEqual({ type: 2, value: 1 });
    expect(timesRan).toBe(1);
});
