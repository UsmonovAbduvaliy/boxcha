import { api } from "./api.js";

import {
    $,
    escapeHtml,
    showToast
} from "./utils.js";

import {
    openModal
} from "./modals.js";


// =====================================================
// ATTENDANCE CHILDREN
// =====================================================

export async function loadAttendanceChildren(state) {

    if (!state.children.length) {
        await state.loadChildren(true);
    }

    renderAttendanceOptions(state);
}


// =====================================================
// RENDER ATTENDANCE OPTIONS
// =====================================================

export function renderAttendanceOptions(state) {

    const select = $("#attendanceChild");

    if (!select) return;

    select.innerHTML =
        `<option value="">
            Bolani tanlang
        </option>` +

        state.children
            .filter(child => child.active)
            .map(child => `
                <option value="${child.id}">
                    ${escapeHtml(
                `${child.firstName || ""} ${child.lastName || ""}`.trim()
            )}
                </option>
            `)
            .join("");
}


// =====================================================
// SHOW ATTENDANCE
// =====================================================

export async function showAttendance(id) {

    try {

        const records =
            await api(`/api/daily/children/${id}`) || [];

        const result =
            $("#attendanceResult");

        if (!result) {
            return;
        }

        result.innerHTML =
            records.length

                ? records.map(record => {

                    const isPresent =
                        record.present === true ||
                        record.present === "true";

                    return `

                        <div class="attendance-row">

                            <span>
                                ${escapeHtml(
                        String(record.date || "—")
                    )}
                            </span>

                            <b class="${
                        isPresent
                            ? "present"
                            : "absent"
                    }">

                                ${
                        isPresent
                            ? "Keldi"
                            : "Kelmagan"
                    }

                            </b>

                        </div>

                    `;

                }).join("")

                : `

                    <div class="empty-state">

                        Bu bola uchun davomat
                        yozuvlari yo‘q.

                    </div>

                `;

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

                    Davomatni olishda
                    xatolik.

                </div>

            `;

        }

    }

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

    try {

        const dailies =
            await api(
                `/api/daily/children/${child.id}?year=${year}&month=${month}`
            ) || [];

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
    // MODAL
    // =================================================

    const modal =
        $("#viewChildModal");

    if (!modal) {

        console.error(
            "viewChildModal topilmadi"
        );

        return;

    }


    // =================================================
    // PROFILE CONTENT
    // =================================================

    const profile =
        $("#viewChildProfileContent");

    if (!profile) {

        console.error(
            "viewChildProfileContent topilmadi"
        );

        return;

    }


    // =================================================
    // DAILY CONTENT
    // =================================================

    const dailyContent =
        $("#viewChildDailyContent");

    if (!dailyContent) {

        console.error(
            "viewChildDailyContent topilmadi"
        );

        return;

    }


    // =================================================
    // PROFILE YASHIRAMIZ
    // =================================================

    profile.style.display =
        "none";


    // =================================================
    // DAILY KO‘RSATAMIZ
    // =================================================

    dailyContent.style.display =
        "block";


    // =================================================
    // DAILY MAP
    // =================================================
    //
    // Backend:
    //
    // {
    //     id: 4,
    //     date: "2026-09-03",
    //     present: true,
    //     childrenId: 2
    // }
    //
    // =================================================

    const dailyMap =
        new Map(
            dailies.map(daily => [

                String(daily.date)
                    .substring(0, 10),

                daily.present

            ])
        );


    // =================================================
    // TODAY
    // =================================================

    const now =
        new Date();


    const todayDate = [

        now.getFullYear(),

        String(
            now.getMonth() + 1
        ).padStart(2, "0"),

        String(
            now.getDate()
        ).padStart(2, "0")

    ].join("-");


    const todayYear =
        now.getFullYear();


    const todayMonth =
        now.getMonth() + 1;


    // =================================================
    // MONTH NAMES
    // =================================================

    const monthNames = [

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

            const isPresent =
                daily.present === true ||
                daily.present === "true";


            if (isPresent) {

                presentCount++;

            }

            else if (
                daily.present === false ||
                daily.present === "false"
            ) {

                absentCount++;

            }

        }
    );


    const recordedCount =
        presentCount +
        absentCount;


    // =================================================
    // PREVIOUS MONTH
    // =================================================

    let previousYear =
        year;

    let previousMonth =
        month - 1;


    if (
        previousMonth === 0
    ) {

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


    if (
        nextMonth === 13
    ) {

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
    // DAYS HTML
    // =================================================

    let rows =
        "";


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        // =============================================
        // DATE
        // =============================================

        const date = [

            year,

            String(
                month
            ).padStart(2, "0"),

            String(
                day
            ).padStart(2, "0")

        ].join("-");


        // =============================================
        // DAILY VALUE
        // =============================================

        const value =
            dailyMap.get(date);


        // =============================================
        // STATUS
        // =============================================

        let rowClass =
            "";

        let statusText =
            "";

        let statusIcon =
            "";


        // =============================================
        // PRESENT
        // =============================================
        //
        // present = true
        //
        // Bugun bo‘lsa ham yashil chiqadi.
        //
        // =============================================

        if (
            value === true ||
            value === "true"
        ) {

            rowClass =
                "present";

            statusText =
                "Kelgan";

            statusIcon =
                "✓";

        }


            // =============================================
            // ABSENT
            // =============================================
            //
            // present = false
            //
            // Bugun bo‘lsa ham qizil chiqadi.
            //
        // =============================================

        else if (
            value === false ||
            value === "false"
        ) {

            rowClass =
                "absent";

            statusText =
                "Kelmagan";

            statusIcon =
                "✕";

        }


            // =============================================
            // TODAY WITHOUT RECORD
            // =============================================
            //
            // Bugun uchun hali daily yozilmagan.
            //
        // =============================================

        else if (
            date === todayDate
        ) {

            rowClass =
                "today";

            statusText =
                "Bugun";

            statusIcon =
                "●";

        }


            // =============================================
            // PAST WITHOUT RECORD
        // =============================================

        else if (
            date < todayDate
        ) {

            rowClass =
                "not-recorded";

            statusText =
                "Belgilanmagan";

            statusIcon =
                "—";

        }


            // =============================================
            // FUTURE
        // =============================================

        else {

            rowClass =
                "future";

            statusText =
                "—";

            statusIcon =
                "—";

        }


        // =============================================
        // ROW HTML
        // =============================================

        rows += `

            <div
                class="daily-history-row ${rowClass}"
            >

                <div
                    class="daily-history-date"
                >

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


                <div
                    class="daily-history-status"
                >

                    <span
                        class="daily-status-dot"
                    ></span>


                    <span>

                        ${statusIcon}

                        ${statusText}

                    </span>

                </div>

            </div>

        `;

    }


    // =================================================
    // CHILD NAME
    // =================================================

    const childName =
        `${child.firstName || ""} ${child.lastName || ""}`
            .trim();


    // =================================================
    // DAILY CONTENT
    // =================================================

    dailyContent.innerHTML = `

        <div class="daily-history-header">

            <div class="daily-history-title">

                <div class="daily-history-icon">
                    📅
                </div>


                <div>

                    <h2>
                        Davomat tarixi
                    </h2>


                    <p>
                        ${escapeHtml(childName)}
                    </p>

                </div>

            </div>


            <button
                type="button"
                class="secondary-btn"
                id="dailyHistoryBackBtn"
            >
                ← Bola ma'lumotlari
            </button>

        </div>


        <!-- =========================================
             MONTH NAVIGATION
        ========================================== -->

        <div class="daily-month-navigation">

            <button
                type="button"
                class="daily-month-btn"
                id="dailyPrevMonthBtn"
            >
                ‹
            </button>


            <div
                class="daily-month-current"
            >

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
                ${isCurrentMonth ? "disabled" : ""}
            >
                ›
            </button>

        </div>


        <!-- =========================================
             STATISTICS
        ========================================== -->

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


        <!-- =========================================
             DAYS
        ========================================== -->

        <div class="daily-history-month">

            <div
                class="daily-history-month-title"
            >

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


            <div
                class="daily-history-list"
            >

                ${rows}

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        dailyContent.querySelector(
            "#dailyHistoryBackBtn"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            async () => {

                console.log(
                    "Bola ma'lumotlariga qaytish"
                );


                // -----------------------------------------
                // DAILY YASHIRISH
                // -----------------------------------------

                dailyContent.style.display =
                    "none";


                // -----------------------------------------
                // PROFILE KO‘RSATISH
                // -----------------------------------------

                profile.style.display =
                    "block";


                // -----------------------------------------
                // CHILD PROFILE
                // -----------------------------------------

                try {

                    const {
                        viewChild
                    } = await import(
                        "./children.js"
                        );


                    await viewChild(
                        child.id,
                        state
                    );

                } catch (error) {

                    console.error(
                        "View child error:",
                        error
                    );

                    showToast(
                        "Bola ma'lumotlarini olishda xatolik."
                    );

                }

            }
        );

    } else {

        console.error(
            "dailyHistoryBackBtn topilmadi"
        );

    }


    // =====================================================
    // PREVIOUS MONTH
    // =====================================================

    const previousButton =
        dailyContent.querySelector(
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


    // =====================================================
    // NEXT MONTH
    // =====================================================

    const nextButton =
        dailyContent.querySelector(
            "#dailyNextMonthBtn"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            async () => {

                if (
                    isCurrentMonth
                ) {

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


    // =====================================================
    // OPEN MODAL
    // =====================================================

    openModal(
        "viewChildModal"
    );

}