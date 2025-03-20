import React, { Component, ReactNode } from "react";
import "./login.css";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { requestFromApi } from "../../util/requestutil";

type LoginPageProps = {
    logIn: () => void;
};
type LoginPageState = {
    token: string;
};

class LoginPage extends Component<LoginPageProps, LoginPageState> {
    state: LoginPageState = {
        token: "",
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        requestFromApi("/check_token/", { token: this.state.token }).then(
            (res) => {
                if (res === undefined) return;
                if (res.status === 204) {
                    this.props.logIn();
                    localStorage.setItem("token", this.state.token);
                }
            }
        );
    };

    render(): ReactNode {
        return (
            <div className="container">
                <div className="screen">
                    <div className="screen__content">
                        <form className="login" onSubmit={this.handleSubmit}>
                            <div className="login__field">
                                <i className="login__icon fas fa-user"></i>
                                <input
                                    className="login__input"
                                    type="text"
                                    name="token"
                                    id="token"
                                    placeholder="Authorization Token"
                                    value={this.state.token}
                                    onChange={(event) =>
                                        this.setState({
                                            token: event.target.value,
                                        })
                                    }
                                />
                            </div>
                            <button
                                className="button login__submit"
                                type="submit"
                            >
                                <span className="button__text">Log In Now</span>
                                <i className="button__icon fas fa-chevron-right"></i>
                            </button>
                        </form>
                        <div className="social-login">
                            <h3>ARMAREST</h3>
                        </div>
                    </div>
                    <div className="screen__background">
                        <span className="screen__background__shape screen__background__shape4"></span>
                        <span className="screen__background__shape screen__background__shape3"></span>
                        <span className="screen__background__shape screen__background__shape2"></span>
                        <span className="screen__background__shape screen__background__shape1"></span>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;
