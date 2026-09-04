import { api } from "./api.js";

import {
    $,
    escapeHtml,
    showToast
} from "./utils.js";


// =====================================================
// CONSTANTS
// =====================================================

const HISTORY_MODAL_ID = "dailyHistoryModal";
const EDIT_MODAL_ID = "dailyEditModal";


// =====================================================
// ATTENDANCE CHILDREN
// =====================================================

export async function loadAttendanceChildren(state) {

    try {

        if (!state) {
            console.error("loadAttendanceChildren: state topilmadi");
            return;
        }

        if (!Array.isArray(state.children)) {
            state.children = [];
        }

        if (!state.children.length) {
            await state.loadChildren(true);
        }

        renderAttendanceOptions(state);

    } catch (error) {

        console.error(
            "Load attendance children error:",
            error
        );

        showToast(
            "Bolalarni olishda xatolik."
        );
    }
}


// =====================================================
// RENDER ATTENDANCE OPTIONS
// =====================================================

export function renderAttendanceOptions(state) {

    const select =
        $("#attendanceChild");

    if (!select) {
        console.warn(
            "#attendanceChild topilmadi."
        );
        return;
    }

    const children =
        Array.isArray(state?.children)
            ? state.children
            : [];


    select.innerHTML =
        `<option value="">Bolani tanlang</option>` +

children
    .filter(child => child && child.active)
    .map(child => {

        const fullName =
            `${child.firstName || ""} ${child.lastName || ""}`
                .trim();

        return `
                    <option value="${child.id}">
                        ${escapeHtml(fullName)}
                    </option>
                `;
    })
    .join("");
}


// =====================================================
// SHOW ATTENDANCE
// =====================================================
// Bu eski attendanceResult uchun.
// Asosiy "Davomatni ko'rish" uchun
// openChildDaily() ishlatiladi.
// =====================================================

export async function showAttendance(id) {

    if (!id) {

        showToast(
            "Bola tanlanmagan."
        );

        return;
    }


    try {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            now.getMonth() + 1;


        const records =
            await api(
                `/api/daily/children/${id}?year=${year}&month=${month}`
            ) || [];


        const result =
            $("#attendanceResult");


        if (!result) {

            console.warn(
                "#attendanceResult topilmadi."
            );

            return;
        }


        if (!Array.isArray(records) || !records.length) {

            result.innerHTML = `
                <div class="empty-state">
                    Bu bola uchun davomat yozuvlari yo‘q.
                </div>
            `;

            return;
        }


        result.innerHTML =
            records
                .map(record => {

                    const present =
                        isPresentValue(record);


                    return `
                        <div class="attendance-row">

                            <span>
                                ${escapeHtml(
                        normalizeDate(record?.date)
                    )}
                            </span>

                            <b class="${present ? "present" : "absent"}">
                                ${
                        present
                            ? "Keldi"
                            : "Kelmagan"
                    }
                            </b>

                        </div>
                    `;
                })
                .join("");


    } catch (error) {

        console.error(
            "Show attendance error:",
            error
        );


        const result =
            $("#attendanceResult");


        if (result) {

            result.innerHTML = `
                <div class="empty-state">
                    Davomatni olishda xatolik.
                </div>
            `;
        }
    }
}


// =====================================================
// DATE HELPERS
// =====================================================

function normalizeDate(date) {

    if (!date) {
        return "";
    }

    return String(date).substring(0, 10);
}


// =====================================================
// TODAY
// =====================================================

function getTodayDate() {

    const now =
        new Date();


    return [
        now.getFullYear(),

        String(
            now.getMonth() + 1
        ).padStart(2, "0"),

        String(
            now.getDate()
        ).padStart(2, "0")

    ].join("-");
}


// =====================================================
// PRESENT VALUE
// =====================================================

function isPresentValue(daily) {

    if (!daily) {
        return false;
    }


    const value =
        daily.present !== undefined
            ? daily.present
            : daily.isPresent;


    return (
        value === true ||
        value === "true"
    );
}


// =====================================================
// DATE FORMAT
// =====================================================

function formatUzbekDate(date) {

    const normalized =
        normalizeDate(date);


    const parts =
        normalized.split("-");


    if (parts.length !== 3) {
        return String(date || "");
    }


    const year =
        parts[0];


    const month =
        Number(parts[1]);


    const day =
        Number(parts[2]);


    const months = [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr"
    ];


    return `${
        day
    } ${
        months[month - 1] || ""
    } ${
        year
    }`;
}


// =====================================================
// MONTH NAMES
// =====================================================

function getMonthNames() {

    return [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr"
    ];
}


// =====================================================
// REMOVE MODAL
// =====================================================

function removeModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) {
        return;
    }


    if (modal._escapeHandler) {

        document.removeEventListener(
            "keydown",
            modal._escapeHandler
        );

        modal._escapeHandler = null;
    }


    modal.remove();
}


// =====================================================
// CLOSE HISTORY
// =====================================================

function closeDailyHistory() {

    removeModal(
        HISTORY_MODAL_ID
    );


    document.body.classList.remove(
        "daily-modal-open"
    );
}


// =====================================================
// CLOSE EDIT
// =====================================================

function closeDailyEdit() {

    removeModal(
        EDIT_MODAL_ID
    );


    document.body.classList.remove(
        "daily-modal-open"
    );
}


// =====================================================
// CLOSE ALL DAILY MODALS
// =====================================================

function closeAllDailyModals() {

    removeModal(
        HISTORY_MODAL_ID
    );


    removeModal(
        EDIT_MODAL_ID
    );


    document.body.classList.remove(
        "daily-modal-open"
    );
}


// =====================================================
// OPEN CHILD DAILY
// =====================================================

export async function openChildDaily(
    child,
    state,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1
) {

    // =================================================
    // CHILD CHECK
    // =================================================

    if (!child || !child.id) {

        console.error(
            "openChildDaily: child topilmadi:",
            child
        );


        showToast(
            "Bola topilmadi."
        );


        return;
    }


    // =================================================
    // YEAR / MONTH NORMALIZE
    // =================================================

    year =
        Number(year);


    month =
        Number(month);


    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
    ) {

        console.error(
            "openChildDaily: noto‘g‘ri year/month:",
            {
                year,
                month
            }
        );


        showToast(
            "Sana ma'lumotida xatolik."
        );


        return;
    }


    try {

        console.log(
            "OPEN CHILD DAILY:",
            {
                childId: child.id,
                year,
                month
            }
        );


        // =============================================
        // BACKEND
        // =============================================

        const response =
            await api(
                `/api/daily/children/${child.id}?year=${year}&month=${month}`
            );


        const dailies =
            Array.isArray(response)
                ? response
                : [];


        console.log(
            "DAILY RESPONSE:",
            dailies
        );


        // =============================================
        // RENDER
        // =============================================

        renderChildDaily(
            child,
            dailies,
            year,
            month,
            state
        );


    } catch (error) {

        console.error(
            "Child daily error:",
            error
        );


        showToast(
            "Davomat tarixini olishda xatolik."
        );
    }
}


// =====================================================
// OPEN DAILY DETAIL
// =====================================================

async function openDailyDetail(
    child,
    daily,
    date,
    state,
    year,
    month
) {

    console.log(
        "OPEN DAILY DETAIL:",
        {
            child,
            daily,
            date,
            year,
            month
        }
    );


    // =================================================
    // DATE
    // =================================================

    const normalizedDate =
        normalizeDate(date);


    if (!normalizedDate) {

        showToast(
            "Sana topilmadi."
        );

        return;
    }


    // =================================================
    // FUTURE DATE BLOCK
    // =================================================

    const today =
        getTodayDate();


    if (normalizedDate > today) {

        showToast(
            "Kelajakdagi sana uchun davomat kiritib bo‘lmaydi."
        );

        return;
    }


    // =================================================
    // EXISTING DAILY
    // =================================================

    let existing =
        daily || null;


    // =================================================
    // GET FULL DAILY
    // =================================================

    if (
        existing &&
        existing.id
    ) {

        try {

            const response =
                await api(
                    `/api/daily/${existing.id}`
                );


            if (response) {

                // GET /api/daily/{id} wraps the record as { daily: {...} }
                existing =
                    response.daily || response;
            }


        } catch (error) {

            console.warn(
                "Full daily olishda xatolik.",
                error
            );

            // Listdagi daily ishlatiladi.
        }
    }


    // =================================================
    // REMOVE OLD EDIT MODAL
    // =================================================

    removeModal(
        EDIT_MODAL_ID
    );


    // =================================================
    // EXISTING CHECK
    // =================================================

    const hasExisting =
        !!(
            existing &&
            existing.id
        );


    const present =
        hasExisting
            ? isPresentValue(existing)
            : null;


    // =================================================
    // CHILD NAME
    // =================================================

    const childName =
        `${child.firstName || ""} ${child.lastName || ""}`
            .trim() ||
        "Noma'lum bola";


    // =================================================
    // CREATE MODAL
    // =================================================

    const modal =
        document.createElement("div");


    modal.id =
        EDIT_MODAL_ID;


    modal.className =
        "daily-edit-modal open";


    modal.innerHTML = `

        <div
            class="daily-edit-backdrop"
            data-edit-close
        ></div>


        <div
            class="daily-edit-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dailyEditTitle"
        >

            <div class="daily-edit-header">

                <div>

                    <span class="daily-edit-label">
                        DAVOMAT
                    </span>

                    <h3 id="dailyEditTitle">
                        ${escapeHtml(
        formatUzbekDate(normalizedDate)
    )}
                    </h3>

                    <p>
                        ${escapeHtml(childName)}
                    </p>

                </div>


                <button
                    type="button"
                    class="daily-edit-close"
                    id="dailyEditCloseBtn"
                    aria-label="Yopish"
                >
                    ×
                </button>

            </div>


            <div class="daily-edit-body">

                ${
        hasExisting

            ? `

                            <div class="daily-detail-info">

                                <div class="
                                    daily-detail-status
                                    ${
                present
                    ? "present"
                    : "absent"
            }
                                ">

                                    <span class="option-icon">
                                        ${
                present
                    ? "✓"
                    : "✕"
            }
                                    </span>


                                    <div>

                                        <strong>
                                            ${
                present
                    ? "Keldi"
                    : "Kelmagan"
            }
                                        </strong>


                                        <small>
                                            ${escapeHtml(
                formatUzbekDate(
                    normalizedDate
                )
            )}
                                        </small>

                                    </div>

                                </div>

                            </div>

                        `

            : `

                            <div class="daily-edit-question">
                                Bola keldimi?
                            </div>

                        `
    }


                <div class="daily-attendance-options">

                    <button
                        type="button"
                        class="
                            daily-attendance-option
                            present
                            ${
        present === true
            ? "selected"
            : ""
    }
                        "
                        data-present="true"
                    >

                        <span class="option-icon">
                            ✓
                        </span>


                        <span>

                            <strong>
                                Keldi
                            </strong>


                            <small>
                                Bola guruhda bo‘ldi
                            </small>

                        </span>

                    </button>


                    <button
                        type="button"
                        class="
                            daily-attendance-option
                            absent
                            ${
        present === false
            ? "selected"
            : ""
    }
                        "
                        data-present="false"
                    >

                        <span class="option-icon">
                            ✕
                        </span>


                        <span>

                            <strong>
                                Kelmagan
                            </strong>


                            <small>
                                Bola guruhda bo‘lmadi
                            </small>

                        </span>

                    </button>

                </div>


                <div
                    class="daily-edit-error"
                    id="dailyEditError"
                ></div>

            </div>


            <div class="daily-edit-footer">

                ${
        hasExisting

            ? `

                            <button
                                type="button"
                                class="daily-delete-btn"
                                id="dailyDeleteBtn"
                            >
                                🗑 O‘chirish
                            </button>

                        `

            : `

                            <div></div>

                        `
    }


                <div class="daily-edit-actions">

                    <button
                        type="button"
                        class="daily-cancel-btn"
                        id="dailyEditCancelBtn"
                    >
                        Bekor qilish
                    </button>


                    <button
                        type="button"
                        class="daily-save-btn"
                        id="dailySaveBtn"
                        disabled
                    >
                        ${
        hasExisting
            ? "Yangilash"
            : "Saqlash"
    }
                    </button>

                </div>

            </div>

        </div>
    `;


    // =================================================
    // APPEND
    // =================================================

    document.body.appendChild(
        modal
    );


    // CSS `.open` bo‘lsa darhol ko‘rinadi.
    modal.classList.add(
        "open"
    );


    document.body.classList.add(
        "daily-modal-open"
    );


    // =================================================
    // CLOSE FUNCTION
    // =================================================

    const closeEdit =
        () => {

            closeDailyEdit();
        };


    // =================================================
    // CLOSE BUTTON
    // =================================================

    const closeButton =
        modal.querySelector(
            "#dailyEditCloseBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEdit
        );
    }


    // =================================================
    // CANCEL BUTTON
    // =================================================

    const cancelButton =
        modal.querySelector(
            "#dailyEditCancelBtn"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeEdit
        );
    }


    // =================================================
    // BACKDROP
    // =================================================

    const backdrop =
        modal.querySelector(
            "[data-edit-close]"
        );


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeEdit
        );
    }


    // =================================================
    // SELECT PRESENT / ABSENT
    // =================================================

    let selectedPresent =
        present;


    const optionButtons =
        modal.querySelectorAll(
            ".daily-attendance-option"
        );


    const saveButton =
        modal.querySelector(
            "#dailySaveBtn"
        );


    optionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedPresent =
                        button.dataset.present === "true";


                    optionButtons.forEach(
                        item => {

                            item.classList.remove(
                                "selected"
                            );
                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    if (saveButton) {

                        saveButton.disabled =
                            false;
                    }
                }
            );
        }
    );


    // =================================================
    // SAVE / UPDATE
    // =================================================

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            async () => {

                // =====================================
                // VALIDATION
                // =====================================

                if (
                    selectedPresent === null ||
                    selectedPresent === undefined
                ) {

                    showToast(
                        "Davomat holatini tanlang."
                    );

                    return;
                }


                saveButton.disabled =
                    true;


                saveButton.textContent =
                    hasExisting
                        ? "Yangilanmoqda..."
                        : "Saqlanmoqda...";


                try {

                    // =================================
                    // UPDATE EXISTING
                    // =================================

                    if (hasExisting) {

                        if (!existing.id) {

                            throw new Error(
                                "Daily ID topilmadi."
                            );
                        }


                        console.log(
                            "UPDATE DAILY:",
                            {
                                id: existing.id,
                                present: selectedPresent
                            }
                        );


                        await api(
                            "/api/daily",
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        id:
                                        existing.id,

                                        present:
                                        selectedPresent
                                    })
                            }
                        );


                        showToast(
                            "Davomat yangilandi."
                        );

                    }


                        // =================================
                        // CREATE NEW
                    // =================================

                    else {

                        console.log(
                            "CREATE DAILY:",
                            {
                                id: child.id,
                                date: normalizedDate,
                                isPresent: selectedPresent
                            }
                        );


                        await api(
                            "/api/daily",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify([
                                        {
                                            id:
                                            child.id,

                                            date:
                                            normalizedDate,

                                            isPresent:
                                            selectedPresent
                                        }
                                    ])
                            }
                        );


                        showToast(
                            "Davomat saqlandi."
                        );
                    }


                    // =================================
                    // CLOSE EDIT
                    // =================================

                    closeDailyEdit();


                    // =================================
                    // REOPEN HISTORY
                    // =================================

                    await openChildDaily(
                        child,
                        state,
                        year,
                        month
                    );


                } catch (error) {

                    console.error(
                        "Daily save/update error:",
                        error
                    );


                    saveButton.disabled =
                        false;


                    saveButton.textContent =
                        hasExisting
                            ? "Yangilash"
                            : "Saqlash";


                    showToast(
                        hasExisting
                            ? "Davomatni yangilashda xatolik."
                            : "Davomatni saqlashda xatolik."
                    );
                }
            }
        );
    }


    // =================================================
    // DELETE
    // =================================================

    const deleteButton =
        modal.querySelector(
            "#dailyDeleteBtn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            async () => {

                if (
                    !existing ||
                    !existing.id
                ) {

                    showToast(
                        "Davomat ID topilmadi."
                    );

                    return;
                }


                const confirmed =
                    confirm(
                        `${
                            formatUzbekDate(
                                normalizedDate
                            )
                        } kunidagi davomatni o‘chirmoqchimisiz?`
                    );


                if (!confirmed) {
                    return;
                }


                deleteButton.disabled =
                    true;


                deleteButton.textContent =
                    "O‘chirilmoqda...";


                try {

                    console.log(
                        "DELETE DAILY:",
                        existing.id
                    );


                    await api(
                        `/api/daily/${existing.id}`,
                        {
                            method: "DELETE"
                        }
                    );


                    showToast(
                        "Davomat o‘chirildi."
                    );


                    // ================================
                    // CLOSE EDIT
                    // ================================

                    closeDailyEdit();


                    // ================================
                    // REOPEN HISTORY
                    // ================================

                    await openChildDaily(
                        child,
                        state,
                        year,
                        month
                    );


                } catch (error) {

                    console.error(
                        "Delete daily error:",
                        error
                    );


                    deleteButton.disabled =
                        false;


                    deleteButton.textContent =
                        "🗑 O‘chirish";


                    showToast(
                        "Davomatni o‘chirishda xatolik."
                    );
                }
            }
        );
    }


    // =================================================
    // ESC
    // =================================================

    modal._escapeHandler =
        event => {

            if (event.key !== "Escape") {
                return;
            }


            closeDailyEdit();
        };


    document.addEventListener(
        "keydown",
        modal._escapeHandler
    );
}


// =====================================================
// RENDER CHILD DAILY
// =====================================================

function renderChildDaily(
    child,
    dailies,
    year,
    month,
    state
) {

    // =================================================
    // REMOVE OLD HISTORY
    // =================================================

    removeModal(
        HISTORY_MODAL_ID
    );


    // =================================================
    // REMOVE OLD EDIT
    // =================================================

    removeModal(
        EDIT_MODAL_ID
    );


    // =================================================
    // NORMALIZE
    // =================================================

    if (!Array.isArray(dailies)) {
        dailies = [];
    }


    // =================================================
    // DAILY MAP
    // =================================================

    const dailyMap =
        new Map();


    dailies.forEach(
        daily => {

            if (!daily) {
                return;
            }


            const date =
                normalizeDate(
                    daily.date
                );


            if (!date) {
                return;
            }


            dailyMap.set(
                date,
                daily
            );
        }
    );


    // =================================================
    // TODAY
    // =================================================

    const todayDate =
        getTodayDate();


    const now =
        new Date();


    const todayYear =
        now.getFullYear();


    const todayMonth =
        now.getMonth() + 1;


    // =================================================
    // MONTH NAMES
    // =================================================

    const monthNames =
        getMonthNames();


    // =================================================
    // DAYS IN MONTH
    // =================================================

    const daysInMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    // =================================================
    // STATISTICS
    // =================================================

    let presentCount =
        0;


    let absentCount =
        0;


    dailies.forEach(
        daily => {

            if (
                isPresentValue(daily)
            ) {

                presentCount++;

            } else {

                absentCount++;
            }
        }
    );


    const recordedCount =
        dailies.length;


    // =================================================
    // PREVIOUS MONTH
    // =================================================

    let previousYear =
        year;


    let previousMonth =
        month - 1;


    if (previousMonth === 0) {

        previousMonth = 12;

        previousYear--;
    }


    // =================================================
    // NEXT MONTH
    // =================================================

    let nextYear =
        year;


    let nextMonth =
        month + 1;


    if (nextMonth === 13) {

        nextMonth = 1;

        nextYear++;
    }


    // =================================================
    // CURRENT MONTH
    // =================================================

    const isCurrentMonth =
        year === todayYear &&
        month === todayMonth;


    // =================================================
    // ROWS
    // =================================================

    let rows =
        "";


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            [
                year,

                String(month)
                    .padStart(2, "0"),

                String(day)
                    .padStart(2, "0")

            ].join("-");


        const daily =
            dailyMap.get(date);


        const isFuture =
            date > todayDate;


        // =============================================
        // STATUS
        // =============================================

        let statusType;
        let statusText;
        let statusIcon;


        if (daily) {

            const present =
                isPresentValue(daily);


            statusType =
                present
                    ? "present"
                    : "absent";


            statusText =
                present
                    ? "Keldi"
                    : "Kelmagan";


            statusIcon =
                present
                    ? "✓"
                    : "✕";

        } else if (isFuture) {

            statusType =
                "future";


            statusText =
                "Hali kelmagan";


            statusIcon =
                "—";

        } else {

            statusType =
                "not-recorded";


            statusText =
                "Belgilanmagan";


            statusIcon =
                "—";
        }


        // =============================================
        // FUTURE DISABLED
        // =============================================

        const disabled =
            isFuture;


        rows += `

            <button
                type="button"

                class="
                    daily-history-row
                    ${statusType}
                    ${
            disabled
                ? "disabled"
                : "clickable"
        }
                "

                data-date="${date}"

                ${
            daily
                ? `data-daily-id="${daily.id}"`
                : ""
        }

                ${
            disabled
                ? "disabled"
                : ""
        }
            >

                <div class="daily-history-date">

                    <strong>
                        ${day}
                    </strong>


                    <div>

                        <span>
                            ${monthNames[month - 1]}
                        </span>


                        <small>
                            ${year}
                        </small>

                    </div>

                </div>


                <div class="daily-history-status">

                    <span class="daily-status-dot"></span>


                    <span class="daily-status-text">

                        <span class="daily-status-icon">
                            ${statusIcon}
                        </span>

                        ${statusText}

                    </span>


                    ${
            daily

                ? `

                                <span
                                    class="daily-open-icon"
                                    title="Davomatni tahrirlash"
                                >
                                    ›
                                </span>

                            `

                : !isFuture

                    ? `

                                    <span
                                        class="daily-open-icon"
                                        title="Davomat kiritish"
                                    >
                                        ›
                                    </span>

                                `

                    : ""
        }

                </div>

            </button>
        `;
    }


    // =================================================
    // CHILD NAME
    // =================================================

    const childName =
        `${child.firstName || ""} ${child.lastName || ""}`
            .trim() ||
        "Noma'lum bola";


    // =================================================
    // CREATE HISTORY MODAL
    // =================================================

    const modal =
        document.createElement("div");


    modal.id =
        HISTORY_MODAL_ID;


    modal.className =
        "daily-history-modal open";


    modal.innerHTML = `

        <div
            class="daily-history-backdrop"
            data-history-close
        ></div>


        <div
            class="daily-history-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dailyHistoryTitle"
        >

            <!-- HEADER -->

            <div class="daily-history-header">

                <div class="daily-history-title">

                    <div class="daily-history-icon">
                        📅
                    </div>


                    <div>

                        <span class="daily-history-label">
                            DAVOMAT
                        </span>


                        <h2 id="dailyHistoryTitle">
                            Davomat tarixi
                        </h2>


                        <p>
                            ${escapeHtml(childName)}
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    class="daily-history-close"
                    id="dailyHistoryCloseBtn"
                    aria-label="Yopish"
                >
                    ×
                </button>

            </div>


            <!-- MONTH NAVIGATION -->

            <div class="daily-month-navigation">

                <button
                    type="button"
                    class="daily-month-btn"
                    id="dailyPrevMonthBtn"
                    title="Oldingi oy"
                >
                    ‹
                </button>


                <div class="daily-month-current">

                    <strong>
                        ${monthNames[month - 1]}
                    </strong>


                    <span>
                        ${year}
                    </span>

                </div>


                <button
                    type="button"
                    class="daily-month-btn"
                    id="dailyNextMonthBtn"
                    title="Keyingi oy"

                    ${
        isCurrentMonth
            ? "disabled"
            : ""
    }
                >
                    ›
                </button>

            </div>


            <!-- STATISTICS -->

            <div class="daily-statistics">

                <div class="daily-stat-card present">

                    <div class="daily-stat-icon">
                        ✓
                    </div>


                    <div>

                        <strong>
                            ${presentCount}
                        </strong>


                        <span>
                            Kelgan
                        </span>

                    </div>

                </div>


                <div class="daily-stat-card absent">

                    <div class="daily-stat-icon">
                        ✕
                    </div>


                    <div>

                        <strong>
                            ${absentCount}
                        </strong>


                        <span>
                            Kelmagan
                        </span>

                    </div>

                </div>


                <div class="daily-stat-card recorded">

                    <div class="daily-stat-icon">
                        #
                    </div>


                    <div>

                        <strong>
                            ${recordedCount}
                        </strong>


                        <span>
                            Jami yozuv
                        </span>

                    </div>

                </div>

            </div>


            <!-- DAYS -->

            <div class="daily-history-month">

                <div class="daily-history-month-title">

                    <div>

                        <strong>
                            ${monthNames[month - 1]}
                            ${year}
                        </strong>


                        <span>
                            ${daysInMonth} kun
                        </span>

                    </div>

                </div>


                <div class="daily-history-list">

                    ${
        rows ||
        `
                            <div class="daily-empty">
                                Davomat yozuvlari yo‘q.
                            </div>
                        `
    }

                </div>

            </div>

        </div>
    `;


    // =================================================
    // APPEND TO BODY
    // =================================================

    document.body.appendChild(
        modal
    );


    // =================================================
    // OPEN
    // =================================================

    modal.classList.add(
        "open"
    );


    document.body.classList.add(
        "daily-modal-open"
    );


    // =================================================
    // CLOSE BUTTON
    // =================================================

    const closeButton =
        modal.querySelector(
            "#dailyHistoryCloseBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDailyHistory
        );
    }


    // =================================================
    // BACKDROP
    // =================================================

    const backdrop =
        modal.querySelector(
            "[data-history-close]"
        );


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeDailyHistory
        );
    }


    // =================================================
    // DAY CLICK
    // =================================================

    const list =
        modal.querySelector(
            ".daily-history-list"
        );


    if (list) {

        list.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        ".daily-history-row"
                    );


                if (!button) {
                    return;
                }


                if (
                    button.disabled ||
                    button.classList.contains("disabled")
                ) {

                    return;
                }


                const date =
                    button.dataset.date;


                const dailyId =
                    button.dataset.dailyId;


                const daily =
                    dailyId
                        ? dailyMap.get(date)
                        : null;


                console.log(
                    "DAILY CLICK:",
                    {
                        date,
                        dailyId,
                        daily
                    }
                );


                await openDailyDetail(
                    child,
                    daily,
                    date,
                    state,
                    year,
                    month
                );
            }
        );
    }


    // =================================================
    // PREVIOUS MONTH
    // =================================================

    const previousButton =
        modal.querySelector(
            "#dailyPrevMonthBtn"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            async () => {

                await openChildDaily(
                    child,
                    state,
                    previousYear,
                    previousMonth
                );
            }
        );
    }


    // =================================================
    // NEXT MONTH
    // =================================================

    const nextButton =
        modal.querySelector(
            "#dailyNextMonthBtn"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            async () => {

                if (isCurrentMonth) {
                    return;
                }


                await openChildDaily(
                    child,
                    state,
                    nextYear,
                    nextMonth
                );
            }
        );
    }


    // =================================================
    // ESC
    // =================================================

    modal._escapeHandler =
        event => {

            if (event.key !== "Escape") {
                return;
            }


            const editModal =
                document.getElementById(
                    EDIT_MODAL_ID
                );


            if (editModal) {

                closeDailyEdit();

            } else {

                closeDailyHistory();
            }
        };


    document.addEventListener(
        "keydown",
        modal._escapeHandler
    );
}