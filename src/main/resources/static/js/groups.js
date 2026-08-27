import { api } from "./api.js";
import {
    $,
    escapeHtml,
    initials,
    showToast
} from "./utils.js";

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

        // Guruh card click
        document
            .querySelectorAll("[data-group-id]")
            .forEach(card => {

                card.addEventListener("click", () => {

                    const id =
                        Number(card.dataset.groupId);

                    openGroup(id, state);

                });

            });

    } catch (e) {

        console.error("Groups error:", e);

        el.innerHTML = `
            <div class="empty-state">
                Guruhlarni olishda xatolik.
            </div>
        `;
    }
}


export async function openGroup(groupId, state) {

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

    groupsPage.style.display = "none";

    groupDetailsPage.style.display = "block";

    $("#groupDetailsContent").innerHTML = `
        <div class="empty-state">
            Guruh ma'lumotlari yuklanmoqda...
        </div>
    `;

    try {

        const group =
            await api(`/api/group/${groupId}`);

        if (!group) {
            throw new Error(
                "Guruh topilmadi"
            );
        }

        renderGroupDetails(group, state);

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


export function renderGroupDetails(group, state) {

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
        group.groupName || "Guruh"
    )}
                </h2>

                <p>
                    Guruh ID: ${group.id}
                </p>

            </div>

        </div>


        <div class="group-detail-grid">


            <!-- TEACHER -->

            <section class="panel group-teacher-card">

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


            <!-- CHILDREN -->

            <section class="panel group-children-card">

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
                        ${children.length} bola
                    </span>

                </div>


                <div class="group-children-list">

                    ${
        children.length
            ? children.map(child => `

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


                                    <div class="group-child-info">

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


                                    <div class="group-child-meta">

                                        <span>
                                            ${child.age ?? "—"}
                                            yosh
                                        </span>

                                        <span>
                                            ${escapeHtml(
                child.gender || "—"
            )}
                                        </span>

                                        <span class="status">
                                            Faol
                                        </span>

                                    </div>


                                    <div class="group-child-arrow">
                                        →
                                    </div>

                                </div>

                            `).join("")

            : `
                                <div class="empty-state">
                                    Bu guruhda faol bolalar yo‘q.
                                </div>
                            `
    }

                </div>

            </section>

        </div>
    `;


    // Back
    $("#backToGroupsBtn")
        ?.addEventListener(
            "click",
            closeGroupDetails
        );


    // Teacher
    $("#changeGroupTeacherBtn")
        ?.addEventListener(
            "click",
            () => {
                changeGroupTeacher(group.id);
            }
        );


    // Children
    document
        .querySelectorAll("[data-child-id]")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    openGroupChild(
                        Number(
                            item.dataset.childId
                        )
                    );

                }
            );

        });
}


export function closeGroupDetails() {

    $("#groupDetailsPage").style.display =
        "none";

    $("#groupsPage").style.display = "";

    $("#groupDetailsContent").innerHTML =
        "";
}


// Hozircha backend endpoint aniqlanmagan
export async function changeGroupTeacher(groupId) {

    showToast(
        `Guruh #${groupId} uchun ustozni almashtirish funksiyasi hali backend endpointga bog‘lanmagan.`
    );

}


// Guruh ichidagi bolani ko‘rish
export async function openGroupChild(childId) {

    try {

        const child =
            await api(`/api/children/${childId}`);

        if (!child) {
            throw new Error(
                "Bola topilmadi"
            );
        }

        alert(
            `Bola: ${child.firstName || ""} ${child.lastName || ""}`
        );

    } catch (e) {

        console.error(e);

        showToast(
            "Bola ma'lumotini olishda xatolik."
        );
    }
}