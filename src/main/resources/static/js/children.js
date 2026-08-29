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


export async function loadChildren(
    state,
    silent = false
) {

    if (!silent) {

        $("#childrenTable").innerHTML = `
<tr>
<td colspan="5" class="loading-row">
    Yuklanmoqda...
</td>
</tr>
`;

    }

    try {

        state.children =
            await api("/api/children") || [];

        if (!silent) {
            renderChildren(state);
        }

        document.dispatchEvent(
            new CustomEvent("childrenLoaded")
        );

    } catch (e) {

        console.error(
            "Children error:",
            e
        );

        if (!silent) {

            $("#childrenTable").innerHTML = `
<tr>
<td
colspan="5"
class="loading-row"
    >
    Ma'lumotni olishda xatolik.
</td>
</tr>
`;

        }
    }
}


export function renderChildren(state) {

    const search =
        ($("#childrenSearch")?.value || "")
            .trim()
            .toLowerCase();

    const arr =
        state.children.filter(c => {

            if (
                state.childFilter === "active" &&
                !c.active
            ) {
                return false;
            }

            if (
                state.childFilter === "inactive" &&
                c.active
            ) {
                return false;
            }

            const full =
                `${c.firstName || ""} ${c.lastName || ""}`
                    .toLowerCase();

            return (
                !search ||
                full.includes(search)
            );

        });


    $("#childrenTable").innerHTML =
        arr.length
            ? arr.map(c => `

<tr>

<td>

<div class="child-name">

    <div class="child-avatar">
    ${initials(
    c.firstName,
    c.lastName
)}
</div>

${escapeHtml(
    `${c.firstName || ""} ${c.lastName || ""}`
        .trim()
)}

</div>

</td>


<td>
    ${c.age ?? "—"}
</td>


<td>
    ${escapeHtml(
    c.gender || "—"
)}
</td>


<td>

                        <span
                            class="status ${
                                c.active
                                    ? ""
                                    : "off"
                            }"
                        >
                            ${
                            c.active
                                ? "Faol"
                                : "Faol emas"
                        }
                        </span>

</td>


<td>

    <div class="person-actions">

        <!-- KO'RISH -->

        <button
            class="small-btn"
            data-view-child="${c.id}"
        >
            Ko‘rish
        </button>


        <!-- TAHRIRLASH -->

        <button
            class="small-btn"
            data-edit-child="${c.id}"
        >
            Tahrirlash
        </button>


        <!-- O'CHIRISH -->

        <button
            class="small-btn danger"
            data-delete-child="${c.id}"
        >
            O‘chirish
        </button>

    </div>

</td>

</tr>

`).join("")
            : `
<tr>
<td
colspan="5"
class="loading-row"
    >
    Bola topilmadi.
</td>
</tr>
`;


    // =========================
    // VIEW CHILD
    // =========================

    document
        .querySelectorAll("[data-view-child]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    viewChild(
                        Number(
                            btn.dataset.viewChild
                        ),
                        state
                    );

                }
            );

        });


    // =========================
    // EDIT CHILD
    // =========================

    document
        .querySelectorAll("[data-edit-child]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    editChild(
                        Number(
                            btn.dataset.editChild
                        ),
                        state
                    );

                }
            );

        });


    // =========================
    // DELETE CHILD
    // =========================

    document
        .querySelectorAll("[data-delete-child]")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    deleteChild(
                        Number(
                            btn.dataset.deleteChild
                        ),
                        state
                    );

                }
            );

        });
}


// =====================================================
// VIEW CHILD
// =====================================================

export async function viewChild(
    id,
    state
) {

    try {

        const child =
            await api(`/api/children/${id}`);

        if (!child) {
            throw new Error(
                "Bola topilmadi"
            );
        }


        // =========================
        // HEADER
        // =========================

        $("#viewChildAvatar").textContent =
            initials(
                child.firstName,
                child.lastName
            );


        $("#viewChildName").textContent =
            `${child.firstName || ""} ${child.lastName || ""}`
                .trim();


        $("#viewChildPatronymic").textContent =
            child.patronymic || "—";


        // =========================
        // ASOSIY MA'LUMOTLAR
        // =========================

        $("#viewChildBirthDate").textContent =
            child.birthDate || "—";


        $("#viewChildAge").textContent =
            child.age != null
                ? `${child.age} yosh`
                : "—";


        $("#viewChildGender").textContent =
            child.gender || "—";


        $("#viewChildGroup").textContent =
            child.groupName || "—";


        // =========================
        // OTA-ONA
        // =========================

        $("#viewChildMother").textContent =
            `${child.motherFirstName || ""} ${child.motherLastName || ""}`
                .trim() || "—";


        $("#viewChildMotherPhone").textContent =
            child.motherPhone || "—";


        $("#viewChildFather").textContent =
            `${child.fatherFirstName || ""} ${child.fatherLastName || ""}`
                .trim() || "—";


        $("#viewChildFatherPhone").textContent =
            child.fatherPhone || "—";


        // =========================
        // MANZIL
        // =========================

        $("#viewChildAddress").textContent =
            child.address || "—";


        // =========================
        // STATUS
        // =========================

        const status =
            $("#viewChildStatus");

        status.textContent =
            child.active
                ? "Faol"
                : "Faol emas";

        status.className =
            child.active
                ? "teacher-view-status"
                : "teacher-view-status off";


        // =========================
        // EDIT BUTTON
        // =========================

        const editBtn =
            $("#viewChildEditBtn");

        editBtn.onclick = () => {

            closeModal(
                "viewChildModal"
            );

            editChild(
                child.id,
                state
            );

        };


        // =========================
        // OPEN MODAL
        // =========================

        openModal(
            "viewChildModal"
        );

    } catch (e) {

        console.error(
            "View child error:",
            e
        );

        showToast(
            "Bola ma'lumotini olishda xatolik."
        );
    }
}


// =====================================================
// EDIT CHILD
// =====================================================

export async function editChild(
    id,
    state
) {

    try {

        const c =
            await api(`/api/children/${id}`);


        await fillGroupSelect(
            $("#childGroup"),
            state
        );


        $("#childId").value =
            c.id;


        $("#childModalTitle").textContent =
            "Bolani tahrirlash";


        $("#childFirstName").value =
            c.firstName || "";


        $("#childLastName").value =
            c.lastName || "";


        $("#childPatronymic").value =
            c.patronymic || "";


        $("#childBirthDate").value =
            c.birthDate || "";


        $("#childGender").value =
            c.gender || "MALE";


        const group =
            state.groups.find(
                g =>
                    g.name === c.groupName ||
                    g.name === c.group
            );


        $("#childGroup").value =
            group?.id || "";


        $("#motherFirstName").value =
            c.motherFirstName || "";


        $("#motherLastName").value =
            c.motherLastName || "";


        $("#fatherFirstName").value =
            c.fatherFirstName || "";


        $("#fatherLastName").value =
            c.fatherLastName || "";


        $("#motherPhone").value =
            c.motherPhone || "";


        $("#fatherPhone").value =
            c.fatherPhone || "";


        $("#childAddress").value =
            c.address || "";


        openModal(
            "childModal"
        );

    } catch (e) {

        console.error(e);

        showToast(
            "Bola ma'lumotini olishda xatolik."
        );
    }
}


// =====================================================
// DELETE CHILD
// =====================================================

export async function deleteChild(
    id,
    state
) {

    if (
        !confirm(
            "Bu bolani o‘chirishni xohlaysizmi?"
        )
    ) {
        return;
    }


    try {

        await api(
            `/api/children/${id}`,
            {
                method: "DELETE"
            }
        );


        showToast(
            "Bola faol emas holatiga o‘tkazildi."
        );


        await loadChildren(
            state
        );


    } catch (e) {

        console.error(e);

        showToast(
            "Bolaning holatini o‘zgartirib bo‘lmadi."
        );
    }
}


// =====================================================
// GROUP SELECT
// =====================================================

export async function fillGroupSelect(
    select,
    state
) {

    if (!state.groups.length) {

        state.groups =
            await api("/api/group") || [];

    }


    select.innerHTML =
        `<option value="">
    Guruhni tanlang
</option>` +

state.groups.map(g =>
    `
            <option value="${g.id}">
                ${escapeHtml(g.name)}
            </option>
            `
).join("");
}


// =====================================================
// NEW CHILD
// =====================================================

export async function openNewChild(
    state
) {

    $("#childForm").reset();

    $("#childId").value = "";

    $("#childModalTitle").textContent =
        "Bola qo‘shish";


    await fillGroupSelect(
        $("#childGroup"),
        state
    );


    openModal(
        "childModal"
    );
}


// =====================================================
// CHILD FORM
// =====================================================

export function initChildForm(
    state
) {

    $("#childForm")
        .addEventListener(
            "submit",
            async e => {

                e.preventDefault();


                const payload = {

                    firstName:
                    $("#childFirstName").value,

                    lastName:
                    $("#childLastName").value,

                    patronymic:
                        $("#childPatronymic").value ||
                        null,

                    birthDate:
                    $("#childBirthDate").value,

                    motherFirstName:
                        $("#motherFirstName").value ||
                        null,

                    motherLastName:
                        $("#motherLastName").value ||
                        null,

                    fatherFirstName:
                        $("#fatherFirstName").value ||
                        null,

                    fatherLastName:
                        $("#fatherLastName").value ||
                        null,

                    address:
                        $("#childAddress").value ||
                        null,

                    motherPhone:
                        $("#motherPhone").value ||
                        null,

                    fatherPhone:
                        $("#fatherPhone").value ||
                        null,

                    gender:
                    $("#childGender").value,

                    groupId:
                        Number(
                            $("#childGroup").value
                        )

                };


                try {

                    const id =
                        $("#childId").value;


                    await api(
                        id
                            ? `/api/children/${id}`
                            : "/api/children",
                        {
                            method:
                                id
                                    ? "PUT"
                                    : "POST",

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                    closeModal(
                        "childModal"
                    );


                    showToast(
                        id
                            ? "Bola yangilandi."
                            : "Bola qo‘shildi."
                    );


                    await loadChildren(
                        state
                    );


                    document.dispatchEvent(
                        new CustomEvent(
                            "childChanged"
                        )
                    );


                } catch (e) {

                    console.error(e);

                    showToast(
                        "Bola saqlanmadi. Request maydonlarini tekshiring."
                    );

                }

            }
        );
}
