import { api } from "./api.js";

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


// =====================================================
// LOAD CHILDREN
// =====================================================

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


// =====================================================
// RENDER CHILDREN
// =====================================================

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
                genderText(c.gender)
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
                                type="button"
                                class="small-btn"
                                data-view-child="${c.id}"
                            >
                                Ko‘rish
                            </button>


                            <!-- TAHRIRLASH -->

                            <button
                                type="button"
                                class="small-btn"
                                data-edit-child="${c.id}"
                            >
                                Tahrirlash
                            </button>


                            <!-- O'CHIRISH / FAOLLASHTIRISH -->

                            <button
                                type="button"
                                class="small-btn ${
                c.active
                    ? "danger"
                    : ""
            }"
                                data-delete-child="${c.id}"
                            >
                                ${
                c.active
                    ? "O‘chirish"
                    : "Faollashtirish"
            }
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


    // =================================================
    // VIEW
    // =================================================

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


    // =================================================
    // EDIT
    // =================================================

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


    // =================================================
    // DELETE
    // =================================================

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
            await api(
                `/api/children/${id}`
            );


        if (!child) {

            throw new Error(
                "Bola topilmadi"
            );

        }


        // =================================================
        // AVATAR
        // =================================================

        const avatar =
            $("#viewChildAvatar");

        if (avatar) {

            avatar.textContent =
                initials(
                    child.firstName,
                    child.lastName
                );

        }


        // =================================================
        // NAME
        // =================================================

        const name =
            $("#viewChildName");

        if (name) {

            name.textContent =
                `${child.firstName || ""} ${child.lastName || ""}`
                    .trim();

        }


        // =================================================
        // PATRONYMIC
        // =================================================

        const patronymic =
            $("#viewChildPatronymic");

        if (patronymic) {

            patronymic.textContent =
                child.patronymic || "—";

        }


        // =================================================
        // BIRTH DATE
        // =================================================

        const birthDate =
            $("#viewChildBirthDate");

        if (birthDate) {

            birthDate.textContent =
                child.birthDate || "—";

        }


        // =================================================
        // AGE
        // =================================================

        const age =
            $("#viewChildAge");

        if (age) {

            age.textContent =
                child.age != null
                    ? `${child.age} yosh`
                    : "—";

        }


        // =================================================
        // GENDER
        // =================================================

        const gender =
            $("#viewChildGender");

        if (gender) {

            gender.textContent =
                genderText(child.gender);

        }


        // =================================================
        // GROUP
        // =================================================

        const group =
            $("#viewChildGroup");

        if (group) {

            group.textContent =
                child.groupName ||
                child.group ||
                "—";

        }


        // =================================================
        // MOTHER
        // =================================================

        const mother =
            $("#viewChildMother");

        if (mother) {

            mother.textContent =
                `${child.motherFirstName || ""} ${child.motherLastName || ""}`
                    .trim() || "—";

        }


        // =================================================
        // MOTHER PHONE
        // =================================================

        const motherPhone =
            $("#viewChildMotherPhone");

        if (motherPhone) {

            motherPhone.textContent =
                child.motherPhone || "—";

        }


        // =================================================
        // FATHER
        // =================================================

        const father =
            $("#viewChildFather");

        if (father) {

            father.textContent =
                `${child.fatherFirstName || ""} ${child.fatherLastName || ""}`
                    .trim() || "—";

        }


        // =================================================
        // FATHER PHONE
        // =================================================

        const fatherPhone =
            $("#viewChildFatherPhone");

        if (fatherPhone) {

            fatherPhone.textContent =
                child.fatherPhone || "—";

        }


        // =================================================
        // ADDRESS
        // =================================================

        const address =
            $("#viewChildAddress");

        if (address) {

            address.textContent =
                child.address || "—";

        }


        // =================================================
        // STATUS
        // =================================================

        const status =
            $("#viewChildStatus");

        if (status) {

            status.textContent =
                child.active
                    ? "Faol"
                    : "Faol emas";

            status.className =
                child.active
                    ? "teacher-view-status"
                    : "teacher-view-status off";

        }


        // =================================================
        // EDIT BUTTON
        // =================================================

        const editBtn =
            $("#viewChildEditBtn");

        if (editBtn) {

            const newEditBtn =
                editBtn.cloneNode(true);

            editBtn.replaceWith(
                newEditBtn
            );


            newEditBtn.addEventListener(
                "click",
                async () => {

                    closeModal(
                        "viewChildModal"
                    );


                    await editChild(
                        child.id,
                        state
                    );

                }
            );

        }


        // =================================================
        // DELETE / ACTIVATE BUTTON
        // =================================================

        const deleteBtn =
            $("#viewChildDeleteBtn");

        if (deleteBtn) {

            const newDeleteBtn =
                deleteBtn.cloneNode(true);

            deleteBtn.replaceWith(
                newDeleteBtn
            );


            newDeleteBtn.textContent =
                child.active
                    ? "O‘chirish"
                    : "Faollashtirish";


            newDeleteBtn.className =
                child.active
                    ? "small-btn danger"
                    : "small-btn";


            newDeleteBtn.addEventListener(
                "click",
                async () => {

                    closeModal(
                        "viewChildModal"
                    );


                    await deleteChild(
                        child.id,
                        state
                    );

                }
            );

        }


        // =================================================
        // DAILY HISTORY BUTTON
        // =================================================

        const dailyBtn =
            $("#viewChildDailyBtn");

        if (dailyBtn) {

            const newDailyBtn =
                dailyBtn.cloneNode(true);

            dailyBtn.replaceWith(
                newDailyBtn
            );


            newDailyBtn.addEventListener(
                "click",
                async () => {

                    /*
                     * groups.js dagi umumiy
                     * davomat funksiyasini chaqiramiz.
                     */

                    const {
                        openChildDaily
                    } = await import("./attendance.js");


                    await openChildDaily(
                        child,
                        state
                    );

                }
            );

        }


        // =================================================
        // OPEN MODAL
        // =================================================

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
            await api(
                `/api/children/${id}`
            );


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

        console.error(
            "Edit child error:",
            e
        );


        showToast(
            "Bola ma'lumotini olishda xatolik."
        );

    }

}


// =====================================================
// DELETE / ACTIVATE CHILD
// =====================================================

export async function deleteChild(
    id,
    state
) {

    /*
     * state.children bo'sh bo'lishi mumkin.
     * Shuning uchun kerak bo'lsa backenddan olamiz.
     */

    if (!Array.isArray(state.children)) {

        state.children =
            await api(
                "/api/children"
            ) || [];

    }


    let child =
        state.children.find(
            c => c.id === id
        );


    /*
     * Agar bola state.children ichida yo'q bo'lsa,
     * backenddan olib ko'ramiz.
     *
     * Bu ayniqsa:
     * Guruh → Bola → Ko‘rish → O‘chirish
     * holatida kerak.
     */

    if (!child) {

        try {

            child =
                await api(
                    `/api/children/${id}`
                );

        } catch (e) {

            console.error(
                "Child lookup error:",
                e
            );

        }

    }


    if (!child) {

        showToast(
            "Bola topilmadi."
        );

        return;

    }


    const isActive =
        child.active;


    const message =
        isActive

            ? "Bu bolani faol emas holatiga o‘tkazish kerakmi?"

            : "Bu bolani qayta faollashtirish kerakmi?";


    if (!confirm(message)) {

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
            isActive

                ? "Bola faol emas holatiga o‘tkazildi."

                : "Bola qayta faollashtirildi."
        );


        /*
         * Child listni yangilaymiz.
         */
        await loadChildren(
            state
        );


        /*
         * Guruhlar oynasi ochiq bo'lsa,
         * children o'zgarganini bildiramiz.
         */
        document.dispatchEvent(
            new CustomEvent(
                "childChanged"
            )
        );


    } catch (e) {

        console.error(
            "Delete child error:",
            e
        );


        showToast(
            isActive

                ? "Bolaning holatini o‘zgartirib bo‘lmadi."

                : "Bolani faollashtirib bo‘lmadi."
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

    if (!state.groups?.length) {

        state.groups =
            await api(
                "/api/group"
            ) || [];

    }


    select.innerHTML =
        `<option value="">
            Guruhni tanlang
        </option>` +

        state.groups.map(
            g => `
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


    $("#childId").value =
        "";


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

                    console.error(
                        "Child save error:",
                        e
                    );


                    showToast(
                        "Bola saqlanmadi. Request maydonlarini tekshiring."
                    );

                }

            }
        );

}