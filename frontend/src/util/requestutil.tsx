import { Store } from "react-notifications-component";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3300/api/v1";

type OptionalRequestArguments = {
    method?: string;
    token?: string;
    ignoreErrors?: boolean;
};

export function requestFromApi(
    path: string,
    args?: OptionalRequestArguments
): Promise<void | Response> {
    const { method, token, ignoreErrors } = args || {};
    return fetch(API_BASE_URL + path, {
        method: method || "GET",
        headers: {
            access_token: token || localStorage.getItem("token") || "",
        },
    }).then(async (res) => {
        if (ignoreErrors) return res;
        if (res.status === 404) {
            Store.addNotification({
                title: "Path not found",
                message: "Path: " + API_BASE_URL + path,
                type: "danger",
                insert: "top",
                container: "top-right",
            });
        } else if (res.status < 200 || res.status >= 300) {
            let errorBody = await res.json();
            Store.addNotification({
                title: `Error ${res.status} ${res.statusText}`,
                message: errorBody.error,
                type: "danger",
                insert: "top",
                container: "top-right",
            });
        } else {
            return res;
        }
    });
}
