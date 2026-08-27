export const $ = (selector) =>
    document.querySelector(selector);

export const $$ = (selector) =>
    [...document.querySelectorAll(selector)];

export function showToast(message) {
    const el = $("#toast");

    if (!el) return;

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(window.__toastTimer);

    window.__toastTimer = setTimeout(() => {
        el.classList.remove("show");
    }, 3000);
}

export function initials(first = "", last = "") {
    return (
        (first[0] || "") +
        (last[0] || "")
    ).toUpperCase() || "B";
}

export function todayText() {
    const d = new Date();

    return new Intl.DateTimeFormat("uz-UZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long"
    }).format(d);
}

export function escapeHtml(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[m])
    );
}