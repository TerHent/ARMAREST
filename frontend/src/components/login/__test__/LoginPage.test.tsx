import { render, screen } from "@testing-library/react";
import LoginPage from "../LoginPage";
import userEvent from "@testing-library/user-event";

test("Login can render", () => {
    render(<LoginPage logIn={() => {}} />);

    const loginInput = document.getElementsByTagName("form")[0];
    expect(loginInput).toBeInTheDocument();
    const socialLogin = document.getElementsByClassName("social-login")[0];
    expect(socialLogin).toBeInTheDocument();
    const screenBackground =
        document.getElementsByClassName("screen__background")[0];
    expect(screenBackground).toBeInTheDocument();
});
