import { render, screen } from "@testing-library/react";
import KinematicUnitGUI from "../KinematicUnitGUI";

test("Logger renders", () => {
    render(<KinematicUnitGUI unitName="fake" />);
    expect(
        document.getElementsByClassName("fixed-header")[0]
    ).toBeInTheDocument();
    expect(document.getElementsByTagName("Form")[0]).toBeInTheDocument();
});
