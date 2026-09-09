// =========================================================
// BOXCHA — ACCOUNTING MAIN
// =========================================================
import {
    $,
    requireAuth,
    initializeAccountingCommon,
    setActiveNavigation,
    setPageHeader,
    getCurrentPage,
    getCurrentMonth
} from "./accounting-common.js";

import {
    loadAccountingDashboard
} from "./accounting-dashboard.js";

import {
    loadPaymentsPage
} from "./accounting-payments.js";

import {
    loadSalariesPage
} from "./accounting-salaries.js";

import {
    loadExpensesPage
} from "./accounting-expenses.js";

import {
    loadGroupStatisticsPage
} from "./accounting-group-statistics.js";

// =========================================================
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // ---------------------------------------------
        // AUTH
        // ---------------------------------------------

        if (!requireAuth()) {
            return;
        }


        // ---------------------------------------------
        // COMMON
        // ---------------------------------------------

        initializeAccountingCommon();


        // ---------------------------------------------
        // CURRENT MONTH
        // ---------------------------------------------

        const monthInput =
            $("#accountingMonth");

        if (monthInput) {

            monthInput.value =
                getCurrentMonth();

        }


        // ---------------------------------------------
        // NAVIGATION
        // ---------------------------------------------

        window.addEventListener(
            "accounting:navigate",
            async event => {

                const page =
                    event.detail?.page;

                if (!page) {
                    return;
                }

                await navigateToPage(
                    page
                );
            }
        );


        // ---------------------------------------------
        // MONTH CHANGE
        // ---------------------------------------------

        if (monthInput) {

            monthInput.addEventListener(
                "change",
                async () => {

                    const currentPage =
                        getCurrentPage();

                    await navigateToPage(
                        currentPage
                    );
                }
            );
        }


        // ---------------------------------------------
        // DASHBOARD REFRESH
        // ---------------------------------------------

        window.addEventListener(
            "accounting:dashboard-refresh",
            async () => {

                const currentPage =
                    getCurrentPage();

                if (
                    currentPage ===
                    "dashboard"
                ) {

                    await loadAccountingDashboard();
                }
            }
        );


        // ---------------------------------------------
        // DEFAULT PAGE
        // ---------------------------------------------

        setActiveNavigation(
            "dashboard"
        );

        await navigateToPage(
            "dashboard"
        );

    }
);


// =========================================================
// NAVIGATE
// =========================================================

async function navigateToPage(
    page
) {

    setActiveNavigation(
        page
    );


    switch (page) {

        case "dashboard":

            setPageHeader(
                "Buxgalteriya",
                "Boxcha moliyaviy boshqaruv paneli"
            );

            await loadAccountingDashboard();

            break;


        case "payments":

            setPageHeader(
                "Bolalar to‘lovlari",
                "Bolalarning oylik to‘lovlarini boshqarish"
            );

            await loadPaymentsPage();

            break;


        case "salaries":

            setPageHeader(
                "Ustozlar oyligi",
                "Ustozlarning oylik to‘lovlarini boshqarish"
            );

            await loadSalariesPage();

            break;


        case "expenses":

            setPageHeader(
                "Rasxodlar",
                "Boxcha xarajatlarini boshqarish"
            );

            await loadExpensesPage();

            break;

        case "group-statistics":

            setPageHeader(
                "Guruhlar statistikasi",
                "Guruhlarning oylik to‘lov va moliyaviy holati"
            );

            await loadGroupStatisticsPage();

            break;

        default:

            console.warn(
                "Unknown accounting page:",
                page
            );

            await loadAccountingDashboard();

            break;
    }
}