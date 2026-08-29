import { api } from "./api.js";

import {
    $,
    $$,
    escapeHtml,
    initials,
    showToast
} from "./utils.js";

import {
    openModal,
    closeModal
} from "./modals.js";

import {
    fillGroupSelect
} from "./children.js";


// =====================================================
// LOAD USERS
// =====================================================

export async function loadUsers(state) {

    $("#teachersGrid").innerHTML = `
        <div class="empty-state">
            Yuklanmoqda...
        </div>
    `;

    try {

        state.users =
            await api(
                "/api/user?page=0&size=100"
            ) || [];

        renderUsers(state);

        await loadRoles(state);

    } catch (e) {

        console.error(e);

        $("#teachersGrid").innerHTML = `
            <div class="empty-state">
                Ustozlarni olishda xatolik.
            </div>
        `;
    }
}


// =====================================================
// RENDER USERS
// =====================================================

export function renderUsers(state) {

    const arr =
        state.users.filter(u =>

            state.userFilter === "all"

            ||

            (
                state.userFilter === "active" &&
                u.isActive
            )

            ||

            (
                state.userFilter === "inactive" &&
                !u.isActive
            )

        );


    $("#teachersGrid").innerHTML =

        arr.length

            ? arr.map(u => `

                <article class="person-card">

                    <div class="person-top">

                        <div class="person-avatar">

                            ${initials(
                u.firstName,
                u.lastName
            )}

                        </div>


                        <div>

                            <h3>

                                ${escapeHtml(
                `${u.firstName || ""} ${u.lastName || ""}`
                    .trim()
            )}

                            </h3>


                            <p>

                                ${escapeHtml(
                u.roles || "Xodim"
            )}

                            </p>

                        </div>

                    </div>


                    <div class="person-meta">


                        <span
                            class="status ${
                u.isActive
                    ? ""
                    : "off"
            }"
                        >

                            ${
                u.isActive
                    ? "Faol"
                    : "Faol emas"
            }

                        </span>


                        <div class="person-actions">


                            <!-- KO'RISH -->

                            <button
                                type="button"
                                class="small-btn"
                                data-view-user="${u.id}"
                            >
                                Ko‘rish
                            </button>


                            <!-- TAHRIRLASH -->

                            <button
                                type="button"
                                class="small-btn"
                                data-edit-user="${u.id}"
                            >
                                Tahrirlash
                            </button>


                            <!-- O'CHIRISH -->

                            <button
                                type="button"
                                class="small-btn danger"
                                data-delete-user="${u.id}"
                            >
                                O‘chirish
                            </button>


                        </div>

                    </div>

                </article>

            `).join("")

            :

            `
                <div class="empty-state">
                    Ustozlar topilmadi.
                </div>
            `;


    // =================================================
    // VIEW BUTTON
    // =================================================

    $$("[data-view-user]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    viewUser(
                        Number(
                            btn.dataset.viewUser
                        ),
                        state
                    );

                }
            );

        });


    // =================================================
    // EDIT BUTTON
    // =================================================

    $$("[data-edit-user]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    editUser(
                        Number(
                            btn.dataset.editUser
                        ),
                        state
                    );

                }
            );

        });


    // =================================================
    // DELETE BUTTON
    // =================================================

    $$("[data-delete-user]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    deleteUser(
                        Number(
                            btn.dataset.deleteUser
                        ),
                        state
                    );

                }
            );

        });

}


// =====================================================
// VIEW USER
// =====================================================

export async function viewUser(
    id,
    state
) {

    try {

        const response =
            await api(
                `/api/user/${id}`
            );


        console.log(
            "VIEW USER RESPONSE:",
            response
        );


        const u =
            response?.user;

        const group =
            response?.group;


        if (!u) {

            showToast(
                "Ustoz ma'lumotlari topilmadi."
            );

            return;
        }


        // =============================================
        // NAME
        // =============================================

        const fullName =
            `${u.firstName || ""} ${u.lastName || ""}`
                .trim();


        $("#viewTeacherName").textContent =
            fullName || "Noma'lum";


        // =============================================
        // AVATAR
        // =============================================

        $("#viewTeacherAvatar").textContent =
            initials(
                u.firstName,
                u.lastName
            );


        // =============================================
        // EMAIL
        // =============================================

        $("#viewTeacherEmail").textContent =
            u.email || "—";


        // =============================================
        // PHONE
        // =============================================

        $("#viewTeacherPhone").textContent =
            u.phone || "—";


        // =============================================
        // GROUP
        // =============================================

        $("#viewTeacherGroup").textContent =
            group?.name ||
            "Guruh biriktirilmagan";


        // =============================================
        // ROLE
        // =============================================

        $("#viewTeacherRole").textContent =

            u.roles?.length

                ? u.roles
                    .map(role =>
                        role.role
                    )
                    .join(", ")

                : "Rol yo‘q";


        // =============================================
        // STATUS
        // =============================================

        $("#viewTeacherStatus").textContent =

            u.isActive
                ? "Faol"
                : "Faol emas";


        // =============================================
        // EDIT BUTTON ID
        // =============================================

        $("#viewTeacherEditBtn")
            .dataset.userId = id;


        // =============================================
        // OPEN VIEW MODAL
        // =============================================

        openModal(
            "viewTeacherModal"
        );


    } catch (e) {

        console.error(e);

        showToast(
            "Ustoz ma'lumotlarini olishda xatolik."
        );
    }

}


// =====================================================
// EDIT USER
// =====================================================

export async function editUser(
    id,
    state
) {

    try {

        const response =
            await api(
                `/api/user/${id}`
            );


        console.log(
            "EDIT USER RESPONSE:",
            response
        );


        const u =
            response?.user;

        const group =
            response?.group;


        if (!u) {

            showToast(
                "Ustoz ma'lumotlari topilmadi."
            );

            return;
        }


        // =============================================
        // FIRST NAME
        // =============================================

        $("#teacherFirstName").value =
            u.firstName || "";


        // =============================================
        // LAST NAME
        // =============================================

        $("#teacherLastName").value =
            u.lastName || "";


        // =============================================
        // EMAIL
        // =============================================

        $("#teacherEmail").value =
            u.email || "";


        // =============================================
        // PHONE
        // =============================================

        $("#teacherPhone").value =
            u.phone || "";


        // =============================================
        // SAVE EDIT ID
        // =============================================

        $("#teacherForm")
            .dataset.editId = id;


        // =============================================
        // MODAL TITLE
        // =============================================

        $("#teacherModal")
            .querySelector("h2")
            .textContent =
            "Ustozni tahrirlash";


        // =============================================
        // LOAD GROUPS
        // =============================================

        await fillGroupSelect(
            $("#teacherGroup"),
            state
        );


        // =============================================
        // LOAD ROLES
        // =============================================

        await loadRoles(
            state
        );


        // =============================================
        // SELECT GROUP
        // =============================================

        $("#teacherGroup").value =
            group?.id ?? "";


        // =============================================
        // SELECT ROLE
        // =============================================

        $("#teacherRole").value =
            u.roles?.[0]?.id ?? "";


        // =============================================
        // OPEN EDIT MODAL
        // =============================================

        openModal(
            "teacherModal"
        );


    } catch (e) {

        console.error(e);

        showToast(
            "Ustoz ma'lumotini olishda xatolik."
        );
    }

}


// =====================================================
// DELETE USER
// =====================================================

export async function deleteUser(
    id,
    state
) {

    if (
        !confirm(
            "Ushbu xodimni faol emas holatiga o‘tkazish kerakmi?"
        )
    ) {

        return;
    }


    try {

        await api(
            `/api/user/${id}`,
            {
                method: "DELETE"
            }
        );


        showToast(
            "Xodim faol emas holatiga o‘tkazildi."
        );


        await loadUsers(
            state
        );


    } catch (e) {

        console.error(e);

        showToast(
            "Xodimni o‘chirishda xatolik."
        );
    }

}


// =====================================================
// LOAD ROLES
// =====================================================

export async function loadRoles(
    state
) {

    try {

        state.roles =
            await api(
                "/api/role"
            ) || [];


        $("#teacherRole").innerHTML =

            state.roles
                .map(r => `

                    <option
                        value="${r.id}"
                    >
                        ${escapeHtml(
                    r.role
                )}
                    </option>

                `)
                .join("");


    } catch (e) {

        console.error(e);


        $("#teacherRole").innerHTML = `

            <option value="">
                Rol topilmadi
            </option>

        `;
    }

}


// =====================================================
// OPEN NEW TEACHER
// =====================================================

export async function openNewTeacher(
    state
) {

    // =============================================
    // RESET FORM
    // =============================================

    $("#teacherForm").reset();


    // =============================================
    // REMOVE EDIT ID
    // =============================================

    delete $("#teacherForm")
        .dataset
        .editId;


    // =============================================
    // MODAL TITLE
    // =============================================

    $("#teacherModal")
        .querySelector("h2")
        .textContent =
        "Ustoz qo‘shish";


    // =============================================
    // LOAD GROUPS
    // =============================================

    await fillGroupSelect(
        $("#teacherGroup"),
        state
    );


    // =============================================
    // LOAD ROLES
    // =============================================

    await loadRoles(
        state
    );


    // =============================================
    // OPEN MODAL
    // =============================================

    openModal(
        "teacherModal"
    );

}


// =====================================================
// INIT TEACHER FORM
// =====================================================

export function initTeacherForm(
    state
) {

    $("#teacherForm")
        .addEventListener(
            "submit",
            async e => {

                e.preventDefault();


                const editId =
                    e.currentTarget
                        .dataset
                        .editId;


                try {

                    // =================================
                    // PAYLOAD
                    // =================================

                    const payload = {

                        firstName:
                            $("#teacherFirstName")
                                .value
                                .trim(),

                        lastName:
                            $("#teacherLastName")
                                .value
                                .trim(),

                        email:
                            $("#teacherEmail")
                                .value
                                .trim(),

                        phone:
                            $("#teacherPhone")
                                .value
                                .trim()
                            || null,

                        groupId:
                            Number(
                                $("#teacherGroup")
                                    .value
                            ),

                        roleId:
                            Number(
                                $("#teacherRole")
                                    .value
                            )

                    };


                    // =================================
                    // UPDATE
                    // =================================

                    if (editId) {

                        await api(
                            `/api/user/${editId}`,
                            {
                                method: "PUT",

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                        showToast(
                            "Ustoz yangilandi."
                        );

                    }


                        // =================================
                        // CREATE
                    // =================================

                    else {

                        await api(
                            "/api/user/add",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                        showToast(
                            "Ustoz qo‘shildi."
                        );

                    }


                    // =================================
                    // CLOSE MODAL
                    // =================================

                    closeModal(
                        "teacherModal"
                    );


                    // =================================
                    // RELOAD USERS
                    // =================================

                    await loadUsers(
                        state
                    );


                } catch (e) {

                    console.error(e);


                    showToast(
                        "Ustoz saqlanmadi. Email/guruh/rolni tekshiring."
                    );
                }

            }
        );

}


// =====================================================
// INIT VIEW MODAL
// =====================================================

export function initTeacherView(
    state
) {

    $("#viewTeacherEditBtn")
        ?.addEventListener(
            "click",
            async e => {

                const id =
                    Number(
                        e.currentTarget
                            .dataset
                            .userId
                    );


                if (!id) {

                    showToast(
                        "Ustoz ID topilmadi."
                    );

                    return;
                }


                // View modalni yopamiz

                closeModal(
                    "viewTeacherModal"
                );


                // Edit modalni ochamiz

                await editUser(
                    id,
                    state
                );

            }
        );

}