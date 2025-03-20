import React, { Component, ReactNode } from "react";
import Popup from "reactjs-popup";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import Widget from "../widgets/Widget";
import "./navbar.css";
import PermissionPopup from "./PermissionPopup";

import "reactjs-popup/dist/index.css";
import EmergencyStop from "./EmergencyStop";

type NavbarProps = {
    widgets: Widget<any>[];
    selectWidget: (widget: Widget<any>) => void;
    removeAll: () => void;
};
type NavbarState = {
    isOpen: boolean;
};

class NavBar extends Component<NavbarProps, NavbarState> {
    constructor(props: NavbarProps) {
        super(props);

        this.state = {
            isOpen: false,
        };
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    };

    render(): ReactNode {
        return (
            <div>
                <Navbar light expand="md" fixed="top">
                    <NavbarBrand href="/">ARMAREST</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <Popup
                                    trigger={
                                        <div className="nav-link">
                                            Permissions
                                        </div>
                                    }
                                >
                                    <PermissionPopup></PermissionPopup>
                                </Popup>
                            </NavItem>
                            <UncontrolledDropdown nav inNavbar>
                                <DropdownToggle nav caret>
                                    Add Widgets
                                </DropdownToggle>
                                <DropdownMenu end>
                                    {this.props.widgets.map((widget, i) => (
                                        <DropdownItem
                                            key={i}
                                            onClick={() => {
                                                this.props.selectWidget(
                                                    this.props.widgets[i]
                                                );
                                            }}
                                        >
                                            {this.props.widgets[i].name}
                                        </DropdownItem>
                                    ))}
                                    <DropdownItem divider />
                                    <DropdownItem
                                        onClick={this.props.removeAll}
                                    >
                                        Delete all widgets
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            <NavItem>
                                <NavLink
                                    href="#"
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        window.location.reload();
                                    }}
                                >
                                    Log out
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <EmergencyStop></EmergencyStop>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}

export default NavBar;
