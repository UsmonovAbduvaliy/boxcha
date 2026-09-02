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


/* =====================================================
   LOAD OTHERS
   ===================================================== */

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

        console.error("Load others error:", e);

        $("#othersGrid").innerHTML = `
            <div class="empty-state">
                Boshqalarni olishda xatolik.
            </div>
        `;
    }
}


/* =====================================================
   RENDER OTHERS
   ===================================================== */

export function renderOthers(state) {

    const arr = state.others.filter(o => {

        const active = o.active;

        return (
            state.otherFilter === "all" ||

            (
                state.otherFilter === "active" &&
                active
            ) ||

            (
                state.otherFilter === "inactive" &&
                !active
            )
        );
    });


    $("#othersGrid").innerHTML =
        arr.length
            ? arr.map(o => {

                const fullName =
                    `${o.firstName || ""} ${o.lastName || ""}`.trim();

                const active = o.active;

                return `

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
                    fullName || "Noma'lum"
                )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                    o.profession || "Xodim"
                )}
                                </p>

                            </div>

                        </div>


                        <div class="person-meta">

                            <span class="status ${active ? "" : "off"}">
                                ${active ? "Faol" : "Faol emas"}
                            </span>


                            <div class="person-actions">

                                <!-- KO'RISH -->
                                <button
                                    class="small-btn"
                                    data-view-other="${o.id}"
                                >
                                    Ko‘rish
                                </button>


                                <!-- TAHRIRLASH -->
                                <button
                                    class="small-btn"
                                    data-edit-other="${o.id}"
                                >
                                    Tahrirlash
                                </button>


                                <!-- O'CHIRISH / FAOLLASHTIRISH -->
                                <button
                                    class="small-btn ${
                    active
                        ? "danger"
                        : "activate-btn"
                }"
                                    data-delete-other="${o.id}"
                                >
                                    ${
                    active
                        ? "O‘chirish"
                        : "Faollashtirish"
                }
                                </button>

                            </div>

                        </div>

                    </article>

                `;
            }).join("")
            : `
                <div class="empty-state">
                    Xodim topilmadi.
                </div>
            `;


    /* =================================================
       VIEW
       ================================================= */

    $$("[data-view-other]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    viewOther(
                        Number(
                            btn.dataset.viewOther
                        )
                    )
            );

        });


    /* =================================================
       EDIT
       ================================================= */

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


    /* =================================================
       DELETE / ACTIVATE
       ================================================= */

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


/* =====================================================
   VIEW ONE OTHER
   ===================================================== */

export async function viewOther(id) {

    try {

        const o =
            await api(`/api/others/${id}`);

        if (!o) {
            showToast("Xodim ma'lumoti topilmadi.");
            return;
        }


        const fullName =
            `${o.firstName || ""} ${o.lastName || ""}`.trim();


        const active =
            o.active;


        const avatar =
            initials(
                o.firstName,
                o.lastName
            );


        $("#otherViewContent").innerHTML = `

            <div class="other-view">

                <!-- HEADER -->

                <div class="other-view-header">

                    <div class="other-view-avatar">
                        ${avatar}
                    </div>

                    <div class="other-view-title">

                        <h3>
                            ${escapeHtml(
            fullName || "Noma'lum"
        )}
                        </h3>

                        <p>
                            ${escapeHtml(
            o.profession || "Xodim"
        )}
                        </p>

                    </div>

                </div>


                <!-- STATUS -->

                <div class="other-view-status-row">

                    <span class="other-view-label">
                        Holati
                    </span>

                    <span class="
                        other-view-status
                        ${active ? "" : "off"}
                    ">

                        <span class="status-dot"></span>

                        ${active ? "Faol" : "Faol emas"}

                    </span>

                </div>


                <!-- INFORMATION -->

                <div class="other-view-info">

                    <div class="other-info-item">

                        <span class="other-info-label">
                            Ism
                        </span>

                        <strong class="other-info-value">
                            ${escapeHtml(
            o.firstName || "—"
        )}
                        </strong>

                    </div>


                    <div class="other-info-item">

                        <span class="other-info-label">
                            Familiya
                        </span>

                        <strong class="other-info-value">
                            ${escapeHtml(
            o.lastName || "—"
        )}
                        </strong>

                    </div>


                    <div class="other-info-item full">

                        <span class="other-info-label">
                            Kasbi
                        </span>

                        <strong class="other-info-value">
                            ${escapeHtml(
            o.profession || "—"
        )}
                        </strong>

                    </div>


                    <div class="other-info-item full">

                        <span class="other-info-label">
                            Telefon
                        </span>

                        <strong class="other-info-value">
                            ${escapeHtml(
            o.phone || "Telefon ko‘rsatilmagan"
        )}
                        </strong>

                    </div>
                    
                    <div class="other-info-item full">

                        <span class="other-info-label">
                            Tug‘ilgan sana
                        </span>

                        <span class="other-info-value">
                            ${escapeHtml(
            o.birthDate || "-"
        )}
                        </span>

                    </div>


                    <div class="other-info-item full">

                        <span class="other-info-label">
                            ID
                        </span>

                        <strong class="other-info-value">
                            #${o.id}
                        </strong>

                    </div>

                </div>


                <!-- ACTIONS -->

                <div class="other-view-actions">

                    <button
                        class="secondary-btn"
                        type="button"
                        data-close-other-view
                    >
                        Yopish
                    </button>

                </div>

            </div>

        `;


        openModal("otherViewModal");


        const closeBtn =
            $("[data-close-other-view]");

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                () =>
                    closeModal(
                        "otherViewModal"
                    )
            );

        }

    } catch (e) {

        console.error(
            "View other error:",
            e
        );

        showToast(
            "Xodim ma'lumotini olishda xatolik."
        );
    }
}


/* =====================================================
   EDIT OTHER
   ===================================================== */

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
            o.birthDate || "";


        $("#otherForm")
            .dataset.editId = id;


        $("#otherModal")
            .querySelector("h2")
            .textContent =
            "Xodimni tahrirlash";


        openModal("otherModal");

    } catch (e) {

        console.error(
            "Edit other error:",
            e
        );

        showToast(
            "Xodim ma'lumotini olishda xatolik."
        );
    }
}


/* =====================================================
   DELETE / ACTIVATE OTHER
   ===================================================== */

export async function deleteOther(
    id,
    state
) {

    const other =
        state.others.find(
            o => o.id === id
        );


    if (!other) {

        showToast(
            "Xodim topilmadi."
        );

        return;
    }


    const isActive =
        other.active;


    const message =
        isActive
            ? "Ushbu xodimni faol emas holatiga o‘tkazish kerakmi?"
            : "Ushbu xodimni qayta faollashtirish kerakmi?";


    if (!confirm(message)) {
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
            isActive
                ? "Xodim faol emas holatiga o‘tkazildi."
                : "Xodim qayta faollashtirildi."
        );


        await loadOthers(
            state
        );


    } catch (e) {

        console.error(
            "Delete other error:",
            e
        );


        showToast(
            isActive
                ? "Xodimni o‘chirishda xatolik."
                : "Xodimni faollashtirishda xatolik."
        );
    }
}


/* =====================================================
   NEW OTHER
   ===================================================== */

export function openNewOther() {

    $("#otherForm").reset();

    delete $("#otherForm").dataset.editId;


    $("#otherModal")
        .querySelector("h2")
        .textContent =
        "Xodim qo‘shish";


    openModal(
        "otherModal"
    );
}


/* =====================================================
   OTHER FORM
   ===================================================== */

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