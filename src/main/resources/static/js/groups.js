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
    editChild
} from "./children.js";


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


        // ================================
        // GROUP CARD CLICK
        // ================================

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


                                    <!-- AVATAR -->

                                    <div class="child-avatar">

                                        ${initials(
                    child.firstName,
                    child.lastName
                )}

                                    </div>


                                    <!-- NAME -->

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


                                    <!-- META -->

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


                                    <!-- ARROW -->

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
    // CHILD CLICK
    // ========================================

    document
        .querySelectorAll("[data-child-id]")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const childId =
                        Number(
                            item.dataset.childId
                        );


                    openGroupChild(
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
// OPEN CHILD
// ========================================

export async function openGroupChild(
    childId,
    state
) {

    try {

        const child =
            await api(
                `/api/children/${childId}`
            );


        if (!child) {

            throw new Error(
                "Bola topilmadi"
            );

        }


        // ==================================
        // AVATAR
        // ==================================

        $("#viewChildAvatar").textContent =
            initials(
                child.firstName,
                child.lastName
            );


        // ==================================
        // NAME
        // ==================================

        $("#viewChildName").textContent =
            `${child.firstName || ""} ${child.lastName || ""}`
                .trim();


        // ==================================
        // BIRTH DATE
        // ==================================

        $("#viewChildBirthDate").textContent =
            child.birthDate || "—";


        // ==================================
        // AGE
        // ==================================

        $("#viewChildAge").textContent =
            child.age != null
                ? `${child.age} yosh`
                : "—";


        // ==================================
        // GENDER
        // ==================================

        $("#viewChildGender").textContent =
            child.gender || "—";


        // ==================================
        // GROUP
        // ==================================

        $("#viewChildGroup").textContent =
            child.groupName ||
            child.group ||
            "—";


        // ==================================
        // MOTHER
        // ==================================

        $("#viewChildMother").textContent =
            `${child.motherFirstName || ""} ${child.motherLastName || ""}`
                .trim() || "—";


        // ==================================
        // FATHER
        // ==================================

        $("#viewChildFather").textContent =
            `${child.fatherFirstName || ""} ${child.fatherLastName || ""}`
                .trim() || "—";


        // ==================================
        // MOTHER PHONE
        // ==================================

        $("#viewChildMotherPhone").textContent =
            child.motherPhone || "—";


        // ==================================
        // FATHER PHONE
        // ==================================

        $("#viewChildFatherPhone").textContent =
            child.fatherPhone || "—";


        // ==================================
        // ADDRESS
        // ==================================

        $("#viewChildAddress").textContent =
            child.address || "—";


        // ==================================
        // STATUS
        // ==================================

        const status =
            $("#viewChildStatus");


        status.textContent =
            child.active
                ? "Faol"
                : "Faol emas";


        status.classList.toggle(
            "off",
            !child.active
        );


        // ==================================
        // EDIT BUTTON
        // ==================================

        const editButton =
            $("#viewChildEditBtn");


        if (editButton) {

            // Old eventlarni olib tashlash uchun
            // yangi button clone qilamiz

            const newButton =
                editButton.cloneNode(true);


            editButton.replaceWith(
                newButton
            );


            newButton.addEventListener(
                "click",
                async () => {

                    closeModal(
                        "viewChildModal"
                    );


                    await editChild(
                        childId,
                        state
                    );

                }
            );

        }


        // ==================================
        // OPEN MODAL
        // ==================================

        openModal(
            "viewChildModal"
        );


    } catch (e) {

        console.error(
            "Open child error:",
            e
        );


        showToast(
            "Bola ma'lumotini olishda xatolik."
        );

    }

}