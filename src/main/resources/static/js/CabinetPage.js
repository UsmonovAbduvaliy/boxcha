import {
    token,
    currentUser,
    isAdmin,
    isTeacher,
    isDoctor
} from "./api.js";

import {
    $,
    $$,
    todayText,
    uzMonth,
    uzMonthShort,
    uzWeekday
} from "./utils.js";

import {
    loadDashboard
} from "./dashboard.js";

import {
    loadGroupsPage
} from "./groups.js";

import {
    loadChildren,
    renderChildren,
    openNewChild,
    initChildForm
} from "./children.js";

import {
    loadUsers,
    renderUsers,
    openNewTeacher,
    initTeacherForm,
    initTeacherView
} from "./teachers.js";

import {
    loadOthers,
    renderOthers,
    openNewOther,
    initOtherForm
} from "./others.js";

import {
    loadAttendanceChildren,
    showAttendance
} from "./attendance.js";

import {
    initModals
} from "./modals.js";


const state = {

    dashboard: null,

    groups: [],

    children: [],

    users: [],

    others: [],

    roles: [],

    childFilter: "all",

    userFilter: "all",

    otherFilter: "all"

};


state.loadChildren =
    async silent => {

        await loadChildren(
            state,
            silent
        );

    };


/* =====================================================
   ROLE
   ===================================================== */

function getRole() {

    return currentUser().role;

}


/* =====================================================
   SETUP USER
   ===================================================== */

function setupUser() {

    const u =
        currentUser();


    const name =
        u.name ||
        "Foydalanuvchi";


    const role =
        u.role ||
        "Foydalanuvchi";


    $("#welcomeName").textContent =
        name;


    $("#profileName").textContent =
        name;


    $("#topName").textContent =
        name;


    $("#profileRole").textContent =
        role;


    $("#topRole").textContent =
        role;


    $("#profileAvatar").textContent =
        name[0].toUpperCase();


    $("#topAvatar").textContent =
        name[0].toUpperCase();


    const d =
        new Date();


    $("#todayDate").textContent =
        `${d.getDate()} ${uzMonthShort(d)}`;


    $("#calendarDay").textContent =
        d.getDate();


    $("#calendarMonth").textContent =
        uzMonth(d);


    $("#calendarWeekday").textContent =
        uzWeekday(d);


    $("#pageSubtitle").textContent =
        todayText() +
        " • Boxcha boshqaruv paneli";

}


/* =====================================================
   ROLE BASED UI
   ===================================================== */

function setupRoleAccess() {

    const role =
        getRole();


    console.log(
        "Current user role:",
        role
    );


    const teachersNav =
        $('[data-page="teachers"]');


    const othersNav =
        $('[data-page="others"]');


    const notification =
        $(".notification");


    /*
     * BILDIRISHNOMA
     *
     * Hamma userlardan olib tashlanadi.
     */

    if (notification) {

        notification.remove();

    }


    /*
     * USTOZLAR
     *
     * Faqat ADMIN ko'radi.
     */

    if (teachersNav) {

        teachersNav.style.display =
            isAdmin()
                ? ""
                : "none";

    }


    /*
     * BOSHQALAR
     *
     * Faqat ADMIN ko'radi.
     */

    if (othersNav) {

        othersNav.style.display =
            isAdmin()
                ? ""
                : "none";

    }


    /*
     * TEACHER / DOCTOR
     *
     * Agar tasodifan yashirilgan page ochilib qolsa,
     * uni dashboardga qaytaramiz.
     */

    if (
        !isAdmin() &&
        (
            location.hash === "#teachers" ||
            location.hash === "#others"
        )
    ) {

        history.replaceState(
            null,
            "",
            location.pathname
        );

    }


    /*
     * TEACHER / DOCTOR uchun
     * admin-only add buttonlar.
     */

    if (!isAdmin()) {

        $("#addTeacherBtn")?.remove();

        $("#addOtherBtn")?.remove();

    }

}


/* =====================================================
   PAGE ACCESS
   ===================================================== */

function canOpenPage(page) {

    /*
     * ADMIN
     * hammasiga access.
     */

    if (isAdmin()) {

        return true;

    }


    /*
     * TEACHER
     * Dashboard
     * Groups
     * Children
     * Attendance
     */

    if (isTeacher()) {

        return [
            "dashboard",
            "groups",
            "children",
            "attendance"
        ].includes(page);

    }


    /*
     * DOCTOR
     * Dashboard
     * Groups
     * Children
     * Attendance
     */

    if (isDoctor()) {

        return [
            "dashboard",
            "groups",
            "children",
            "attendance"
        ].includes(page);

    }


    return [
        "dashboard"
    ].includes(page);

}


/* =====================================================
   SET PAGE
   ===================================================== */

async function setPage(page) {

    if (!canOpenPage(page)) {

        console.warn(
            `Access denied for page: ${page}`
        );

        await setPage("dashboard");

        return;

    }


    $$(".page")
        .forEach(x =>
            x.classList.remove("active")
        );


    const target =
        $(`#page-${page}`);


    if (!target) {

        return;

    }


    target.classList.add("active");


    $$(".nav-item")
        .forEach(x =>
            x.classList.toggle(
                "active",
                x.dataset.page === page
            )
        );


    const titles = {

        dashboard:
            `Salom, ${
                currentUser().name ||
                "Foydalanuvchi"
            }! 🌿`,

        groups:
            "Guruhlar",

        children:
            "Bolalar",

        teachers:
            "Ustozlar",

        others:
            "Boshqalar",

        attendance:
            "Davomat",

        settings:
            "Sozlamalar"

    };


    $("#pageTitle").textContent =
        titles[page] ||
        "Boxcha";


    $("#pageSubtitle").textContent =
        page === "dashboard"

            ? todayText() +
            " • Boxcha boshqaruv paneli"

            : "Boxcha ma'lumotlarini boshqarish";


    if (page === "dashboard") {

        await loadDashboard(
            state,
            state.loadChildren
        );

    }


    if (page === "groups") {

        await loadGroupsPage(
            state
        );

    }


    if (page === "children") {

        await loadChildren(
            state
        );

    }


    if (page === "teachers") {

        if (!isAdmin()) {

            await setPage("dashboard");

            return;

        }


        await loadUsers(
            state
        );

    }


    if (page === "others") {

        if (!isAdmin()) {

            await setPage("dashboard");

            return;

        }


        await loadOthers(
            state
        );

    }


    if (page === "attendance") {

        await loadAttendanceChildren(
            state
        );

    }

}


/* =====================================================
   NAVIGATION
   ===================================================== */

function initNavigation() {

    $$(".nav-item")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const page =
                        btn.dataset.page;


                    if (
                        !canOpenPage(page)
                    ) {

                        return;

                    }


                    setPage(page);

                }
            );

        });


    $$("[data-page]")
        .forEach(btn => {

            if (
                btn.classList.contains(
                    "nav-item"
                )
            ) {

                return;

            }


            btn.addEventListener(
                "click",
                () => {

                    const page =
                        btn.dataset.page;


                    if (
                        !canOpenPage(page)
                    ) {

                        return;

                    }


                    setPage(page);

                }
            );

        });

}


/* =====================================================
   FILTERS
   ===================================================== */

function initFilters() {

    $("#childrenSearch")
        ?.addEventListener(
            "input",
            () =>
                renderChildren(state)
        );


    $$("[data-child-filter]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    $$("[data-child-filter]")
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    btn.classList.add(
                        "active"
                    );


                    state.childFilter =
                        btn.dataset.childFilter;


                    renderChildren(
                        state
                    );

                }
            );

        });


    $$("[data-user-filter]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    $$("[data-user-filter]")
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    btn.classList.add(
                        "active"
                    );


                    state.userFilter =
                        btn.dataset.userFilter;


                    renderUsers(
                        state
                    );

                }
            );

        });


    $$("[data-other-filter]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    $$("[data-other-filter]")
                        .forEach(x =>
                            x.classList.remove(
                                "active"
                            )
                        );


                    btn.classList.add(
                        "active"
                    );


                    state.otherFilter =
                        btn.dataset.otherFilter;


                    renderOthers(
                        state
                    );

                }
            );

        });

}


/* =====================================================
   BUTTONS
   ===================================================== */

function initButtons() {

    /*
     * Bola qo'shish
     *
     * Faqat ADMIN.
     */

    $("#addChildBtn")
        ?.addEventListener(
            "click",
            () => {

                openNewChild(state);

            }
        );


    /*
     * Ustoz qo'shish
     */

    $("#addTeacherBtn")
        ?.addEventListener(
            "click",
            () => {

                if (!isAdmin()) {

                    return;

                }


                openNewTeacher(state);

            }
        );


    /*
     * Boshqa xodim qo'shish
     */

    $("#addOtherBtn")
        ?.addEventListener(
            "click",
            () => {

                if (!isAdmin()) {

                    return;

                }


                openNewOther();

            }
        );


    /*
     * Refresh
     */

    $("#refreshBtn")
        ?.addEventListener(
            "click",
            () =>
                setPage("dashboard")
        );


    /*
     * Logout
     */

    $("#logoutBtn")
        ?.addEventListener(
            "click",
            () => {

                [
                    "accessToken",
                    "access_token",
                    "token",
                    "jwt",
                    "refreshToken",
                    "refresh_token"
                ].forEach(
                    key =>
                        localStorage.removeItem(
                            key
                        )
                );


                window.location.href =
                    "/auth/login.html";

            }
        );


    /*
     * Attendance child select
     */

    $("#attendanceChild")
        ?.addEventListener(
            "change",
            e => {

                if (e.target.value) {

                    showAttendance(
                        e.target.value
                    );

                } else {

                    $("#attendanceResult")
                        .innerHTML = "";

                }

            }
        );

}


/* =====================================================
   INIT
   ===================================================== */

async function init() {

    if (!token()) {

        window.location.href =
            "/auth/login.html";

        return;

    }


    setupUser();

    setupRoleAccess();

    initNavigation();

    initFilters();

    initButtons();

    initModals();

    initChildForm(state);

    /*
     * Teacher form / teacher view
     * faqat ADMIN uchun kerak.
     */

    if (isAdmin()) {

        initTeacherForm(state);

        initTeacherView(state);

        initOtherForm(state);

    }


    await loadDashboard(
        state,
        state.loadChildren
    );

}


document.addEventListener(
    "DOMContentLoaded",
    init
);