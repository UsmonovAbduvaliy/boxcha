export const API = "";

export function token() {
    const t =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        "";

    return t.replace(/^Bearer\s+/i, "").trim();
}

export function decodeJwt(t) {
    try {
        const part = t.split(".")[1];

        return JSON.parse(
            decodeURIComponent(
                atob(part.replace(/-/g, "+").replace(/_/g, "/"))
                    .split("")
                    .map(c =>
                        "%" +
                        ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
            )
        );
    } catch {
        return {};
    }
}

export function currentUser() {
    const p = decodeJwt(token());

    const roles = p.roles || p.role || "";

    return {
        id: p.id,
        email: p.email || p.sub || "",
        name:
            p.firstName ||
            p.name ||
            p.username ||
            (p.email ? p.email.split("@")[0] : "Foydalanuvchi"),
        role: Array.isArray(roles)
            ? roles.join(", ")
            : String(roles),
        active: p.active
    };
}

export async function api(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const t = token();

    if (t) {
        headers.Authorization = `Bearer ${t}`;
    }

    const res = await fetch(API + path, {
        ...options,
        headers
    });

    if (res.status === 401 || res.status === 403) {
        throw new Error(`HTTP ${res.status}`);
    }

    if (!res.ok) {
        let message = `HTTP ${res.status}`;

        try {
            const body = await res.text();

            if (body) {
                message += `: ${body}`;
            }
        } catch {}

        throw new Error(message);
    }

    if (res.status === 204) {
        return null;
    }

    const text = await res.text();

    return text ? JSON.parse(text) : null;
}