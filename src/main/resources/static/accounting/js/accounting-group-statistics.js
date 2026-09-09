// =========================================================
// BOXCHA — ACCOUNTING GROUP STATISTICS
// =========================================================

import {
    $,
    getCurrentMonth
} from "./accounting-common.js";

import {
    getGroupStatistics
} from "./accounting-api.js";


// =========================================================
// CONFIG
// =========================================================

const GROUPS_API = "/api/group";


// =========================================================
// LOAD PAGE
// =========================================================

export async function loadGroupStatisticsPage() {

    const content = $("#accountingContent");

    if (!content) {
        console.error(
            "accountingContent not found"
        );
        return;
    }

    const month =
        $("#accountingMonth")?.value ||
        getCurrentMonth();

    // ---------------------------------------------
    // LOADING
    // ---------------------------------------------

    content.innerHTML = `
        <div class="group-statistics-loading">
            <div class="group-statistics-spinner"></div>

            <div>
                <strong>Guruhlar statistikasi yuklanmoqda...</strong>
                <span>Ma’lumotlar tayyorlanmoqda</span>
            </div>
        </div>
    `;


    try {

        // -----------------------------------------
        // GET GROUPS
        // -----------------------------------------

        const groups =
            await getGroups();


        if (!Array.isArray(groups)) {

            throw new Error(
                "Guruhlar ma’lumoti noto‘g‘ri formatda"
            );
        }


        // -----------------------------------------
        // GET STATISTICS
        // -----------------------------------------

        const statistics =
            await loadAllGroupStatistics(
                groups,
                month
            );


        // -----------------------------------------
        // RENDER
        // -----------------------------------------

        renderGroupStatistics(
            statistics,
            month
        );

    } catch (error) {

        console.error(
            "Group statistics error:",
            error
        );

        renderGroupStatisticsError(
            error
        );
    }
}


// =========================================================
// GET GROUPS
// =========================================================

async function getGroups() {

    const token =
        getAccountingToken();


    const headers = {};

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }


    const response =
        await fetch(
            GROUPS_API,
            {
                method: "GET",
                headers
            }
        );


    if (response.status === 401) {

        throw new Error(
            "AUTH_REQUIRED"
        );
    }


    if (response.status === 403) {

        throw new Error(
            "ACCESS_DENIED"
        );
    }


    if (!response.ok) {

        throw new Error(
            `Guruhlarni olishda xatolik: ${response.status}`
        );
    }


    return await response.json();
}


// =========================================================
// TOKEN
// =========================================================

function getAccountingToken() {

    const keys = [
        "accessToken",
        "token",
        "access_token"
    ];


    for (const key of keys) {

        const value =
            localStorage.getItem(key);


        if (
            value &&
            value.trim()
        ) {

            return value
                .replace(/^Bearer\s+/i, "")
                .trim();
        }
    }


    return null;
}


// =========================================================
// LOAD ALL GROUP STATISTICS
// =========================================================

async function loadAllGroupStatistics(
    groups,
    month
) {

    if (!groups.length) {
        return [];
    }


    const requests =
        groups.map(
            async group => {

                try {

                    const statistics =
                        await getGroupStatistics(
                            group.id,
                            month
                        );


                    return {
                        ...statistics,
                        _loaded: true
                    };

                } catch (error) {

                    console.error(
                        `Group statistics failed: ${group.name}`,
                        error
                    );


                    return {
                        groupId: group.id,
                        groupName:
                            group.name ||
                            "Noma’lum guruh",

                        teacherId:
                            group.teacherId ||
                            null,

                        teacherFirstname: "",
                        teacherLastname: "",

                        month,

                        monthlyFee: 300000,

                        totalChildren: 0,
                        activeChildren: 0,
                        inactiveChildren: 0,

                        paidCount: 0,
                        partialCount: 0,
                        unpaidCount: 0,

                        expectedAmount: 0,
                        receivedAmount: 0,
                        debtAmount: 0,

                        _loaded: false
                    };
                }
            }
        );


    return await Promise.all(
        requests
    );
}


// =========================================================
// RENDER
// =========================================================

function renderGroupStatistics(
    statistics,
    month
) {

    const content =
        $("#accountingContent");


    if (!content) {
        return;
    }


    if (!statistics.length) {

        content.innerHTML = `
            <div class="group-statistics-empty">

                <div class="group-statistics-empty-icon">
                    📊
                </div>

                <h3>Guruhlar topilmadi</h3>

                <p>
                    Hozircha statistikani ko‘rsatish uchun
                    guruhlar mavjud emas.
                </p>

            </div>
        `;

        return;
    }


    // ---------------------------------------------
    // TOTALS
    // ---------------------------------------------

    const totals =
        calculateTotals(
            statistics
        );


    const monthLabel =
        formatMonth(month);


    content.innerHTML = `

        <div class="group-statistics-page">

            <!-- =====================================
                 HEADER
            ====================================== -->

            <div class="group-statistics-header">

                <div>

                    <div class="group-statistics-title-row">

                        <div class="group-statistics-title-icon">
                            📊
                        </div>

                        <div>

                            <h2>
                                Guruhlar statistikasi
                            </h2>

                            <p>
                                ${monthLabel}
                                oyi bo‘yicha moliyaviy holat
                            </p>

                        </div>

                    </div>

                </div>


                <div class="group-statistics-month">

                    <span>Tanlangan oy</span>

                    <strong>
                        ${monthLabel}
                    </strong>

                </div>

            </div>


            <!-- =====================================
                 SUMMARY
            ====================================== -->

            <div class="group-statistics-summary">

                ${summaryCard(
        "Guruhlar",
        totals.groups,
        "🏫",
        ""
    )}

                ${summaryCard(
        "Faol bolalar",
        totals.activeChildren,
        "👦",
        ""
    )}

                ${summaryCard(
        "Kutilgan",
        formatMoney(
            totals.expectedAmount
        ),
        "🎯",
        "money"
    )}

                ${summaryCard(
        "Qabul qilingan",
        formatMoney(
            totals.receivedAmount
        ),
        "💰",
        "money"
    )}

                ${summaryCard(
        "Qarz",
        formatMoney(
            totals.debtAmount
        ),
        "⚠️",
        "danger"
    )}

                ${summaryCard(
        "To‘lov foizi",
        `${totals.paymentPercent}%`,
        "📈",
        "percent"
    )}

            </div>


            <!-- =====================================
                 GROUP LIST
            ====================================== -->

            <div class="group-statistics-section">

                <div class="group-statistics-section-header">

                    <div>

                        <h3>
                            Guruhlar bo‘yicha
                        </h3>

                        <p>
                            Har bir guruhning oylik
                            to‘lov holati
                        </p>

                    </div>

                    <div class="group-statistics-count">
                        ${statistics.length} ta guruh
                    </div>

                </div>


                <div class="group-statistics-grid">

                    ${statistics
        .map(
            group =>
                renderGroupCard(
                    group
                )
        )
        .join("")
    }

                </div>

            </div>

        </div>
    `;
}


// =========================================================
// SUMMARY CARD
// =========================================================

function summaryCard(
    label,
    value,
    icon,
    type
) {

    return `
        <div class="
            group-statistics-summary-card
            ${type ? `is-${type}` : ""}
        ">

            <div class="group-statistics-summary-icon">
                ${icon}
            </div>

            <div class="group-statistics-summary-info">

                <span>
                    ${label}
                </span>

                <strong>
                    ${value}
                </strong>

            </div>

        </div>
    `;
}


// =========================================================
// GROUP CARD
// =========================================================

function renderGroupCard(
    group
) {

    const teacherName =
        [
            group.teacherFirstname,
            group.teacherLastname
        ]
            .filter(Boolean)
            .join(" ")
        || "Ustoz biriktirilmagan";


    const expected =
        Number(
            group.expectedAmount || 0
        );


    const received =
        Number(
            group.receivedAmount || 0
        );


    const debt =
        Number(
            group.debtAmount || 0
        );


    const percentage =
        expected > 0
            ? Math.min(
                100,
                Math.round(
                    (received / expected) * 100
                )
            )
            : 0;


    const statusClass =
        group._loaded
            ? ""
            : "is-error";


    return `
        <article class="
            group-statistics-card
            ${statusClass}
        ">

            <!-- CARD HEADER -->

            <div class="group-statistics-card-header">

                <div class="group-statistics-group-icon">
                    🏫
                </div>

                <div class="group-statistics-group-info">

                    <h4>
                        ${escapeHtml(
        group.groupName ||
        "Noma’lum guruh"
    )}
                    </h4>

                    <span>
                        👨‍🏫
                        ${escapeHtml(
        teacherName
    )}
                    </span>

                </div>

            </div>


            <!-- CHILDREN -->

            <div class="group-statistics-children">

                <div class="group-statistics-child-box">

                    <span>
                        Jami
                    </span>

                    <strong>
                        ${group.totalChildren || 0}
                    </strong>

                </div>


                <div class="
                    group-statistics-child-box
                    is-active
                ">

                    <span>
                        Faol
                    </span>

                    <strong>
                        ${group.activeChildren || 0}
                    </strong>

                </div>


                <div class="
                    group-statistics-child-box
                    is-inactive
                ">

                    <span>
                        Faol emas
                    </span>

                    <strong>
                        ${group.inactiveChildren || 0}
                    </strong>

                </div>

            </div>


            <!-- MONEY -->

            <div class="group-statistics-money">

                <div>

                    <span>
                        Kutilgan summa
                    </span>

                    <strong>
                        ${formatMoney(
        expected
    )}
                    </strong>

                </div>


                <div>

                    <span>
                        Qabul qilingan
                    </span>

                    <strong class="received">
                        ${formatMoney(
        received
    )}
                    </strong>

                </div>


                <div>

                    <span>
                        Qarz
                    </span>

                    <strong class="debt">
                        ${formatMoney(
        debt
    )}
                    </strong>

                </div>

            </div>


            <!-- PROGRESS -->

            <div class="group-statistics-progress">

                <div class="group-statistics-progress-top">

                    <span>
                        To‘lov holati
                    </span>

                    <strong>
                        ${percentage}%
                    </strong>

                </div>


                <div class="group-statistics-progress-track">

                    <div
                        class="group-statistics-progress-bar"
                        style="width:${percentage}%"
                    ></div>

                </div>

            </div>


            <!-- STATUS -->

            <div class="group-statistics-statuses">

                <div class="status paid">

                    <span class="status-dot"></span>

                    <span>
                        To‘langan
                    </span>

                    <strong>
                        ${group.paidCount || 0}
                    </strong>

                </div>


                <div class="status partial">

                    <span class="status-dot"></span>

                    <span>
                        Qisman
                    </span>

                    <strong>
                        ${group.partialCount || 0}
                    </strong>

                </div>


                <div class="status unpaid">

                    <span class="status-dot"></span>

                    <span>
                        To‘lanmagan
                    </span>

                    <strong>
                        ${group.unpaidCount || 0}
                    </strong>

                </div>

            </div>


            ${
        !group._loaded
            ? `
                        <div class="group-statistics-error">

                            ⚠️
                            Statistikani yuklashda
                            xatolik yuz berdi

                        </div>
                    `
            : ""
    }

        </article>
    `;
}


// =========================================================
// TOTAL CALCULATION
// =========================================================

function calculateTotals(
    statistics
) {

    const result = {

        groups: statistics.length,

        totalChildren: 0,
        activeChildren: 0,
        inactiveChildren: 0,

        paidCount: 0,
        partialCount: 0,
        unpaidCount: 0,

        expectedAmount: 0,
        receivedAmount: 0,
        debtAmount: 0

    };


    statistics.forEach(
        group => {

            result.totalChildren +=
                Number(
                    group.totalChildren || 0
                );


            result.activeChildren +=
                Number(
                    group.activeChildren || 0
                );


            result.inactiveChildren +=
                Number(
                    group.inactiveChildren || 0
                );


            result.paidCount +=
                Number(
                    group.paidCount || 0
                );


            result.partialCount +=
                Number(
                    group.partialCount || 0
                );


            result.unpaidCount +=
                Number(
                    group.unpaidCount || 0
                );


            result.expectedAmount +=
                Number(
                    group.expectedAmount || 0
                );


            result.receivedAmount +=
                Number(
                    group.receivedAmount || 0
                );


            result.debtAmount +=
                Number(
                    group.debtAmount || 0
                );
        }
    );


    result.paymentPercent =
        result.expectedAmount > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        result.receivedAmount /
                        result.expectedAmount
                    ) * 100
                )
            )
            : 0;


    return result;
}


// =========================================================
// ERROR
// =========================================================

function renderGroupStatisticsError(
    error
) {

    const content =
        $("#accountingContent");


    if (!content) {
        return;
    }


    let message =
        "Guruhlar statistikasini yuklashda xatolik yuz berdi.";


    if (
        error?.message ===
        "AUTH_REQUIRED"
    ) {

        message =
            "Sessiya tugagan. Iltimos, qaytadan tizimga kiring.";

    } else if (
        error?.message ===
        "ACCESS_DENIED"
    ) {

        message =
            "Bu bo‘limdan foydalanish uchun ruxsat yo‘q.";
    }


    content.innerHTML = `

        <div class="group-statistics-error-page">

            <div class="group-statistics-error-icon">
                ⚠️
            </div>

            <h3>
                Ma’lumotlarni yuklab bo‘lmadi
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

            <button
                type="button"
                class="group-statistics-retry"
                id="groupStatisticsRetryBtn"
            >
                ↻ Qayta urinish
            </button>

        </div>
    `;


    const retryButton =
        $("#groupStatisticsRetryBtn");


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                loadGroupStatisticsPage();

            }
        );
    }
}


// =========================================================
// FORMAT MONEY
// =========================================================

function formatMoney(
    amount
) {

    const number =
        Number(amount || 0);


    return (
        new Intl.NumberFormat(
            "uz-UZ"
        ).format(number)
        + " so‘m"
    );
}


// =========================================================
// FORMAT MONTH
// =========================================================

function formatMonth(
    month
) {

    if (!month) {
        return "";
    }


    const [year, monthNumber] =
        month.split("-");


    const names = [
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


    const index =
        Number(monthNumber) - 1;


    return `
        ${names[index] || monthNumber}
        ${year}
    `;
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}