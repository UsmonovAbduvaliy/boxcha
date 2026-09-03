import { api } from "./api.js";

import {
    $,
    escapeHtml,
    initials,
    showToast
} from "./utils.js";

import {
    openModal,
    closeModal
} from "./modals.js";

import {
    editChild,
    viewChild
} from "./children.js";


// ========================================
// LOAD GROUPS
// ========================================

export async function loadGroupsPage(state) {

    const el = $("#groupsPage");

    el.innerHTML = `
        <div class="empty-state">
            Yuklanmoqda...
        </div>
    `;

    try {

        state.groups =
            await api("/api/group") || [];

        const stats =
            state.dashboard?.groups || [];

        const map =
            new Map(
                stats.map(x => [
                    String(x.id),
                    x
                ])
            );


        el.innerHTML =
            state.groups.length
                ? state.groups.map(g => {

                    const stat =
                        map.get(String(g.id));

                    return `
                        <article
                            class="group-card"
                            data-group-id="${g.id}"
                            style="cursor:pointer;"
                        >

                            <div class="group-card-head">

                                <div class="group-card-symbol">
                                    ♙
                                </div>

                                <span class="status">
                                    ${stat?.childrenCount ?? 0}
                                    bola
                                </span>

                            </div>


                            <h3>
                                ${escapeHtml(g.name)}
                            </h3>


                            <p>
                                Guruh ID: ${g.id}
                            </p>


                            <div class="group-card-footer">

                                <span>
                                    Faol bolalar
                                </span>

                                <b>
                                    ${stat?.childrenCount ?? 0}
                                </b>

                            </div>


                            <div class="group-open-hint">
                                Guruhni ko‘rish →
                            </div>

                        </article>
                    `;

                }).join("")

                : `
                    <div class="empty-state">
                        Guruhlar mavjud emas.
                    </div>
                `;


        // ========================================
        // GROUP CARD CLICK
        // ========================================

        document
            .querySelectorAll("[data-group-id]")
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                card.dataset.groupId
                            );

                        openGroup(
                            id,
                            state
                        );

                    }
                );

            });


    } catch (e) {

        console.error(
            "Groups error:",
            e
        );

        el.innerHTML = `
            <div class="empty-state">
                Guruhlarni olishda xatolik.
            </div>
        `;
    }
}


// ========================================
// OPEN GROUP
// ========================================

export async function openGroup(
    groupId,
    state
) {

    const groupsPage =
        $("#groupsPage");

    const groupDetailsPage =
        $("#groupDetailsPage");


    if (!groupDetailsPage) {

        console.error(
            "groupDetailsPage topilmadi"
        );

        return;
    }


    groupsPage.style.display =
        "none";

    groupDetailsPage.style.display =
        "block";


    $("#groupDetailsContent").innerHTML = `
        <div class="empty-state">
            Guruh ma'lumotlari yuklanmoqda...
        </div>
    `;


    try {

        const group =
            await api(
                `/api/group/${groupId}`
            );


        if (!group) {

            throw new Error(
                "Guruh topilmadi"
            );

        }


        renderGroupDetails(
            group,
            state
        );


    } catch (e) {

        console.error(
            "Group detail error:",
            e
        );


        $("#groupDetailsContent").innerHTML = `
            <div class="empty-state">
                Guruh ma'lumotlarini olishda xatolik.
            </div>
        `;

    }
}


// ========================================
// RENDER GROUP DETAILS
// ========================================

export function renderGroupDetails(
    group,
    state
) {

    const teacherName =
        `${group.teacherFirstname || ""} ${group.teacherLastname || ""}`
            .trim();


    const children =
        Array.isArray(group.children)
            ? group.children
            : [];


    $("#groupDetailsContent").innerHTML = `

        <div class="group-detail-header">

            <div>

                <button
                    class="secondary-btn"
                    id="backToGroupsBtn"
                >
                    ← Guruhlarga qaytish
                </button>


                <h2>
                    ${escapeHtml(
        group.groupName ||
        "Guruh"
    )}
                </h2>


                <p>
                    Guruh ID: ${group.id}
                </p>

            </div>


            <div>

                <button
                    class="primary-btn"
                    id="startAttendanceBtn"
                >
                    ✓ Davomat qilish
                </button>

            </div>

        </div>


        <div class="group-detail-grid">


            <!-- ================================= -->
            <!-- TEACHER -->
            <!-- ================================= -->

            <section
                class="panel group-teacher-card"
            >

                <div class="panel-head">

                    <div>

                        <h2>
                            Ustoz
                        </h2>

                        <p>
                            Guruhga biriktirilgan ustoz
                        </p>

                    </div>

                </div>


                <div class="group-teacher-info">

                    <div class="person-avatar">

                        ${initials(
        group.teacherFirstname,
        group.teacherLastname
    )}

                    </div>


                    <div>

                        <h3>

                            ${escapeHtml(
        teacherName ||
        "Ustoz biriktirilmagan"
    )}

                        </h3>


                        <p>

                            ID:
                            ${group.teacherId ?? "—"}

                        </p>

                    </div>

                </div>


                <button
                    class="primary-btn"
                    id="changeGroupTeacherBtn"
                    data-group-id="${group.id}"
                >
                    Ustozni almashtirish
                </button>

            </section>


            <!-- ================================= -->
            <!-- CHILDREN -->
            <!-- ================================= -->

            <section
                class="panel group-children-card"
            >

                <div class="panel-head">

                    <div>

                        <h2>
                            Bolalar
                        </h2>

                        <p>
                            Guruhdagi faol bolalar
                        </p>

                    </div>


                    <span class="status">

                        ${children.length}
                        bola

                    </span>

                </div>


                <div class="group-children-list">

                    ${
        children.length

            ? children.map(
                child => `

                                    <div
                                        class="group-child-item"
                                        data-child-id="${child.id}"
                                        style="cursor:pointer;"
                                    >

                                        <div class="child-avatar">

                                            ${initials(
                    child.firstName,
                    child.lastName
                )}

                                        </div>


                                        <div
                                            class="group-child-info"
                                        >

                                            <strong>

                                                ${escapeHtml(
                    `${child.firstName || ""} ${child.lastName || ""}`
                        .trim()
                )}

                                            </strong>


                                            <span>

                                                ${escapeHtml(
                    child.patronymic || ""
                )}

                                            </span>

                                        </div>


                                        <div
                                            class="group-child-meta"
                                        >

                                            <span>

                                                ${child.age ?? "—"}
                                                yosh

                                            </span>


                                            <span>

                                                ${escapeHtml(
                    child.gender || "—"
                )}

                                            </span>


                                            <span
                                                class="status ${
                    child.active
                        ? ""
                        : "off"
                }"
                                            >

                                                ${
                    child.active
                        ? "Faol"
                        : "Faol emas"
                }

                                            </span>

                                        </div>


                                        <div
                                            class="group-child-arrow"
                                        >
                                            →
                                        </div>


                                    </div>

                                `
            ).join("")


            : `

                                <div
                                    class="empty-state"
                                >
                                    Bu guruhda faol
                                    bolalar yo‘q.
                                </div>

                            `
    }

                </div>

            </section>

        </div>
    `;


    // ========================================
    // BACK
    // ========================================

    $("#backToGroupsBtn")
        ?.addEventListener(
            "click",
            closeGroupDetails
        );


    // ========================================
    // CHANGE TEACHER
    // ========================================

    $("#changeGroupTeacherBtn")
        ?.addEventListener(
            "click",
            () => {

                changeGroupTeacher(
                    group.id
                );

            }
        );


    // ========================================
    // START ATTENDANCE
    // ========================================

    $("#startAttendanceBtn")
        ?.addEventListener(
            "click",
            () => {

                startAttendance(
                    group,
                    state
                );

            }
        );


    // ========================================
    // CHILD CLICK
    // ========================================

    document
        .querySelectorAll(
            ".group-child-item[data-child-id]"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const childId =
                        Number(
                            item.dataset.childId
                        );


                    viewChild(
                        childId,
                        state
                    );

                }
            );

        });

}


// ========================================
// CLOSE GROUP DETAILS
// ========================================

export function closeGroupDetails() {

    $("#groupDetailsPage").style.display =
        "none";


    $("#groupsPage").style.display =
        "";


    $("#groupDetailsContent").innerHTML =
        "";

}


// ========================================
// CHANGE GROUP TEACHER
// ========================================

export async function changeGroupTeacher(
    groupId
) {

    showToast(
        `Guruh #${groupId} uchun ustozni almashtirish funksiyasi hali backend endpointga bog‘lanmagan.`
    );

}


// ========================================
// START ATTENDANCE
// ========================================

export function startAttendance(
    group,
    state
) {

    const children =
        Array.isArray(group.children)
            ? group.children.filter(
                child => child.active !== false
            )
            : [];


    if (!children.length) {

        showToast(
            "Bu guruhda faol bolalar mavjud emas."
        );

        return;
    }


    renderAttendance(
        group,
        children,
        state
    );

}


// ========================================
// RENDER ATTENDANCE
// ========================================

export function renderAttendance(
    group,
    children,
    state
) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    $("#groupDetailsContent").innerHTML = `

        <div class="attendance-page">


            <!-- HEADER -->

            <div class="group-detail-header">

                <div>

                    <button
                        class="secondary-btn"
                        id="backFromAttendanceBtn"
                    >
                        ← Guruhga qaytish
                    </button>


                    <h2>
                        ${escapeHtml(
        group.groupName ||
        "Guruh"
    )}
                        — Davomat
                    </h2>


                    <p>
                        ${today}
                    </p>

                </div>

            </div>


            <!-- CHILDREN -->

            <section class="panel">

                <div class="panel-head">

                    <div>

                        <h2>
                            Bolalar davomatı
                        </h2>

                        <p>
                            Kelgan bolalarni belgilang
                        </p>

                    </div>


                    <span
                        class="status"
                        id="attendanceCount"
                    >
                        0 / ${children.length}
                    </span>

                </div>


                <div
                    class="attendance-children-list"
                    id="attendanceChildrenList"
                >

                    ${children.map(
        child => `

                            <div
                                class="attendance-child-item"
                                data-attendance-child-id="${child.id}"
                            >

                                <div class="child-avatar">

                                    ${initials(
            child.firstName,
            child.lastName
        )}

                                </div>


                                <div
                                    class="attendance-child-info"
                                >

                                    <strong>

                                        ${escapeHtml(
            `${child.firstName || ""} ${child.lastName || ""}`
                .trim()
        )}

                                    </strong>


                                    <span>

                                        ${escapeHtml(
            child.patronymic || ""
        )}

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    class="attendance-toggle absent"
                                    data-attendance-toggle
                                >
                                    Kelmagan
                                </button>

                            </div>

                        `
    ).join("")}

                </div>


                <!-- FINISH -->

                <div class="attendance-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="cancelAttendanceBtn"
                    >
                        Bekor qilish
                    </button>


                    <button
                        type="button"
                        class="primary-btn"
                        id="finishAttendanceBtn"
                    >
                        ✓ Yakunlash
                    </button>

                </div>

            </section>

        </div>
    `;


    // ========================================
    // BACK
    // ========================================

    $("#backFromAttendanceBtn")
        ?.addEventListener(
            "click",
            () => {

                renderGroupDetails(
                    group,
                    state
                );

            }
        );


    // ========================================
    // CANCEL
    // ========================================

    $("#cancelAttendanceBtn")
        ?.addEventListener(
            "click",
            () => {

                renderGroupDetails(
                    group,
                    state
                );

            }
        );


    // ========================================
    // TOGGLE
    // ========================================

    document
        .querySelectorAll(
            "[data-attendance-toggle]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleAttendance(
                        button
                    );

                    updateAttendanceCount();

                }
            );

        });


    // ========================================
    // FINISH
    // ========================================

    $("#finishAttendanceBtn")
        ?.addEventListener(
            "click",
            () => {

                finishAttendance(
                    children,
                    today,
                    group,
                    state
                );

            }
        );

}


// ========================================
// TOGGLE ATTENDANCE
// ========================================

function toggleAttendance(
    button
) {

    const isPresent =
        button.classList.contains(
            "present"
        );


    if (isPresent) {

        button.classList.remove(
            "present"
        );

        button.classList.add(
            "absent"
        );

        button.textContent =
            "Kelmagan";

    } else {

        button.classList.remove(
            "absent"
        );

        button.classList.add(
            "present"
        );

        button.textContent =
            "Kelgan";

    }

}


// ========================================
// UPDATE ATTENDANCE COUNT
// ========================================

function updateAttendanceCount() {

    const buttons =
        document.querySelectorAll(
            "[data-attendance-toggle]"
        );


    const present =
        document.querySelectorAll(
            "[data-attendance-toggle].present"
        ).length;


    const counter =
        $("#attendanceCount");


    if (counter) {

        counter.textContent =
            `${present} / ${buttons.length}`;

    }

}


// ========================================
// FINISH ATTENDANCE
// ========================================

export async function finishAttendance(
    children,
    date,
    group,
    state
) {

    const buttons =
        document.querySelectorAll(
            "[data-attendance-toggle]"
        );


    const requests =
        children.map(
            child => {

                const button =
                    document.querySelector(
                        `[data-attendance-child-id="${child.id}"] [data-attendance-toggle]`
                    );


                const isPresent =
                    button?.classList.contains(
                        "present"
                    ) || false;


                return {

                    // MUHIM:
                    // bu CHILDREN ID
                    id: child.id,

                    isPresent: isPresent,

                    date: date

                };

            }
        );


    console.log(
        "Daily request:",
        requests
    );


    const finishButton =
        $("#finishAttendanceBtn");


    if (finishButton) {

        finishButton.disabled =
            true;

        finishButton.textContent =
            "Saqlanmoqda...";

    }


    try {

        await api(
            "/api/daily",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        requests
                    )
            }
        );


        showToast(
            "Davomat muvaffaqiyatli saqlandi."
        );


        renderGroupDetails(
            group,
            state
        );


    } catch (e) {

        console.error(
            "Attendance save error:",
            e
        );


        showToast(
            "Davomatni saqlashda xatolik."
        );


        if (finishButton) {

            finishButton.disabled =
                false;

            finishButton.textContent =
                "✓ Yakunlash";

        }

    }

}

