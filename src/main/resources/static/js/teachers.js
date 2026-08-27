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


export function renderUsers(state) {

    const arr =
        state.users.filter(u =>
            state.userFilter === "all" ||

            (
                state.userFilter === "active" &&
                u.isActive
            ) ||

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

                            <button
                                class="small-btn"
                                data-edit-user="${u.id}"
                            >
                                Tahrirlash
                            </button>

                            <button
                                class="small-btn danger"
                                data-delete-user="${u.id}"
                            >
                                O‘chirish
                            </button>

                        </div>

                    </div>

                </article>

            `).join("")
            : `
                <div class="empty-state">
                    Ustozlar topilmadi.
                </div>
            `;


    $$("[data-edit-user]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    editUser(
                        Number(
                            btn.dataset.editUser
                        ),
                        state
                    )
            );

        });


    $$("[data-delete-user]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    deleteUser(
                        Number(
                            btn.dataset.deleteUser
                        ),
                        state
                    )
            );

        });
}


export async function editUser(
    id,
    state
) {

    try {

        const u =
            await api(`/api/user/${id}`);

        $("#teacherFirstName").value =
            u.firstName || "";

        $("#teacherLastName").value =
            u.lastName || "";

        $("#teacherEmail").value =
            u.email || "";

        $("#teacherPhone").value =
            u.phone || "";


        $("#teacherForm")
            .dataset.editId = id;


        $("#teacherModal")
            .querySelector("h2")
            .textContent =
            "Ustozni tahrirlash";


        await fillGroupSelect(
            $("#teacherGroup"),
            state
        );

        await loadRoles(state);


        $("#teacherGroup").value =
            u.group?.id ?? "";

        $("#teacherRole").value =
            u.roleId ?? "";


        openModal("teacherModal");

    } catch (e) {

        console.error(e);

        showToast(
            "Ustoz ma'lumotini olishda xatolik."
        );
    }
}


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

        await loadUsers(state);

    } catch (e) {

        console.error(e);

        showToast(
            "Xodimni o‘chirishda xatolik."
        );
    }
}


export async function loadRoles(state) {

    try {

        state.roles =
            await api("/api/role") || [];

        $("#teacherRole").innerHTML =
            state.roles.map(r =>
                `
                <option value="${r.id}">
                    ${escapeHtml(r.role)}
                </option>
                `
            ).join("");

    } catch (e) {

        console.error(e);

        $("#teacherRole").innerHTML = `
            <option value="">
                Rol topilmadi
            </option>
        `;
    }
}


export async function openNewTeacher(
    state
) {

    $("#teacherForm").reset();

    delete $("#teacherForm").dataset.editId;

    $("#teacherModal")
        .querySelector("h2")
        .textContent =
        "Ustoz qo‘shish";

    await fillGroupSelect(
        $("#teacherGroup"),
        state
    );

    await loadRoles(state);

    openModal("teacherModal");
}


export function initTeacherForm(
    state
) {

    $("#teacherForm")
        .addEventListener(
            "submit",
            async e => {

                e.preventDefault();

                const editId =
                    e.currentTarget.dataset.editId;


                try {

                    const payload = {

                        firstName:
                        $("#teacherFirstName").value,

                        lastName:
                        $("#teacherLastName").value,

                        email:
                        $("#teacherEmail").value,

                        phone:
                            $("#teacherPhone").value ||
                            null,

                        groupId:
                            Number(
                                $("#teacherGroup").value
                            ),

                        roleId:
                            Number(
                                $("#teacherRole").value
                            )
                    };


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

                    } else {

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


                    closeModal(
                        "teacherModal"
                    );

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