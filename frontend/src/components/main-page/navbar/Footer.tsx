import { Container, Nav, NavItem, NavLink } from "reactstrap";
import React, { Component, ReactNode } from "react";
import "./navbar.css";

class Footer extends Component {
    render(): ReactNode {
        return (
            <footer className="footer">
                <Container fluid>
                    <Nav>
                        <NavItem>
                            <NavLink href="https://git.h2t.iar.kit.edu/student-projects/pse-ws2223/rest">
                                ARMAREST GIT
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="https://git.h2t.iar.kit.edu/student-projects/pse-ws2223/rest">
                                Documentation
                            </NavLink>
                        </NavItem>
                    </Nav>
                </Container>
            </footer>
        );
    }
}

export default Footer;
