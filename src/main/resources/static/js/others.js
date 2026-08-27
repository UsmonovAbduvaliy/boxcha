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

export async function loadOthers(state) {

    $("#othersGrid").innerHTML = `
        <div class="empty-state">
            Yuklanmoqda...
        </div>
    `;

    try {

        state.others =
            await api("/api/others") || [];

        renderOthers(state);

    } catch (e) {

        console.error(e);

        $("#othersGrid").innerHTML = `
            <div class="empty-state">
                Boshqalarni olishda xatolik.
            </div>
        `;
    }
}


export function renderOthers(state) {

    const arr =
        state.others.filter(o =>
            state.otherFilter === "all" ||

            (
                state.otherFilter === "active" &&
                o.isActive
            ) ||

            (
                state.otherFilter === "inactive" &&
                !o.isActive
            )
        );


    $("#othersGrid").innerHTML =
        arr.length
            ? arr.map(o => `

                <article class="person-card">

                    <div class="person-top">

                        <div class="person-avatar">
                            ${initials(
                o.firstName,
                o.lastName
            )}
                        </div>

                        <div>

                            <h3>
                                ${escapeHtml(
                `${o.firstName || ""} ${o.lastName || ""}`
                    .trim()
            )}
                            </h3>

                            <p>
                                ${escapeHtml(
                o.profession ||
                "Xodim"
            )}
                            </p>

                        </div>

                    </div>


                    <div class="person-meta">

                        <span
                            class="status ${
                o.isActive
                    ? ""
                    : "off"
            }"
                        >
                            ${
                o.isActive
                    ? "Faol"
                    : "Faol emas"
            }
                        </span>


                        <div class="person-actions">

                            <button
                                class="small-btn"
                                data-edit-other="${o.id}"
                            >
                                Tahrirlash
                            </button>

                            <button
                                class="small-btn danger"
                                data-delete-other="${o.id}"
                            >
                                O‘chirish
                            </button>

                        </div>

                    </div>

                </article>

            `).join("")
            : `
                <div class="empty-state">
                    Xodim topilmadi.
                </div>
            `;


    $$("[data-edit-other]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    editOther(
                        Number(
                            btn.dataset.editOther
                        )
                    )
            );

        });


    $$("[data-delete-other]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    deleteOther(
                        Number(
                            btn.dataset.deleteOther
                        ),
                        state
                    )
            );

        });
}


export async function editOther(id) {

    try {

        const o =
            await api(`/api/others/${id}`);

        $("#otherFirstName").value =
            o.firstName || "";

        $("#otherLastName").value =
            o.lastName || "";

        $("#otherProfession").value =
            o.profession || "";

        $("#otherPhone").value =
            o.phone || "";

        $("#otherBirthDate").value =
            o.birthDate ||
            o.dateOfBirth ||
            "";


        $("#otherForm")
            .dataset.editId = id;


        $("#otherModal")
            .querySelector("h2")
            .textContent =
            "Xodimni tahrirlash";


        openModal("otherModal");

    } catch (e) {

        console.error(e);

        showToast(
            "Xodim ma'lumotini olishda xatolik."
        );
    }
}


export async function deleteOther(
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
            `/api/others/${id}`,
            {
                method: "DELETE"
            }
        );

        showToast(
            "Xodim faol emas holatiga o‘tkazildi."
        );

        await loadOthers(state);

    } catch (e) {

        console.error(e);

        showToast(
            "Xodimni o‘chirishda xatolik."
        );
    }
}


export function openNewOther() {

    $("#otherForm").reset();

    delete $("#otherForm").dataset.editId;

    $("#otherModal")
        .querySelector("h2")
        .textContent =
        "Xodim qo‘shish";

    openModal("otherModal");
}


export function initOtherForm(state) {

    $("#otherForm")
        .addEventListener(
            "submit",
            async e => {

                e.preventDefault();

                const editId =
                    e.currentTarget.dataset.editId;


                try {

                    if (editId) {

                        await api(
                            `/api/others/${editId}`,
                            {
                                method: "PUT",

                                body:
                                    JSON.stringify({

                                        firstName:
                                        $("#otherFirstName").value,

                                        lastName:
                                        $("#otherLastName").value,

                                        phone:
                                            $("#otherPhone").value ||
                                            null,

                                        profession:
                                        $("#otherProfession").value,

                                        dateOfBirth:
                                            $("#otherBirthDate").value ||
                                            null
                                    })
                            }
                        );

                        showToast(
                            "Xodim yangilandi."
                        );

                    } else {

                        await api(
                            "/api/others",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({

                                        firstName:
                                        $("#otherFirstName").value,

                                        lastName:
                                        $("#otherLastName").value,

                                        phone:
                                            $("#otherPhone").value ||
                                            null,

                                        profession:
                                        $("#otherProfession").value,

                                        birthOfDate:
                                            $("#otherBirthDate").value ||
                                            null
                                    })
                            }
                        );

                        showToast(
                            "Xodim qo‘shildi."
                        );
                    }


                    closeModal(
                        "otherModal"
                    );

                    await loadOthers(
                        state
                    );

                } catch (e) {

                    console.error(e);

                    showToast(
                        "Xodim saqlanmadi. Request maydonlarini tekshiring."
                    );
                }

            }
        );

}