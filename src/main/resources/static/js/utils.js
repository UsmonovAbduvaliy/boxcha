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

// Browsers don't ship an "uz-UZ" date locale (it renders months as "M09"),
// so we localise dates manually.
const UZ_MONTHS = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const UZ_MONTHS_SHORT = [
    "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
    "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
];

const UZ_WEEKDAYS = [
    "Yakshanba", "Dushanba", "Seshanba", "Chorshanba",
    "Payshanba", "Juma", "Shanba"
];

export const uzMonth = (d) => UZ_MONTHS[d.getMonth()];
export const uzMonthShort = (d) => UZ_MONTHS_SHORT[d.getMonth()];
export const uzWeekday = (d) => UZ_WEEKDAYS[d.getDay()];

export function todayText() {
    const d = new Date();

    return `${d.getDate()}-${uzMonth(d)} ${d.getFullYear()}, ${uzWeekday(d)}`;
}

// Enum values (MALE/FEMALE) leak from the backend — show them in Uzbek.
export function genderText(value) {
    const v = String(value || "").trim().toUpperCase();

    if (["MALE", "M", "ERKAK", "O'G'IL", "O‘G‘IL", "BOY"].includes(v)) {
        return "O‘g‘il";
    }

    if (["FEMALE", "F", "AYOL", "QIZ", "GIRL"].includes(v)) {
        return "Qiz";
    }

    return value ? String(value) : "—";
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