import React from "react";

export default class PermissionPopup extends React.Component<{}, {}> {
    render() {
        const token = localStorage.getItem("token");
        if (token === null) return <div>No token in local storage.</div>;

        const parts = token.split(".");
        if (parts.length !== 3) return <div>Invalid token.</div>;

        try {
            const parsedBody = JSON.parse(atob(parts[1]));
            const permissions = parsedBody.permissions || {};
            const roleName = parsedBody.role_name || "No Role";

            return (
                <div>
                    Your role: {roleName}
                    <br />
                    Permissions: <br />
                    {Object.keys(permissions).map((key) => (
                        <div>
                            {key}: {permissions[key].join(", ")}
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            console.log(e);
            return <div>Error occured while parsing.</div>;
        }
    }
}
