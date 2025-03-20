import { render, screen } from "@testing-library/react";
import { ValueVariant, ValueVariantType, WidgetState } from "../../BaseTypes";
import Label, { LabelProps } from "../Label";

export {}; // for tooling

test("Label contains given text", () => {
    let props = new LabelProps(
        "1",
        new ValueVariant(
            ValueVariantType.String,
            "This text should be displayed."
        ),
        new WidgetState(true, true),
        [],
        (props) => {
            return <div></div>;
        },
        (a, b) => {},
        "Tooltip"
    );
    render(<Label {...props} data-testid="label-1"></Label>);
    const labelElement = screen.getByText("This text should be displayed.");
    expect(labelElement).toBeInTheDocument();
});
