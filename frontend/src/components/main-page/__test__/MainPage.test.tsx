import { render, screen } from "@testing-library/react";
import MainPage from "../MainPage";
import userEvent from "@testing-library/user-event";

test("MainPage can render NavBar and Footer", () => {
    render(<MainPage />);

    const navBarElement = screen.getByRole("navigation");
    expect(navBarElement).toBeInTheDocument();

    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toBeInTheDocument();
});

test("MainPage can add widget to workspace from NavBar", () => {
    render(<MainPage />);
    const widgetName = "Logger";
    const selectWidgetButton = screen.getByText(widgetName);
    userEvent.click(selectWidgetButton);
    const addedWidget = screen.getAllByText(widgetName);
    expect(addedWidget[0]).toBeInTheDocument();
});
