import { render, screen } from "@testing-library/react";
import Logger from "../LoggerGUI";

test("Logger renders", () => {
    render(<Logger />);
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(document.getElementById("range-input-group")).toBeInTheDocument();
    expect(
        document.getElementsByClassName("auto-scroll-button")[0]
    ).toBeChecked();
});
