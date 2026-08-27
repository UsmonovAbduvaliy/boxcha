import { api } from "./api.js";
import {
    $,
    escapeHtml
} from "./utils.js";

export async function loadAttendanceChildren(
    state
) {

    if (!state.children.length) {
        await state.loadChildren(true);
    }

    renderAttendanceOptions(state);
}


export function renderAttendanceOptions(
    state
) {

    const select =
        $("#attendanceChild");

    if (!select) return;


    select.innerHTML =
        `<option value="">
            Bolani tanlang
        </option>` +

        state.children
            .filter(c => c.isActive)
            .map(c =>
                `
                <option value="${c.id}">
                    ${escapeHtml(
                    `${c.firstName || ""} ${c.lastName || ""}`
                        .trim()
                )}
                </option>
                `
            )
            .join("");
}


export async function showAttendance(id) {

    try {

        const records =
            await api(
                `/daily/children/${id}`
            ) || [];


        $("#attendanceResult").innerHTML =
            records.length
                ? records.map(r => `

                    <div class="attendance-row">

                        <span>
                            ${escapeHtml(
                    r.date || "—"
                )}
                        </span>

                        <b
                            class="${
                    r.isPresent
                        ? "present"
                        : "absent"
                }"
                        >
                            ${
                    r.isPresent
                        ? "Keldi"
                        : "Kelmagan"
                }
                        </b>

                    </div>

                `).join("")
                : `
                    <div class="empty-state">
                        Bu bola uchun davomat yozuvlari yo‘q.
                    </div>
                `;

    } catch (e) {

        console.error(e);

        $("#attendanceResult").innerHTML = `
            <div class="empty-state">
                Davomatni olishda xatolik.
            </div>
        `;
    }
}