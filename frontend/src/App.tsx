import React, { Component } from "react";
import "./App.css";
import MainPage from "./components/main-page/MainPage";
import LoginPage from "./components/login/LoginPage";
import "../node_modules/react-notifications-component/dist/theme.css";
import { ReactNotifications } from "react-notifications-component";
import { requestFromApi } from "./util/requestutil";
class App extends Component {
    state = {
        loggedIn: false,
    };

    componentDidMount(): void {
        let token: string | null = localStorage.getItem("token");

        if (token === null) {
            return;
        }

        requestFromApi("/check_token/", { token }).then((res) => {
            if (res === undefined) return;
            if (res.status === 204) {
                this.setState({ loggedIn: true });
            }
        });
    }

    render() {
        let content: JSX.Element = this.state.loggedIn ? (
            <MainPage />
        ) : (
            <LoginPage
                logIn={() => {
                    this.setState({ loggedIn: true });
                }}
            />
        );
        return (
            <div>
                <ReactNotifications></ReactNotifications>
                {content}
            </div>
        );
    }
}

export default App;
