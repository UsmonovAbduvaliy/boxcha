import { api } from "./api.js";
import { $, escapeHtml, todayText } from "./utils.js";

export async function loadDashboard(state, loadChildren) {

    try {

        const data = await api("/api/dashboard");

        state.dashboard = data;

        $("#groupsCount").textContent =
            data.groupsCount ?? 0;

        $("#childrenCount").textContent =
            data.childrenCount ?? 0;

        $("#employeesCount").textContent =
            data.employeesCount ?? 0;

        const groups =
            Array.isArray(data.groups)
                ? data.groups
                : [];

        const total = Math.max(
            ...groups.map(
                g => Number(g.childrenCount || 0)
            ),
            1
        );

        $("#dashboardGroups").innerHTML =
            groups.length
                ? groups.map(g => `
                    <div class="group-row">

                        <div class="group-symbol">
                            ♙
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(g.name)}
                            </strong>

                            <small>
                                ${Number(g.childrenCount || 0)}
                                ta faol bola
                            </small>

                            <div class="group-bar">
                                <i style="
                                    width:${Math.min(
                    100,
                    Number(g.childrenCount || 0)
                    / total * 100
                )}%
                                "></i>
                            </div>

                        </div>

                        <span class="group-count">
                            ${Number(g.childrenCount || 0)}
                            bola
                        </span>

                    </div>
                `).join("")
                : `
                    <div class="empty-state">
                        Guruhlar mavjud emas.
                    </div>
                `;

        await loadChildren(true);

        $("#activeChildrenCount").textContent =
            state.children.filter(
                c => c.active === true
            ).length;

        renderRecent(state);

    } catch (e) {

        console.error("Dashboard error:", e);

        $("#dashboardGroups").innerHTML = `
            <div class="empty-state">
                Dashboard ma'lumotini olishda xatolik.
            </div>
        `;
    }
}

export function renderRecent(state) {

    const children =
        state.children.slice(0, 3);

    const groups =
        state.dashboard?.groups || [];

    const items = [];

    children.slice(0, 2).forEach(c => {

        items.push({
            title: "Bola ro‘yxatda",
            text:
                `${c.firstName || ""} ${c.lastName || ""}`
                    .trim() +
                " tizimdagi bola",
            time: "Hozir"
        });

    });

    if (groups[0]) {

        items.push({
            title: "Guruh ma'lumoti",
            text:
                `${groups[0].name} guruhida ` +
                `${groups[0].childrenCount} ta faol bola`,
            time: "Bugun"
        });

    }

    $("#recentUpdates").innerHTML =
        items.length
            ? items.map(x => `
                <div class="update-item">

                    <div class="update-icon">
                        ✓
                    </div>

                    <strong>
                        ${escapeHtml(x.title)}
                    </strong>

                    <span>
                        ${escapeHtml(x.text)}
                    </span>

                    <time>
                        ${escapeHtml(x.time)}
                    </time>

                </div>
            `).join("")
            : `
                <div class="empty-state">
                    Hozircha yangilik yo‘q.
                </div>
            `;
}