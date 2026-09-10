import {
    api,
    currentUser,
    isTeacher,
    isAdmin
} from "./api.js";

import {
    $,
    escapeHtml,
    initials,
    genderText,
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

    const detailsView =
        $("#groupDetailsPage");

    el.style.display = "";

    if (detailsView) {
        detailsView.style.display = "none";
    }

    el.innerHTML = `
        <div class="empty-state">
            Yuklanmoqda...
        </div>
    `;

    try {

        const allGroups =
            await api("/api/group") || [];


        // ========================================
        // TEACHER
        // FAQAT O'ZIGA BIRIKTIRILGAN GURUHLAR
        // ========================================

        if (isTeacher()) {

            const user =
                currentUser();


            state.groups =
                allGroups.filter(
                    group =>
                        Number(group.teacherId) ===
                        Number(user.id)
                );

        } else {

            // ADMIN + DOCTOR
            // BARCHA GURUHLAR

            state.groups =
                allGroups;

        }


        // ========================================
        // DASHBOARD STATISTICS
        // ========================================

        const stats =
            state.dashboard?.groups || [];


        const map =
            new Map(
                stats.map(x => [
                    String(x.id),
                    x
                ])
            );


        // ========================================
        // RENDER GROUPS
        // ========================================

        el.innerHTML =
            state.groups.length

                ? state.groups.map(g => {

                    const stat =
                        map.get(
                            String(g.id)
                        );


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
            .querySelectorAll(
                "#groupsPage [data-group-id]"
            )
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        console.log("GROUP CARD BOSILDI");

                        const id =
                            Number(card.dataset.groupId);

                        console.log("GROUP ID:", id);

                        console.log("CURRENT USER:", currentUser());

                        console.log("IS TEACHER:", isTeacher());

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

    console.log("OPEN GROUP ISHLADI:", groupId);
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
                    type="button"
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
                    type="button"
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


                ${
        isAdmin()
            ? `
                            <button
                                class="primary-btn"
                                id="changeGroupTeacherBtn"
                                data-group-id="${group.id}"
                                type="button"
                            >
                                Ustozni almashtirish
                            </button>
                        `
            : ""
    }

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
                    genderText(
                        child.gender
                    )
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
    // FAQAT ADMIN
    // ========================================

    $("#changeGroupTeacherBtn")
        ?.addEventListener(
            "click",
            () => {

                if (!isAdmin()) {

                    showToast(
                        "Bu amal uchun ruxsat yo‘q."
                    );

                    return;

                }


                changeGroupTeacher(
                    group.id,
                    state
                );

            }
        );


    // ========================================
    // START ATTENDANCE
    // ADMIN + TEACHER + DOCTOR
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
    // ADMIN + TEACHER + DOCTOR
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

    const details =
        $("#groupDetailsPage");


    const groups =
        $("#groupsPage");


    if (details) {

        details.style.display =
            "none";

    }


    if (groups) {

        groups.style.display =
            "";

    }


    const content =
        $("#groupDetailsContent");


    if (content) {

        content.innerHTML =
            "";

    }

}


// ========================================
// CHANGE GROUP TEACHER
// FAQAT ADMIN
// ========================================

export async function changeGroupTeacher(
    groupId,
    state
) {

    if (!isAdmin()) {

        showToast(
            "Bu amal uchun ruxsat yo‘q."
        );

        return;

    }


    try {

        // ========================================
        // LOAD USERS
        // ========================================

        const users =
            await api(
                "/api/user?page=0&size=100"
            ) || [];


        // ========================================
        // FAQAT TEACHER VA FAOL USERLAR
        // ========================================

        const teachers =
            users.filter(user => {

                return (

                    user.isActive === true &&

                    String(
                        user.profession || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    "TEACHER"

                );

            });


        console.log(
            "ALL USERS:",
            users
        );


        console.log(
            "ACTIVE TEACHERS:",
            teachers
        );


        if (!teachers.length) {

            showToast(
                "Faol ustozlar topilmadi."
            );

            return;

        }


        // ========================================
        // MODAL
        // ========================================

        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "modal-overlay";


        modal.innerHTML = `

            <div class="modal">

                <div class="modal-header">

                    <div>

                        <h2>
                            Ustozni almashtirish
                        </h2>

                        <p>
                            Guruh uchun yangi ustoz tanlang
                        </p>

                    </div>


                    <button
                        type="button"
                        class="modal-close"
                        id="changeTeacherCloseBtn"
                    >
                        ×
                    </button>

                </div>


                <div class="modal-body">

                    <label
                        for="changeTeacherSelect"
                    >
                        Ustoz
                    </label>


                    <select
                        id="changeTeacherSelect"
                        class="form-control"
                    >

                        <option value="">
                            Ustozni tanlang
                        </option>

                        ${
            teachers
                .map(
                    teacher => {

                        const fullName =
                            `${teacher.firstName || ""} ${teacher.lastName || ""}`
                                .trim();


                        return `

                                            <option
                                                value="${teacher.id}"
                                            >
                                                ${escapeHtml(
                            fullName ||
                            `Ustoz #${teacher.id}`
                        )}
                                            </option>

                                        `;

                    }
                )
                .join("")
        }

                    </select>

                </div>


                <div class="modal-footer">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="cancelChangeTeacherBtn"
                    >
                        Bekor qilish
                    </button>


                    <button
                        type="button"
                        class="primary-btn"
                        id="saveChangeTeacherBtn"
                    >
                        Saqlash
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        // ========================================
        // CLOSE
        // ========================================

        const close =
            () => {

                modal.remove();

            };


        document
            .getElementById(
                "changeTeacherCloseBtn"
            )
            ?.addEventListener(
                "click",
                close
            );


        document
            .getElementById(
                "cancelChangeTeacherBtn"
            )
            ?.addEventListener(
                "click",
                close
            );


        // ========================================
        // SAVE
        // ========================================

        document
            .getElementById(
                "saveChangeTeacherBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    const select =
                        document.getElementById(
                            "changeTeacherSelect"
                        );


                    const teacherId =
                        Number(
                            select?.value
                        );


                    if (!teacherId) {

                        showToast(
                            "Iltimos, ustozni tanlang."
                        );

                        return;

                    }


                    const saveButton =
                        document.getElementById(
                            "saveChangeTeacherBtn"
                        );


                    saveButton.disabled =
                        true;


                    saveButton.textContent =
                        "Saqlanmoqda...";


                    try {

                        await api(
                            `/api/group/${groupId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        teacherId:
                                        teacherId
                                    })
                            }
                        );


                        showToast(
                            "Guruh ustozı muvaffaqiyatli almashtirildi."
                        );


                        close();


                        const updatedGroup =
                            await api(
                                `/api/group/${groupId}`
                            );


                        renderGroupDetails(
                            updatedGroup,
                            state
                        );


                    } catch (e) {

                        console.error(
                            "Change teacher error:",
                            e
                        );


                        showToast(
                            "Ustozni almashtirishda xatolik."
                        );


                        saveButton.disabled =
                            false;


                        saveButton.textContent =
                            "Saqlash";

                    }

                }
            );


    } catch (e) {

        console.error(
            "Load teachers error:",
            e
        );


        showToast(
            "Ustozlarni olishda xatolik."
        );

    }

}


// ========================================
// START ATTENDANCE
// ========================================

export function startAttendance(
    group,
    state
) {

    const children =
        Array.isArray(
            group.children
        )

            ? group.children.filter(
                child =>
                    child.active !== false
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
                        type="button"
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

                    // CHILD ID
                    id: child.id,

                    isPresent:
                    isPresent,

                    date:
                    date

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