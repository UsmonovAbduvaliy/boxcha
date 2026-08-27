import {
    token,
    currentUser
} from "./api.js";

import {
    $,
    $$,
    todayText
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
    initTeacherForm
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


// Children moduliga loadChildren kerak
state.loadChildren =
    async silent => {

        await loadChildren(
            state,
            silent
        );

    };


function setupUser() {

    const u = currentUser();

    const name =
        u.name || "Foydalanuvchi";

    const role =
        u.role || "Foydalanuvchi";


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


    const d = new Date();


    $("#todayDate").textContent =
        new Intl.DateTimeFormat(
            "uz-UZ",
            {
                day: "2-digit",
                month: "short"
            }
        ).format(d);


    $("#calendarDay").textContent =
        d.getDate();


    $("#calendarMonth").textContent =
        new Intl.DateTimeFormat(
            "uz-UZ",
            {
                month: "long"
            }
        ).format(d);


    $("#calendarWeekday").textContent =
        new Intl.DateTimeFormat(
            "uz-UZ",
            {
                weekday: "long"
            }
        ).format(d);


    $("#pageSubtitle").textContent =
        todayText() +
        " • Boxcha boshqaruv paneli";
}


async function setPage(page) {

    $$(".page")
        .forEach(x =>
            x.classList.remove("active")
        );


    const target =
        $(`#page-${page}`);


    if (!target) return;


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
        titles[page] || "Boxcha";


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

        await loadUsers(
            state
        );

    }


    if (page === "others") {

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


function initNavigation() {

    $$(".nav-item")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    setPage(
                        btn.dataset.page
                    );

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

                    setPage(
                        btn.dataset.page
                    );

                }
            );

        });
}


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


function initButtons() {

    $("#addChildBtn")
        ?.addEventListener(
            "click",
            () =>
                openNewChild(state)
        );


    $("#addTeacherBtn")
        ?.addEventListener(
            "click",
            () =>
                openNewTeacher(state)
        );


    $("#addOtherBtn")
        ?.addEventListener(
            "click",
            () =>
                openNewOther()
        );


    $("#refreshBtn")
        ?.addEventListener(
            "click",
            () =>
                setPage("dashboard")
        );


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


async function init() {

    if (!token()) {

        window.location.href =
            "/login.html";

        return;
    }


    setupUser();

    initNavigation();

    initFilters();

    initButtons();

    initModals();

    initChildForm(state);

    initTeacherForm(state);

    initOtherForm(state);


    await loadDashboard(
        state,
        state.loadChildren
    );
}


document.addEventListener(
    "DOMContentLoaded",
    init
);