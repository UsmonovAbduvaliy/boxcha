const API = ""; // Spring Boot frontend same host. If backend is on another host, put its base URL here.

const state = {
    dashboard: null,
    groups: [],
    children: [],
    users: [],
    others: [],
    roles: [],
    childFilter: "all",
    userFilter: "all",
    otherFilter: "all"
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function token() {
    const t =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        "";

    return t.replace(/^Bearer\s+/i, "").trim();
}

function decodeJwt(t) {
    try {
        const part = t.split(".")[1];
        return JSON.parse(decodeURIComponent(atob(part.replace(/-/g, "+").replace(/_/g, "/"))
            .split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
    } catch { return {}; }
}

function currentUser() {
    const p = decodeJwt(token());
    const roles = p.roles || p.role || "";
    return {
        id: p.id,
        email: p.email || p.sub || "",
        name: p.firstName || p.name || p.username || (p.email ? p.email.split("@")[0] : "Foydalanuvchi"),
        role: Array.isArray(roles) ? roles.join(", ") : String(roles),
        active: p.active
    };
}

async function api(path, options = {}) {
    const headers = {"Content-Type": "application/json", ...(options.headers || {})};
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;

    const res = await fetch(API + path, {...options, headers});
    if (res.status === 401 || res.status === 403) {
        showToast("Ruxsat berilmadi. Login tokeningizni tekshiring.");
        throw new Error(`HTTP ${res.status}`);
    }

    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const body = await res.text();
            if (body) message += `: ${body}`;
        } catch {}
        throw new Error(message);
    }

    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function showToast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

function initials(first = "", last = "") {
    return ((first[0] || "") + (last[0] || "")).toUpperCase() || "B";
}

function todayText() {
    const d = new Date();
    return new Intl.DateTimeFormat("uz-UZ", {day:"2-digit", month:"long", year:"numeric", weekday:"long"}).format(d);
}

function setupUser() {
    const u = currentUser();
    const name = u.name || "Foydalanuvchi";
    const role = u.role || "Foydalanuvchi";
    $("#welcomeName").textContent = name;
    $("#profileName").textContent = name;
    $("#topName").textContent = name;
    $("#profileRole").textContent = role;
    $("#topRole").textContent = role;
    $("#profileAvatar").textContent = name[0].toUpperCase();
    $("#topAvatar").textContent = name[0].toUpperCase();

    const d = new Date();
    $("#todayDate").textContent = new Intl.DateTimeFormat("uz-UZ", {day:"2-digit",month:"short"}).format(d);
    $("#calendarDay").textContent = d.getDate();
    $("#calendarMonth").textContent = new Intl.DateTimeFormat("uz-UZ", {month:"long"}).format(d);
    $("#calendarWeekday").textContent = new Intl.DateTimeFormat("uz-UZ", {weekday:"long"}).format(d);
    $("#pageSubtitle").textContent = todayText() + " • Boxcha boshqaruv paneli";
}

function setPage(page) {
    $$(".page").forEach(x => x.classList.remove("active"));
    const target = $(`#page-${page}`);
    if (!target) return;
    target.classList.add("active");

    $$(".nav-item").forEach(x => x.classList.toggle("active", x.dataset.page === page));

    const titles = {
        dashboard: `Salom, ${currentUser().name || "Foydalanuvchi"}! 🌿`,
        groups: "Guruhlar",
        children: "Bolalar",
        teachers: "Ustozlar",
        others: "Boshqalar",
        attendance: "Davomat",
        settings: "Sozlamalar"
    };
    $("#pageTitle").textContent = titles[page] || "Boxcha";
    $("#pageSubtitle").textContent = page === "dashboard"
        ? todayText() + " • Boxcha boshqaruv paneli"
        : "Boxcha ma'lumotlarini boshqarish";

    if (page === "dashboard") loadDashboard();
    if (page === "groups") loadGroupsPage();
    if (page === "children") loadChildren();
    if (page === "teachers") loadUsers();
    if (page === "others") loadOthers();
    if (page === "attendance") loadAttendanceChildren();
}

async function loadDashboard() {
    try {
        const data = await api("/api/dashboard");
        state.dashboard = data;
        $("#groupsCount").textContent = data.groupsCount ?? 0;
        $("#childrenCount").textContent = data.childrenCount ?? 0;
        $("#employeesCount").textContent = data.employeesCount ?? 0;

        const groups = Array.isArray(data.groups) ? data.groups : [];
        const total = Math.max(...groups.map(g => Number(g.childrenCount || 0)), 1);

        $("#dashboardGroups").innerHTML = groups.length ? groups.map(g => `
            <div class="group-row">
                <div class="group-symbol">♙</div>
                <div>
                    <strong>${escapeHtml(g.name)}</strong>
                    <small>${Number(g.childrenCount || 0)} ta faol bola</small>
                    <div class="group-bar"><i style="width:${Math.min(100, Number(g.childrenCount || 0) / total * 100)}%"></i></div>
                </div>
                <span class="group-count">${Number(g.childrenCount || 0)} bola</span>
            </div>
        `).join("") : `<div class="empty-state">Guruhlar mavjud emas.</div>`;

        await loadChildren(true);
        $("#activeChildrenCount").textContent = state.children.filter(c => c.isActive === true).length;
        renderRecent();
    } catch (e) {
        $("#dashboardGroups").innerHTML = `<div class="empty-state">Dashboard ma'lumotini olishda xatolik.</div>`;
        console.error(e);
    }
}

function renderRecent() {
    const children = state.children.slice(0, 3);
    const groups = state.dashboard?.groups || [];
    const items = [];
    children.slice(0,2).forEach(c => items.push({
        title: "Bola ro‘yxatda",
        text: `${c.firstName || ""} ${c.lastName || ""}`.trim() + " tizimdagi bola",
        time: "Hozir"
    }));
    if (groups[0]) items.push({
        title: "Guruh ma'lumoti",
        text: `${groups[0].name} guruhida ${groups[0].childrenCount} ta faol bola`,
        time: "Bugun"
    });

    $("#recentUpdates").innerHTML = items.length ? items.map(x => `
        <div class="update-item">
            <div class="update-icon">✓</div>
            <strong>${escapeHtml(x.title)}</strong>
            <span>${escapeHtml(x.text)}</span>
            <time>${escapeHtml(x.time)}</time>
        </div>`).join("") : `<div class="empty-state">Hozircha yangilik yo‘q.</div>`;
}

async function loadGroupsPage() {
    const el = $("#groupsPage");
    el.innerHTML = `<div class="empty-state">Yuklanmoqda...</div>`;
    try {
        state.groups = await api("/api/group") || [];
        const stats = state.dashboard?.groups || [];
        const map = new Map(stats.map(x => [String(x.id), x]));
        el.innerHTML = state.groups.length ? state.groups.map(g => {
            const stat = map.get(String(g.id));
            return `<article class="group-card">
                <div class="group-card-head"><div class="group-card-symbol">♙</div><span class="status">${stat?.childrenCount ?? 0} bola</span></div>
                <h3>${escapeHtml(g.name)}</h3>
                <p>Guruh ID: ${g.id}</p>
                <div class="group-card-footer"><span>Faol bolalar</span><b>${stat?.childrenCount ?? 0}</b></div>
            </article>`;
        }).join("") : `<div class="empty-state">Guruhlar mavjud emas.</div>`;
    } catch(e) {
        el.innerHTML = `<div class="empty-state">Guruhlarni olishda xatolik.</div>`;
    }
}

async function loadChildren(silent = false) {
    if (!silent) $("#childrenTable").innerHTML = `<tr><td colspan="5" class="loading-row">Yuklanmoqda...</td></tr>`;
    try {
        state.children = await api("/api/children") || [];
        if (!silent) renderChildren();
        renderAttendanceOptions();
    } catch(e) {
        if (!silent) $("#childrenTable").innerHTML = `<tr><td colspan="5" class="loading-row">Ma'lumotni olishda xatolik.</td></tr>`;
    }
}

function renderChildren() {
    const search = ($("#childrenSearch")?.value || "").trim().toLowerCase();
    let arr = state.children.filter(c => {
        if (state.childFilter === "active" && !c.isActive) return false;
        if (state.childFilter === "inactive" && c.isActive) return false;
        const full = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
        return !search || full.includes(search);
    });

    $("#childrenTable").innerHTML = arr.length ? arr.map(c => `
        <tr>
            <td><div class="child-name"><div class="child-avatar">${initials(c.firstName,c.lastName)}</div>${escapeHtml(`${c.firstName || ""} ${c.lastName || ""}`.trim())}</div></td>
            <td>${c.age ?? "—"}</td>
            <td>${escapeHtml(c.gender || "—")}</td>
            <td><span class="status ${c.isActive ? "" : "off"}">${c.isActive ? "Faol" : "Faol emas"}</span></td>
            <td><div class="person-actions">
                <button class="small-btn" onclick="editChild(${c.id})">Tahrirlash</button>
                <button class="small-btn danger" onclick="deleteChild(${c.id})">O‘chirish</button>
            </div></td>
        </tr>
    `).join("") : `<tr><td colspan="5" class="loading-row">Bola topilmadi.</td></tr>`;
}

async function editChild(id) {
    try {
        const c = await api(`/api/children/${id}`);
        await fillGroupSelect($("#childGroup"));
        $("#childId").value = c.id;
        $("#childModalTitle").textContent = "Bolani tahrirlash";
        $("#childFirstName").value = c.firstName || "";
        $("#childLastName").value = c.lastName || "";
        $("#childPatronymic").value = c.patronymic || "";
        $("#childBirthDate").value = c.birthDate || "";
        $("#childGender").value = c.gender || "MALE";
        $("#childGroup").value = state.groups.find(g => g.name === c.groupName || g.name === c.group)?.id || "";
        $("#motherFirstName").value = c.motherFirstName || "";
        $("#motherLastName").value = c.motherLastName || "";
        $("#fatherFirstName").value = c.fatherFirstName || "";
        $("#fatherLastName").value = c.fatherLastName || "";
        $("#motherPhone").value = c.motherPhone || "";
        $("#fatherPhone").value = c.fatherPhone || "";
        $("#childAddress").value = c.address || "";
        openModal("childModal");
    } catch(e) { showToast("Bola ma'lumotini olishda xatolik."); }
}

async function deleteChild(id) {
    if (!confirm("Bu bolani o‘chirishni xohlaysizmi?")) return;
    try {
        await api(`/api/children/${id}`, {method:"DELETE"});
        showToast("Bola faol emas holatiga o‘tkazildi.");
        await loadChildren();
    } catch(e) { showToast("Bolaning holatini o‘zgartirib bo‘lmadi."); }
}

async function loadUsers() {
    $("#teachersGrid").innerHTML = `<div class="empty-state">Yuklanmoqda...</div>`;
    try {
        state.users = await api("/api/user?page=0&size=100") || [];
        renderUsers();
        await loadRoles();
    } catch(e) {
        $("#teachersGrid").innerHTML = `<div class="empty-state">Ustozlarni olishda xatolik.</div>`;
    }
}

function renderUsers() {
    const arr = state.users.filter(u =>
        state.userFilter === "all" ||
        (state.userFilter === "active" && u.isActive) ||
        (state.userFilter === "inactive" && !u.isActive)
    );
    $("#teachersGrid").innerHTML = arr.length ? arr.map(u => `
        <article class="person-card">
            <div class="person-top">
                <div class="person-avatar">${initials(u.firstName,u.lastName)}</div>
                <div><h3>${escapeHtml(`${u.firstName || ""} ${u.lastName || ""}`.trim())}</h3><p>${escapeHtml(u.roles || "Xodim")}</p></div>
            </div>
            <div class="person-meta">
                <span class="status ${u.isActive ? "" : "off"}">${u.isActive ? "Faol" : "Faol emas"}</span>
                <div class="person-actions">
                    <button class="small-btn" onclick="editUser(${u.id})">Tahrirlash</button>
                    <button class="small-btn danger" onclick="deleteUser(${u.id})">O‘chirish</button>
                </div>
            </div>
        </article>
    `).join("") : `<div class="empty-state">Ustozlar topilmadi.</div>`;
}

async function editUser(id) {
    try {
        const u = await api(`/api/user/${id}`);
        const first = u.firstName || "";
        const last = u.lastName || "";
        $("#teacherFirstName").value = first;
        $("#teacherLastName").value = last;
        $("#teacherEmail").value = u.email || "";
        $("#teacherPhone").value = u.phone || "";
        $("#teacherForm").dataset.editId = id;
        $("#teacherModal").querySelector("h2").textContent = "Ustozni tahrirlash";
        await fillGroupSelect($("#teacherGroup"));
        await loadRoles();
        $("#teacherGroup").value = "";
        $("#teacherRole").value = "";
        openModal("teacherModal");
        showToast("Tahrirlash formasi ochildi. Backend update endpoint role/groupni o‘zgartirmaydi.");
    } catch(e) { showToast("Ustoz ma'lumotini olishda xatolik."); }
}

async function deleteUser(id) {
    if (!confirm("Ushbu xodimni faol emas holatiga o‘tkazish kerakmi?")) return;
    try {
        await api(`/api/user/${id}`, {method:"DELETE"});
        showToast("Xodim faol emas holatiga o‘tkazildi.");
        await loadUsers();
    } catch(e) { showToast("Xodimni o‘chirishda xatolik."); }
}

async function loadRoles() {
    try {
        state.roles = await api("/api/role") || [];
        $("#teacherRole").innerHTML = state.roles.map(r => `<option value="${r.id}">${escapeHtml(r.role)}</option>`).join("");
    } catch(e) {
        $("#teacherRole").innerHTML = `<option value="">Rol topilmadi</option>`;
    }
}

async function loadOthers() {
    $("#othersGrid").innerHTML = `<div class="empty-state">Yuklanmoqda...</div>`;
    try {
        state.others = await api("/api/others") || [];
        renderOthers();
    } catch(e) {
        $("#othersGrid").innerHTML = `<div class="empty-state">Boshqalarni olishda xatolik.</div>`;
    }
}

function renderOthers() {
    const arr = state.others.filter(o =>
        state.otherFilter === "all" ||
        (state.otherFilter === "active" && o.isActive) ||
        (state.otherFilter === "inactive" && !o.isActive)
    );
    $("#othersGrid").innerHTML = arr.length ? arr.map(o => `
        <article class="person-card">
            <div class="person-top">
                <div class="person-avatar">${initials(o.firstName,o.lastName)}</div>
                <div><h3>${escapeHtml(`${o.firstName || ""} ${o.lastName || ""}`.trim())}</h3><p>${escapeHtml(o.profession || "Xodim")}</p></div>
            </div>
            <div class="person-meta">
                <span class="status ${o.isActive ? "" : "off"}">${o.isActive ? "Faol" : "Faol emas"}</span>
                <div class="person-actions">
                    <button class="small-btn" onclick="editOther(${o.id})">Tahrirlash</button>
                    <button class="small-btn danger" onclick="deleteOther(${o.id})">O‘chirish</button>
                </div>
            </div>
        </article>
    `).join("") : `<div class="empty-state">Xodim topilmadi.</div>`;
}

async function editOther(id) {
    try {
        const o = await api(`/api/others/${id}`);
        $("#otherFirstName").value = o.firstName || "";
        $("#otherLastName").value = o.lastName || "";
        $("#otherProfession").value = o.profession || "";
        $("#otherForm").dataset.editId = id;
        $("#otherModal").querySelector("h2").textContent = "Xodimni tahrirlash";
        openModal("otherModal");
    } catch(e) { showToast("Xodim ma'lumotini olishda xatolik."); }
}

async function deleteOther(id) {
    if (!confirm("Ushbu xodimni faol emas holatiga o‘tkazish kerakmi?")) return;
    try {
        await api(`/api/others/${id}`, {method:"DELETE"});
        showToast("Xodim faol emas holatiga o‘tkazildi.");
        await loadOthers();
    } catch(e) { showToast("Xodimni o‘chirishda xatolik."); }
}

async function fillGroupSelect(select) {
    if (!state.groups.length) state.groups = await api("/api/group") || [];
    select.innerHTML = `<option value="">Guruhni tanlang</option>` +
        state.groups.map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join("");
}

async function loadAttendanceChildren() {
    if (!state.children.length) await loadChildren(true);
    renderAttendanceOptions();
}

function renderAttendanceOptions() {
    const select = $("#attendanceChild");
    if (!select) return;
    select.innerHTML = `<option value="">Bolani tanlang</option>` +
        state.children.filter(c => c.isActive).map(c =>
            `<option value="${c.id}">${escapeHtml(`${c.firstName || ""} ${c.lastName || ""}`.trim())}</option>`
        ).join("");
}

async function showAttendance(id) {
    try {
        const records = await api(`/daily/children/${id}`) || [];
        $("#attendanceResult").innerHTML = records.length ? records.map(r => `
            <div class="attendance-row">
                <span>${escapeHtml(r.date || "—")}</span>
                <b class="${r.isPresent ? "present" : "absent"}">${r.isPresent ? "Keldi" : "Kelmagan"}</b>
            </div>`).join("") : `<div class="empty-state">Bu bola uchun davomat yozuvlari yo‘q.</div>`;
    } catch(e) {
        $("#attendanceResult").innerHTML = `<div class="empty-state">Davomatni olishda xatolik.</div>`;
    }
}

function openModal(id) { $(`#${id}`).classList.add("open"); }
function closeModal(id) { $(`#${id}`).classList.remove("open"); }

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

async function openNewChild() {
    $("#childForm").reset();
    $("#childId").value = "";
    $("#childModalTitle").textContent = "Bola qo‘shish";
    await fillGroupSelect($("#childGroup"));
    openModal("childModal");
}

async function openNewTeacher() {
    $("#teacherForm").reset();
    delete $("#teacherForm").dataset.editId;
    $("#teacherModal").querySelector("h2").textContent = "Ustoz qo‘shish";
    await fillGroupSelect($("#teacherGroup"));
    await loadRoles();
    openModal("teacherModal");
}

function openNewOther() {
    $("#otherForm").reset();
    delete $("#otherForm").dataset.editId;
    $("#otherModal").querySelector("h2").textContent = "Xodim qo‘shish";
    openModal("otherModal");
}

async function init() {
    if (!token()) {
        window.location.href = "/login.html";
        return;
    }

    setupUser();

    $$(".nav-item").forEach(btn => btn.addEventListener("click", () => setPage(btn.dataset.page)));
    $$("[data-page]").forEach(btn => {
        if (!btn.classList.contains("nav-item")) btn.addEventListener("click", () => setPage(btn.dataset.page));
    });

    $("#refreshBtn").addEventListener("click", () => setPage("dashboard"));
    $("#logoutBtn").addEventListener("click", () => {
        ["accessToken","access_token","token","jwt","refreshToken","refresh_token"].forEach(k => localStorage.removeItem(k));
        window.location.href = "/auth/login.html";
    });

    $("#childrenSearch").addEventListener("input", renderChildren);

    $$("[data-child-filter]").forEach(btn => btn.addEventListener("click", () => {
        $$("[data-child-filter]").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        state.childFilter = btn.dataset.childFilter;
        renderChildren();
    }));

    $$("[data-user-filter]").forEach(btn => btn.addEventListener("click", () => {
        $$("[data-user-filter]").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        state.userFilter = btn.dataset.userFilter;
        renderUsers();
    }));

    $$("[data-other-filter]").forEach(btn => btn.addEventListener("click", () => {
        $$("[data-other-filter]").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        state.otherFilter = btn.dataset.otherFilter;
        renderOthers();
    }));

    $("#addChildBtn").addEventListener("click", openNewChild);
    $("#addTeacherBtn").addEventListener("click", openNewTeacher);
    $("#addOtherBtn").addEventListener("click", openNewOther);

    $$(".modal-close").forEach(b => b.addEventListener("click", () => closeModal(b.dataset.close)));
    $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.classList.remove("open"); }));

    $("#attendanceChild").addEventListener("change", e => e.target.value ? showAttendance(e.target.value) : ($("#attendanceResult").innerHTML = ""));

    $("#childForm").addEventListener("submit", async e => {
        e.preventDefault();
        const payload = {
            firstName: $("#childFirstName").value,
            lastName: $("#childLastName").value,
            patronymic: $("#childPatronymic").value || null,
            birthDate: $("#childBirthDate").value,
            motherFirstName: $("#motherFirstName").value || null,
            motherLastName: $("#motherLastName").value || null,
            fatherFirstName: $("#fatherFirstName").value || null,
            fatherLastName: $("#fatherLastName").value || null,
            address: $("#childAddress").value || null,
            motherPhone: $("#motherPhone").value || null,
            fatherPhone: $("#fatherPhone").value || null,
            gender: $("#childGender").value,
            groupId: Number($("#childGroup").value)
        };
        try {
            const id = $("#childId").value;
            await api(id ? `/api/children/${id}` : "/api/children", {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });
            closeModal("childModal");
            showToast(id ? "Bola yangilandi." : "Bola qo‘shildi.");
            await loadChildren();
            if (state.dashboard) await loadDashboard();
        } catch(e) { showToast("Bola saqlanmadi. Request maydonlarini tekshiring."); }
    });

    $("#teacherForm").addEventListener("submit", async e => {
        e.preventDefault();
        const editId = e.currentTarget.dataset.editId;
        try {
            if (editId) {
                await api(`/api/user/${editId}`, {
                    method:"PUT",
                    body: JSON.stringify({
                        firstName: $("#teacherFirstName").value,
                        lastName: $("#teacherLastName").value,
                        email: $("#teacherEmail").value,
                        phone: $("#teacherPhone").value || null
                    })
                });
                showToast("Ustoz yangilandi.");
            } else {
                await api("/api/user/add", {
                    method:"POST",
                    body: JSON.stringify({
                        firstName: $("#teacherFirstName").value,
                        lastName: $("#teacherLastName").value,
                        email: $("#teacherEmail").value,
                        phone: $("#teacherPhone").value || null,
                        groupId: Number($("#teacherGroup").value),
                        roleId: Number($("#teacherRole").value)
                    })
                });
                showToast("Ustoz qo‘shildi.");
            }
            closeModal("teacherModal");
            await loadUsers();
        } catch(e) { showToast("Ustoz saqlanmadi. Email/guruh/rolni tekshiring."); }
    });

    $("#otherForm").addEventListener("submit", async e => {
        e.preventDefault();
        const editId = e.currentTarget.dataset.editId;
        try {
            if (editId) {
                await api(`/api/others/${editId}`, {
                    method:"PUT",
                    body: JSON.stringify({
                        firstName: $("#otherFirstName").value,
                        lastName: $("#otherLastName").value,
                        phone: $("#otherPhone").value || null,
                        profession: $("#otherProfession").value,
                        dateOfBirth: $("#otherBirthDate").value || null
                    })
                });
                showToast("Xodim yangilandi.");
            } else {
                await api("/api/others", {
                    method:"POST",
                    body: JSON.stringify({
                        firstName: $("#otherFirstName").value,
                        lastName: $("#otherLastName").value,
                        phone: $("#otherPhone").value || null,
                        profession: $("#otherProfession").value,
                        birthOfDate: $("#otherBirthDate").value || null
                    })
                });
                showToast("Xodim qo‘shildi.");
            }
            closeModal("otherModal");
            await loadOthers();
        } catch(e) { showToast("Xodim saqlanmadi. Request maydonlarini tekshiring."); }
    });

    await loadDashboard();
}

window.editChild = editChild;
window.deleteChild = deleteChild;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editOther = editOther;
window.deleteOther = deleteOther;

document.addEventListener("DOMContentLoaded", init);