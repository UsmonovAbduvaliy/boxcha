// =========================================================
// BOXCHA — ACCOUNTING DASHBOARD
// =========================================================

import {
    getAccountingDashboard
} from "./accounting-api.js";

import {
    $,
    formatMoney,
    formatNumber,
    formatMonth,
    monthToLocalDate,
    escapeHtml,
    showLoading,
    showEmptyState,
    showErrorState,
    showToast,
    handleAccountingError,
    setPageHeader,
    getCurrentMonth
} from "./accounting-common.js";


// =========================================================
// STATE
// =========================================================

let dashboardData = null;


// =========================================================
// LOAD DASHBOARD
// =========================================================

export async function loadAccountingDashboard() {

    const content =
        $("#accountingContent");

    if (!content) {
        console.error(
            "accountingContent not found"
        );
        return;
    }

    showLoading(content);

    try {

        const monthInput =
            $("#accountingMonth");

        const selectedMonth =
            monthInput?.value ||
            getCurrentMonth();

        const month =
            monthToLocalDate(
                selectedMonth
            );

        dashboardData =
            await getAccountingDashboard(
                month
            );

        renderDashboard(
            dashboardData,
            selectedMonth
        );

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        handleAccountingError(
            error
        );

        showErrorState(
            content,
            "Dashboard ma’lumotlarini yuklab bo‘lmadi"
        );
    }
}


// =========================================================
// RENDER DASHBOARD
// =========================================================

function renderDashboard(
    data,
    selectedMonth
) {

    const content =
        $("#accountingContent");

    if (!content) {
        return;
    }

    if (!data) {

        showEmptyState(
            content,
            "Dashboard ma’lumotlari topilmadi"
        );

        return;
    }

    setPageHeader(
        "Buxgalteriya",
        `${formatMonth(
            monthToLocalDate(
                selectedMonth
            )
        )} uchun moliyaviy holat`
    );


    const totalIncome =
        data.totalIncome ?? 0;

    const totalExpenses =
        data.totalExpenses ?? 0;

    const totalTeacherSalaries =
        data.totalTeacherSalaries ?? 0;

    const netIncome =
        data.netIncome ?? 0;

    const unpaidChildrenCount =
        data.unpaidChildrenCount ?? 0;

    const unpaidTeachersCount =
        data.unpaidTeachersCount ?? 0;

    const unpaidChildren =
        Array.isArray(
            data.unpaidChildren
        )
            ? data.unpaidChildren
            : [];

    const unpaidTeachers =
        Array.isArray(
            data.unpaidTeachers
        )
            ? data.unpaidTeachers
            : [];


    content.innerHTML = `

        <!-- =================================================
             DASHBOARD STATS
             ================================================= -->

        <div class="accounting-stats-grid">

            <div class="accounting-stat-card income">

                <div class="stat-card-top">

                    <div class="stat-card-icon">
                        ↗
                    </div>

                    <span class="stat-card-label">
                        Daromad
                    </span>

                </div>

                <div class="stat-card-value">
                    ${formatMoney(totalIncome)}
                </div>

                <div class="stat-card-description">
                    Bolalar to‘lovlari
                </div>

            </div>


            <div class="accounting-stat-card expense">

                <div class="stat-card-top">

                    <div class="stat-card-icon">
                        ↘
                    </div>

                    <span class="stat-card-label">
                        Rasxod
                    </span>

                </div>

                <div class="stat-card-value">
                    ${formatMoney(totalExpenses)}
                </div>

                <div class="stat-card-description">
                    Jami xarajatlar
                </div>

            </div>


            <div class="accounting-stat-card salary">

                <div class="stat-card-top">

                    <div class="stat-card-icon">
                        ₸
                    </div>

                    <span class="stat-card-label">
                        Ustozlar oyligi
                    </span>

                </div>

                <div class="stat-card-value">
                    ${formatMoney(totalTeacherSalaries)}
                </div>

                <div class="stat-card-description">
                    To‘langan oyliklar
                </div>

            </div>


            <div class="accounting-stat-card profit">

                <div class="stat-card-top">

                    <div class="stat-card-icon">
                        =
                    </div>

                    <span class="stat-card-label">
                        Sof foyda
                    </span>

                </div>

                <div class="stat-card-value">
                    ${formatMoney(netIncome)}
                </div>

                <div class="stat-card-description">
                    Daromad − barcha xarajatlar
                </div>

            </div>

        </div>


        <!-- =================================================
             UNPAID SUMMARY
             ================================================= -->

        <div class="accounting-section-grid">

            <section class="accounting-panel">

                <div class="accounting-panel-header">

                    <div>

                        <h2>
                            Qarzdor bolalar
                        </h2>

                        <p>
                            Ushbu oy uchun to‘lov qilmaganlar
                        </p>

                    </div>

                    <div class="accounting-count-badge danger">
                        ${formatNumber(
        unpaidChildrenCount
    )}
                    </div>

                </div>


                <div class="accounting-panel-body">

                    ${
        unpaidChildren.length
            ? renderUnpaidChildren(
                unpaidChildren
            )
            : `
                                <div class="accounting-success-empty">

                                    <div>
                                        ✓
                                    </div>

                                    <span>
                                        Barcha faol bolalar to‘lov qilgan
                                    </span>

                                </div>
                            `
    }

                </div>

            </section>


            <section class="accounting-panel">

                <div class="accounting-panel-header">

                    <div>

                        <h2>
                            Oyligi berilmagan ustozlar
                        </h2>

                        <p>
                            Ushbu oy uchun oyligi to‘lanmaganlar
                        </p>

                    </div>

                    <div class="accounting-count-badge warning">
                        ${formatNumber(
        unpaidTeachersCount
    )}
                    </div>

                </div>


                <div class="accounting-panel-body">

                    ${
        unpaidTeachers.length
            ? renderUnpaidTeachers(
                unpaidTeachers
            )
            : `
                                <div class="accounting-success-empty">

                                    <div>
                                        ✓
                                    </div>

                                    <span>
                                        Barcha ustozlarning oyligi berilgan
                                    </span>

                                </div>
                            `
    }

                </div>

            </section>

        </div>


        <!-- =================================================
             FINANCIAL SUMMARY
             ================================================= -->

        <section class="accounting-panel accounting-financial-summary">

            <div class="accounting-panel-header">

                <div>

                    <h2>
                        Moliyaviy xulosa
                    </h2>

                    <p>
                        ${escapeHtml(
        formatMonth(
            monthToLocalDate(
                selectedMonth
            )
        )
    )}
                    </p>

                </div>

            </div>


            <div class="financial-summary-list">

                <div class="financial-summary-row income-row">

                    <span>
                        Jami daromad
                    </span>

                    <strong>
                        ${formatMoney(
        totalIncome
    )}
                    </strong>

                </div>


                <div class="financial-summary-row">

                    <span>
                        Jami rasxod
                    </span>

                    <strong>
                        ${formatMoney(
        totalExpenses
    )}
                    </strong>

                </div>


                <div class="financial-summary-row">

                    <span>
                        Jami ustozlar oyligi
                    </span>

                    <strong>
                        ${formatMoney(
        totalTeacherSalaries
    )}
                    </strong>

                </div>


                <div class="financial-summary-row total-row">

                    <span>
                        Sof foyda
                    </span>

                    <strong>
                        ${formatMoney(
        netIncome
    )}
                    </strong>

                </div>

            </div>

        </section>
    `;
}


// =========================================================
// UNPAID CHILDREN
// =========================================================

function renderUnpaidChildren(
    children
) {

    return `

        <div class="accounting-list">

            ${children.map(child => `

                <div
                    class="accounting-list-item"
                    data-child-id="${child.childId}"
                >

                    <div class="list-item-main">

                        <div class="list-item-avatar">
                            ${getInitials(
        child.childName
    )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
        child.childName ||
        "Noma’lum"
    )}
                            </strong>

                            <span>
                                ${escapeHtml(
        child.groupName ||
        "Guruh biriktirilmagan"
    )}
                            </span>

                        </div>

                    </div>


                    <span class="status-badge unpaid">
                        To‘lanmagan
                    </span>

                </div>

            `).join("")}

        </div>
    `;
}


// =========================================================
// UNPAID TEACHERS
// =========================================================

function renderUnpaidTeachers(
    teachers
) {

    return `

        <div class="accounting-list">

            ${teachers.map(teacher => `

                <div
                    class="accounting-list-item"
                    data-teacher-id="${teacher.teacherId}"
                >

                    <div class="list-item-main">

                        <div class="list-item-avatar teacher-avatar">
                            ${getInitials(
        teacher.teacherName
    )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
        teacher.teacherName ||
        "Noma’lum"
    )}
                            </strong>

                            <span>
                                Ustoz
                            </span>

                        </div>

                    </div>


                    <span class="status-badge unpaid">
                        To‘lanmagan
                    </span>

                </div>

            `).join("")}

        </div>
    `;
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(
    name
) {

    if (!name) {
        return "?";
    }

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "?";
    }

    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[1][0]
    ).toUpperCase();
}


// =========================================================
// MONTH CHANGE
// =========================================================

export async function refreshDashboard() {

    await loadAccountingDashboard();
}


// =========================================================
// EVENT
// =========================================================

window.addEventListener(
    "accounting:dashboard-refresh",
    () => {

        loadAccountingDashboard();

    }
);