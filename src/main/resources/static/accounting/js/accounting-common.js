
// =========================================================
// BOXCHA — ACCOUNTING COMMON
// =========================================================
// Accounting frontend uchun umumiy funksiyalar.
// Dashboard / Payments / Salaries / Expenses shu fayldan
// foydalanadi.
// =========================================================


// =========================================================
// IMPORT API
// =========================================================

import {
    getAccountingDashboard
} from "./accounting-api.js";


// =========================================================
// GLOBAL STATE
// =========================================================

let currentAccountingPage = "dashboard";


// =========================================================
// DOM HELPER
// =========================================================

export function $(selector) {
    return document.querySelector(selector);
}

export function $$(selector) {
    return document.querySelectorAll(selector);
}


// =========================================================
// TOKEN
// =========================================================

export function getAccountingToken() {

    const possibleKeys = [
        "accessToken",
        "token",
        "access_token"
    ];

    for (const key of possibleKeys) {

        const value = localStorage.getItem(key);

        if (value && value.trim()) {

            return value
                .replace(/^Bearer\s+/i, "")
                .trim();
        }
    }

    return null;
}


// =========================================================
// CHECK AUTH
// =========================================================

export function isAuthenticated() {

    return Boolean(
        getAccountingToken()
    );
}


// =========================================================
// REQUIRE AUTH
// =========================================================

export function requireAuth() {

    if (!isAuthenticated()) {

        window.location.href =
            "/auth/login.html";

        return false;
    }

    return true;
}


// =========================================================
// LOGOUT
// =========================================================

export function logoutAccounting() {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");

    localStorage.removeItem("user");

    window.location.href =
        "/login.html";
}


// =========================================================
// FORMAT MONEY
// =========================================================

export function formatMoney(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0 so‘m";
    }

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return "0 so‘m";
    }

    return new Intl.NumberFormat(
        "uz-UZ"
    ).format(number) + " so‘m";
}


// =========================================================
// FORMAT NUMBER
// =========================================================

export function formatNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0";
    }

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return "0";
    }

    return new Intl.NumberFormat(
        "uz-UZ"
    ).format(number);
}


// =========================================================
// FORMAT DATE
// =========================================================

export function formatDate(
    date
) {

    if (!date) {
        return "—";
    }

    try {

        const parsed =
            new Date(date);

        if (Number.isNaN(
            parsed.getTime()
        )) {
            return date;
        }

        return new Intl.DateTimeFormat(
            "uz-UZ",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        ).format(parsed);

    } catch (error) {

        console.error(
            "Date format error:",
            error
        );

        return date;
    }
}


// =========================================================
// FORMAT MONTH
// =========================================================

export function formatMonth(
    month
) {

    if (!month) {
        return "—";
    }

    try {

        const date =
            new Date(
                `${month}T00:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return month;
        }

        return new Intl.DateTimeFormat(
            "uz-UZ",
            {
                month: "long",
                year: "numeric"
            }
        ).format(date);

    } catch (error) {

        console.error(
            "Month format error:",
            error
        );

        return month;
    }
}


// =========================================================
// CURRENT MONTH
// =========================================================

export function getCurrentMonth() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}`;
}


// =========================================================
// MONTH TO LOCALDATE
// =========================================================
// HTML input type="month":
//
// 2026-09
//
// Backend:
//
// 2026-09-01
// =========================================================

export function monthToLocalDate(
    month
) {

    if (!month) {
        return null;
    }

    return `${month}-01`;
}


// =========================================================
// LOCALDATE TO MONTH
// =========================================================
// Backend:
//
// 2026-09-01
//
// HTML:
//
// 2026-09
// =========================================================

export function localDateToMonth(
    date
) {

    if (!date) {
        return "";
    }

    return String(date)
        .substring(
            0,
            7
        );
}


// =========================================================
// ESCAPE HTML
// =========================================================
// XSS va HTML buzilishining oldini olish uchun.
// API'dan kelgan textlarni innerHTML ichida ishlatganda
// kerak bo'ladi.
// =========================================================

export function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// =========================================================
// PAYMENT STATUS
// =========================================================

export function getPaymentStatusText(
    status
) {

    switch (
        String(status || "")
            .toUpperCase()
    ) {

        case "PAID":
            return "To‘langan";

        case "UNPAID":
            return "To‘lanmagan";

        case "PARTIAL":
            return "Qisman";

        default:
            return status || "Noma’lum";
    }
}


// =========================================================
// SALARY STATUS
// =========================================================

export function getSalaryStatusText(
    status
) {

    switch (
        String(status || "")
            .toUpperCase()
    ) {

        case "PAID":
            return "To‘langan";

        case "UNPAID":
            return "To‘lanmagan";

        default:
            return status || "Noma’lum";
    }
}


// =========================================================
// EXPENSE CATEGORY TEXT
// =========================================================

export function getExpenseCategoryText(
    category
) {

    const categories = {

        FOOD:
            "Oziq-ovqat",

        OFFICE_SUPPLIES:
            "Kanselyariya",

        MEDICINE:
            "Dori-darmon",

        CLEANING:
            "Tozalash",

        EQUIPMENT:
            "Jihozlar",

        REPAIR:
            "Ta’mirlash",

        UTILITIES:
            "Kommunal",

        TRANSPORT:
            "Transport",

        OTHER:
            "Boshqa"
    };

    return categories[
        String(category || "")
            .toUpperCase()
    ] || category || "Boshqa";
}


// =========================================================
// STATUS CLASS
// =========================================================

export function getStatusClass(
    status
) {

    return String(
        status || ""
    )
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );
}


// =========================================================
// TOAST CONTAINER
// =========================================================

function getToastContainer() {

    let container =
        document.querySelector(
            "#accountingToastContainer"
        );

    if (container) {
        return container;
    }

    container =
        document.createElement(
            "div"
        );

    container.id =
        "accountingToastContainer";

    container.className =
        "accounting-toast-container";

    document.body.appendChild(
        container
    );

    return container;
}


// =========================================================
// TOAST
// =========================================================

export function showToast(
    message,
    type = "success"
) {

    const container =
        getToastContainer();

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `accounting-toast accounting-toast-${type}`;

    const icon =
        document.createElement(
            "span"
        );

    icon.className =
        "accounting-toast-icon";

    if (type === "success") {
        icon.textContent = "✓";
    } else if (type === "error") {
        icon.textContent = "!";
    } else if (type === "warning") {
        icon.textContent = "!";
    } else {
        icon.textContent = "i";
    }

    const text =
        document.createElement(
            "span"
        );

    text.className =
        "accounting-toast-text";

    text.textContent =
        message;

    toast.appendChild(
        icon
    );

    toast.appendChild(
        text
    );

    container.appendChild(
        toast
    );


    // Animation boshlanishi

    requestAnimationFrame(() => {

        toast.classList.add(
            "show"
        );

    });


    // 4 sekunddan keyin o'chirish

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 4000);
}


// =========================================================
// LOADING
// =========================================================

export function showLoading(
    element
) {

    if (!element) {
        return;
    }

    element.innerHTML = `
<div class="accounting-loading">
    <div class="loading-spinner"></div>
<span>
                Ma’lumotlar yuklanmoqda...
            </span>
</div>
`;
}


// =========================================================
// EMPTY STATE
// =========================================================

export function showEmptyState(
    element,
    message = "Ma’lumot topilmadi"
) {

    if (!element) {
        return;
    }

    element.innerHTML = `
<div class="accounting-empty-state">
    <div class="empty-state-icon">
                ∅
</div>

<h3>
    ${escapeHtml(message)}
</h3>

<p>
    Hozircha ko‘rsatish uchun ma’lumot mavjud emas.
</p>
</div>
`;
}


// =========================================================
// ERROR STATE
// =========================================================

export function showErrorState(
    element,
    message = "Ma’lumotlarni yuklashda xatolik yuz berdi"
) {

    if (!element) {
        return;
    }

    element.innerHTML = `
<div class="accounting-error-state">

    <div class="error-state-icon">
    !
    </div>

<h3>
    Xatolik yuz berdi
</h3>

<p>
    ${escapeHtml(message)}
</p>

<button
    type="button"
    class="accounting-retry-btn"
    data-action="retry"
>
    Qayta urinish
</button>

</div>
`;
}


// =========================================================
// DEBOUNCE
// =========================================================

export function debounce(
    callback,
    delay = 300
) {

    let timeout;

    return function (...args) {

        clearTimeout(
            timeout
        );

        timeout =
            setTimeout(() => {

                callback.apply(
                    this,
                    args
                );

            }, delay);
    };
}


// =========================================================
// SAFE JSON
// =========================================================

export function safeJsonParse(
    value,
    fallback = null
) {

    if (!value) {
        return fallback;
    }

    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        console.error(
            "JSON parse error:",
            error
        );

        return fallback;
    }
}


// =========================================================
// USER DATA
// =========================================================

export function getCurrentUser() {

    const possibleKeys = [
        "user",
        "currentUser"
    ];

    for (
        const key
        of possibleKeys
    ) {

        const value =
            localStorage.getItem(
                key
            );

        if (value) {

            const parsed =
                safeJsonParse(
                    value
                );

            if (parsed) {
                return parsed;
            }
        }
    }

    return null;
}


// =========================================================
// SET USER NAME
// =========================================================

export function renderAccountingUser() {

    const element =
        $("#accountingUser");

    if (!element) {
        return;
    }

    const user =
        getCurrentUser();

    if (!user) {
        element.textContent =
            "Admin";

        return;
    }

    const firstName =
        user.firstName || "";

    const lastName =
        user.lastName || "";

    const fullName =
        `${firstName} ${lastName}`
            .trim();

    element.textContent =
        fullName || "Admin";
}


// =========================================================
// NAVIGATION
// =========================================================

export function getCurrentPage() {

    return currentAccountingPage;
}


export function setCurrentPage(
    page
) {

    currentAccountingPage =
        page;
}


// =========================================================
// PAGE TITLE
// =========================================================

export function setPageHeader(
    title,
    subtitle
) {

    const titleElement =
        $("#pageTitle");

    const subtitleElement =
        $("#pageSubtitle");

    if (titleElement) {

        titleElement.textContent =
            title;
    }

    if (subtitleElement) {

        subtitleElement.textContent =
            subtitle;
    }
}


// =========================================================
// ACTIVE NAVIGATION
// =========================================================

export function setActiveNavigation(
    page
) {

    $$(".accounting-nav-item")
        .forEach(button => {

            const buttonPage =
                button.dataset.page;

            button.classList.toggle(
                "active",
                buttonPage === page
            );

        });
}


// =========================================================
// MOBILE SIDEBAR
// =========================================================

export function openMobileSidebar() {

    document.body.classList.add(
        "accounting-sidebar-open"
    );
}


export function closeMobileSidebar() {

    document.body.classList.remove(
        "accounting-sidebar-open"
    );
}


export function toggleMobileSidebar() {

    document.body.classList.toggle(
        "accounting-sidebar-open"
    );
}


// =========================================================
// BACK TO CABINET
// =========================================================

export function goToCabinet() {

    window.location.href =
        "/cabinet.html";
}


// =========================================================
// MONTH INPUT
// =========================================================

export function initializeMonthInput() {

    const input =
        $("#accountingMonth");

    if (!input) {
        return;
    }

    if (!input.value) {

        input.value =
            getCurrentMonth();
    }
}


// =========================================================
// API ERROR MESSAGE
// =========================================================

export function getErrorMessage(
    error
) {

    if (!error) {
        return "Noma’lum xatolik";
    }

    switch (error.message) {

        case "AUTH_REQUIRED":

            return "Sessiya tugagan. Qaytadan login qiling.";

        case "ACCESS_DENIED":

            return "Bu bo‘limga kirish uchun ruxsatingiz yo‘q.";

        case "NOT_FOUND":

            return "Ma’lumot topilmadi.";

        default:

            return error.message ||
                "Noma’lum xatolik";
    }
}


// =========================================================
// CONFIRM DELETE
// =========================================================

export function confirmDelete(
    message =
        "Haqiqatan ham o‘chirmoqchimisiz?"
) {

    return window.confirm(
        message
    );
}


// =========================================================
// INITIALIZE COMMON
// =========================================================

export function initializeAccountingCommon() {

    initializeMonthInput();

    renderAccountingUser();

    setupNavigation();

    setupMobileMenu();

    setupLogout();

    setupBackToCabinet();
}


// =========================================================
// NAVIGATION SETUP
// =========================================================

function setupNavigation() {

    $$(".accounting-nav-item[data-page]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    if (!page) {
                        return;
                    }

                    setCurrentPage(
                        page
                    );

                    setActiveNavigation(
                        page
                    );

                    closeMobileSidebar();

                    window.dispatchEvent(
                        new CustomEvent(
                            "accounting:navigate",
                            {
                                detail: {
                                    page
                                }
                            }
                        )
                    );
                }
            );

        });
}


// =========================================================
// MOBILE MENU SETUP
// =========================================================

function setupMobileMenu() {

    const menuButton =
        $("#mobileMenuBtn");

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            toggleMobileSidebar
        );
    }


    const overlay =
        $("#accountingOverlay");

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }
}


// =========================================================
// LOGOUT SETUP
// =========================================================

function setupLogout() {

    const button =
        $("#accountingLogoutBtn");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Hisobdan chiqmoqchimisiz?"
                );

            if (!confirmed) {
                return;
            }

            logoutAccounting();
        }
    );
}


// =========================================================
// CABINET BUTTON
// =========================================================

function setupBackToCabinet() {

    const button =
        $("#backToCabinetBtn");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        goToCabinet
    );
}


// =========================================================
// HANDLE AUTH ERROR
// =========================================================

export function handleAccountingError(
    error
) {

    console.error(
        "Accounting error:",
        error
    );

    const message =
        getErrorMessage(
            error
        );

    if (
        error &&
        (
            error.message ===
            "AUTH_REQUIRED"
        )
    ) {

        showToast(
            message,
            "error"
        );

        setTimeout(
            () => {

                window.location.href =
                    "/login.html";

            },
            1000
        );

        return;
    }

    showToast(
        message,
        "error"
    );
}
