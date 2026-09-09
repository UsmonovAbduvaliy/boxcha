import {
    getChildPaymentsByMonth,
    createChildPayment,
    updateChildPayment,
    deleteChildPayment
} from "./accounting-api.js";

import {
    exportPaymentsExcel,
    exportPaymentsPdf
} from "./accounting-export.js";

import { api } from "../../js/api.js";

import {
    $,
    formatMoney,
    formatDate,
    formatMonth,
    monthToLocalDate,
    escapeHtml,
    showLoading,
    showEmptyState,
    showErrorState,
    showToast,
    handleAccountingError,
    confirmDelete,
    getPaymentStatusText,
    getStatusClass
} from "./accounting-common.js";


// =========================================================
// STATE
// =========================================================

let payments = [];

let filteredPayments = [];

let editingPaymentId = null;

let paymentChildren = [];


// =========================================================
// LOAD
// =========================================================

export async function loadPaymentsPage() {

    const content = $("#accountingContent");

    if (!content) {
        return;
    }

    showLoading(content);

    try {

        const monthInput = $("#accountingMonth");

        const selectedMonth = monthInput?.value;

        if (!selectedMonth) {

            showEmptyState(
                content,
                "Oy tanlanmagan"
            );

            return;
        }

        const month = monthToLocalDate(
            selectedMonth
        );

        payments = await getChildPaymentsByMonth(
            month
        );

        if (!Array.isArray(payments)) {
            payments = [];
        }

        /*
         * Dastlab barcha paymentlar export uchun
         * mavjud bo‘ladi.
         */
        filteredPayments = [...payments];

        renderPaymentsPage(
            selectedMonth
        );

    } catch (error) {

        console.error(
            "Payments loading error:",
            error
        );

        handleAccountingError(error);

        showErrorState(
            content,
            "Bolalar to‘lovlarini yuklab bo‘lmadi"
        );
    }
}


// =========================================================
// RENDER PAGE
// =========================================================

function renderPaymentsPage(
    selectedMonth
) {

    const content = $("#accountingContent");

    if (!content) {
        return;
    }

    const list =
        Array.isArray(payments)
            ? payments
            : [];

    /*
     * Har safar sahifa render bo‘lganda
     * boshlang‘ich export list barcha paymentlar.
     */
    filteredPayments = [...list];

    content.innerHTML = `

        <div class="accounting-page-toolbar">

            <div>

                <h2>
                    Bolalar to‘lovlari
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


            <div class="accounting-toolbar-actions">

                <input
                    type="search"
                    id="paymentSearch"
                    class="accounting-search"
                    placeholder="Bola qidirish..."
                    autocomplete="off"
                >


                <select
                    id="paymentStatusFilter"
                    class="accounting-select"
                >

                    <option value="ALL">
                        Barchasi
                    </option>

                    <option value="PAID">
                        To‘langan
                    </option>

                    <option value="UNPAID">
                        To‘lanmagan
                    </option>

                    <option value="PARTIAL">
                        Qisman
                    </option>

                </select>


                <button
                    type="button"
                    class="accounting-btn export-excel"
                    id="exportPaymentsExcelBtn"
                    title="Excel faylga chiqarish"
                >
                    📊 Excel
                </button>


                <button
                    type="button"
                    class="accounting-btn export-pdf"
                    id="exportPaymentsPdfBtn"
                    title="PDF faylga chiqarish"
                >
                    📄 PDF
                </button>


                <button
                    type="button"
                    class="accounting-btn primary"
                    id="addPaymentBtn"
                >
                    + To‘lov qo‘shish
                </button>

            </div>

        </div>


        <section class="accounting-panel">

            <div class="accounting-panel-header">

                <div>

                    <h2>
                        To‘lovlar
                    </h2>

                    <p id="paymentsCount">
                        ${list.length} ta yozuv
                    </p>

                </div>

            </div>


            <div class="accounting-table-wrapper">

                <table class="accounting-table">

                    <thead>

                        <tr>

                            <th>
                                Bola
                            </th>

                            <th>
                                Guruh
                            </th>

                            <th>
                                Oy
                            </th>

                            <th>
                                Summa
                            </th>

                            <th>
                                To‘langan sana
                            </th>

                            <th>
                                Holat
                            </th>

                            <th>
                                Amal
                            </th>

                        </tr>

                    </thead>


                    <tbody id="paymentsTableBody">

                    </tbody>

                </table>

            </div>

        </section>


        <div
            id="paymentModalContainer"
        ></div>
    `;


    renderPaymentsTable(list);

    setupPaymentEvents();
}


// =========================================================
// TABLE
// =========================================================

function renderPaymentsTable(
    list
) {

    const tbody = $("#paymentsTableBody");

    if (!tbody) {
        return;
    }


    if (!list.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="accounting-table-empty"
                >
                    Ushbu oy uchun to‘lovlar mavjud emas.
                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        list.map(payment => `

            <tr
                data-payment-row-id="${payment.id}"
            >

                <td>

                    <div class="table-person">

                        <div class="table-avatar">
                            ${getInitials(
            payment.childName
        )}
                        </div>

                        <strong>
                            ${escapeHtml(
            payment.childName ||
            "Noma’lum"
        )}
                        </strong>

                    </div>

                </td>


                <td>
                    ${escapeHtml(
            payment.groupName ||
            "—"
        )}
                </td>


                <td>
                    ${formatMonth(
            payment.paymentMonth
        )}
                </td>


                <td>
                    <strong>
                        ${formatMoney(
            payment.amount
        )}
                    </strong>
                </td>


                <td>
                    ${formatDate(
            payment.paidDate
        )}
                </td>


                <td>

                    <span
                        class="status-badge ${getStatusClass(
            payment.status
        )}"
                    >
                        ${getPaymentStatusText(
            payment.status
        )}
                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="table-action-btn edit"
                            data-edit-payment="${payment.id}"
                            title="Tahrirlash"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="table-action-btn delete"
                            data-delete-payment="${payment.id}"
                            title="O‘chirish"
                        >
                            ×
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");
}


// =========================================================
// EVENTS
// =========================================================

function setupPaymentEvents() {

    // -----------------------------------------------------
    // ADD PAYMENT
    // -----------------------------------------------------

    const addButton = $("#addPaymentBtn");

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                editingPaymentId = null;

                openPaymentModal();

            }
        );
    }


    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

    const search = $("#paymentSearch");

    if (search) {

        search.addEventListener(
            "input",
            filterPayments
        );
    }


    // -----------------------------------------------------
    // STATUS FILTER
    // -----------------------------------------------------

    const status = $("#paymentStatusFilter");

    if (status) {

        status.addEventListener(
            "change",
            filterPayments
        );
    }


    // -----------------------------------------------------
    // EXCEL EXPORT
    // -----------------------------------------------------

    const excelButton =
        $("#exportPaymentsExcelBtn");

    if (excelButton) {

        excelButton.addEventListener(
            "click",
            handlePaymentsExcelExport
        );
    }


    // -----------------------------------------------------
    // PDF EXPORT
    // -----------------------------------------------------

    const pdfButton =
        $("#exportPaymentsPdfBtn");

    if (pdfButton) {

        pdfButton.addEventListener(
            "click",
            handlePaymentsPdfExport
        );
    }


    // -----------------------------------------------------
    // TABLE
    // -----------------------------------------------------

    const tbody =
        $("#paymentsTableBody");

    if (tbody) {

        tbody.addEventListener(
            "click",
            handlePaymentTableClick
        );
    }
}


// =========================================================
// EXCEL EXPORT
// =========================================================

function handlePaymentsExcelExport() {

    if (!filteredPayments.length) {

        showToast(
            "Excelga chiqarish uchun ma'lumot yo‘q.",
            "warning"
        );

        return;
    }


    const selectedMonth =
        $("#accountingMonth")?.value || "";


    try {

        exportPaymentsExcel(
            filteredPayments,
            selectedMonth,
            formatMoney
        );

        showToast(
            "Excel fayl tayyorlandi.",
            "success"
        );

    } catch (error) {

        console.error(
            "Payments Excel export error:",
            error
        );

        showToast(
            "Excel faylni yaratishda xatolik yuz berdi.",
            "error"
        );
    }
}


// =========================================================
// PDF EXPORT
// =========================================================

function handlePaymentsPdfExport() {

    if (!filteredPayments.length) {

        showToast(
            "PDFga chiqarish uchun ma'lumot yo‘q.",
            "warning"
        );

        return;
    }


    const selectedMonth =
        $("#accountingMonth")?.value || "";


    try {

        exportPaymentsPdf(
            filteredPayments,
            selectedMonth,
            formatMoney
        );

        showToast(
            "PDF fayl tayyorlandi.",
            "success"
        );

    } catch (error) {

        console.error(
            "Payments PDF export error:",
            error
        );

        showToast(
            "PDF faylni yaratishda xatolik yuz berdi.",
            "error"
        );
    }
}


// =========================================================
// TABLE CLICK
// =========================================================

async function handlePaymentTableClick(
    event
) {

    const editButton =
        event.target.closest(
            "[data-edit-payment]"
        );


    if (editButton) {

        const id =
            Number(
                editButton.dataset.editPayment
            );


        const payment =
            payments.find(
                item =>
                    Number(item.id) === id
            );


        if (payment) {

            editingPaymentId = id;

            openPaymentModal(
                payment
            );
        }

        return;
    }


    const deleteButton =
        event.target.closest(
            "[data-delete-payment]"
        );


    if (deleteButton) {

        const id =
            Number(
                deleteButton.dataset.deletePayment
            );


        await handleDeletePayment(id);
    }
}


// =========================================================
// FILTER PAYMENTS
// =========================================================

function filterPayments() {

    const search =
        ($("#paymentSearch")?.value || "")
            .trim()
            .toLowerCase();


    const status =
        $("#paymentStatusFilter")?.value ||
        "ALL";


    filteredPayments =
        payments.filter(
            payment => {

                const childName =
                    String(
                        payment.childName || ""
                    ).toLowerCase();


                const groupName =
                    String(
                        payment.groupName || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    childName.includes(search) ||
                    groupName.includes(search);


                const matchesStatus =
                    status === "ALL" ||
                    String(
                        payment.status || ""
                    ).toUpperCase() === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    renderPaymentsTable(
        filteredPayments
    );


    const count =
        $("#paymentsCount");


    if (count) {

        count.textContent =
            `${filteredPayments.length} ta yozuv`;
    }
}


// =========================================================
// PAYMENT MODAL
// =========================================================

function openPaymentModal(
    payment = null
) {

    const container =
        $("#paymentModalContainer");


    if (!container) {
        return;
    }


    const isEdit =
        Boolean(payment);


    container.innerHTML = `

        <div class="accounting-modal-backdrop">

            <div class="accounting-modal">

                <div class="accounting-modal-header">

                    <div>

                        <h2>
                            ${
        isEdit
            ? "To‘lovni tahrirlash"
            : "Yangi to‘lov"
    }
                        </h2>

                        <p>
                            Bola to‘lovi ma’lumotlarini kiriting
                        </p>

                    </div>


                    <button
                        type="button"
                        class="accounting-modal-close"
                        id="closePaymentModal"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="paymentForm"
                    class="accounting-form"
                >

                    ${
        !isEdit
            ? `

                                <div class="form-group">

                                    <label for="paymentChildId">
                                        Bola
                                    </label>

                                    <div
                                        class="payment-child-picker"
                                        id="paymentChildPicker"
                                    >

                                        <input
                                            type="search"
                                            id="paymentChildSearch"
                                            class="accounting-search"
                                            placeholder="Bolani qidirish..."
                                            autocomplete="off"
                                        >


                                        <select
                                            id="paymentChildId"
                                            class="accounting-select"
                                            required
                                        >

                                            <option value="">
                                                Bolalar yuklanmoqda...
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div class="form-group">

                                    <label for="paymentMonth">
                                        To‘lov oyi
                                    </label>

                                    <input
                                        type="month"
                                        id="paymentMonth"
                                        required
                                    >

                                </div>

                            `
            : `

                                <div class="form-group">

                                    <label>
                                        Bola
                                    </label>

                                    <input
                                        type="text"
                                        value="${escapeHtml(
                payment.childName ||
                "Noma’lum"
            )}"
                                        disabled
                                    >

                                </div>

                            `
    }


                    <div class="form-group">

                        <label for="paymentAmount">
                            Summa
                        </label>

                        <input
                            type="number"
                            id="paymentAmount"
                            required
                            min="1"
                            step="0.01"
                            placeholder="500000"
                            value="${
        payment?.amount ??
        ""
    }"
                        >

                    </div>


                    <div class="form-row">

                        <div class="form-group">

                            <label for="paymentPaidDate">
                                To‘langan sana
                            </label>

                            <input
                                type="date"
                                id="paymentPaidDate"
                                value="${
        payment?.paidDate ??
        ""
    }"
                            >

                        </div>


                        <div class="form-group">

                            <label for="paymentStatus">
                                Holat
                            </label>

                            <select
                                id="paymentStatus"
                                required
                            >

                                <option
                                    value="PAID"
                                    ${
        payment?.status === "PAID"
            ? "selected"
            : ""
    }
                                >
                                    To‘langan
                                </option>


                                <option
                                    value="UNPAID"
                                    ${
        payment?.status === "UNPAID"
            ? "selected"
            : ""
    }
                                >
                                    To‘lanmagan
                                </option>


                                <option
                                    value="PARTIAL"
                                    ${
        payment?.status === "PARTIAL"
            ? "selected"
            : ""
    }
                                >
                                    Qisman
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="form-group">

                        <label for="paymentDescription">
                            Izoh
                        </label>

                        <textarea
                            id="paymentDescription"
                            rows="3"
                            placeholder="Qo‘shimcha izoh..."
                        >${escapeHtml(
        payment?.description || ""
    )}</textarea>

                    </div>


                    <div class="accounting-modal-footer">

                        <button
                            type="button"
                            class="accounting-secondary-btn"
                            id="cancelPaymentModal"
                        >
                            Bekor qilish
                        </button>


                        <button
                            type="submit"
                            class="accounting-primary-btn"
                        >
                            ${
        isEdit
            ? "Saqlash"
            : "To‘lov qo‘shish"
    }
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;


    $("#closePaymentModal")
        ?.addEventListener(
            "click",
            closePaymentModal
        );


    $("#cancelPaymentModal")
        ?.addEventListener(
            "click",
            closePaymentModal
        );


    $("#paymentForm")
        ?.addEventListener(
            "submit",
            handlePaymentSubmit
        );


    /*
     * Yangi to‘lov bo‘lsa,
     * bolalarni backenddan yuklaymiz.
     */

    if (!isEdit) {

        loadPaymentChildren();
    }
}


// =========================================================
// LOAD CHILDREN FOR PAYMENT
// =========================================================

async function loadPaymentChildren() {

    const select =
        $("#paymentChildId");


    if (!select) {
        return;
    }


    try {

        const children =
            await api(
                "/api/children"
            ) || [];


        /*
         * Faqat active bolalarni olamiz.
         */

        paymentChildren =
            Array.isArray(children)
                ? children.filter(
                    child =>
                        child.active !== false
                )
                : [];


        renderPaymentChildren(
            paymentChildren
        );


        setupPaymentChildSearch();


    } catch (error) {

        console.error(
            "Payment children loading error:",
            error
        );


        paymentChildren = [];


        select.innerHTML = `
            <option value="">
                Bolalarni yuklab bo‘lmadi
            </option>
        `;


        showToast(
            "Bolalar ro‘yxatini yuklab bo‘lmadi",
            "error"
        );
    }
}


// =========================================================
// RENDER CHILDREN
// =========================================================

function renderPaymentChildren(
    children
) {

    const select =
        $("#paymentChildId");


    if (!select) {
        return;
    }


    if (!children.length) {

        select.innerHTML = `
            <option value="">
                Faol bolalar topilmadi
            </option>
        `;

        return;
    }


    select.innerHTML = `

        <option value="">
            Bolani tanlang
        </option>

        ${
        children
            .map(child => {

                const fullName =
                    [
                        child.firstName,
                        child.lastName,
                        child.patronymic
                    ]
                        .filter(Boolean)
                        .join(" ");


                return `
                        <option value="${child.id}">
                            ${escapeHtml(
                    fullName ||
                    `Bola #${child.id}`
                )}
                        </option>
                    `;

            })
            .join("")
    }

    `;
}


// =========================================================
// CHILD SEARCH
// =========================================================

function setupPaymentChildSearch() {

    const search =
        $("#paymentChildSearch");


    const select =
        $("#paymentChildId");


    if (!search || !select) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            const filtered =
                paymentChildren.filter(
                    child => {

                        const fullName =
                            [
                                child.firstName,
                                child.lastName,
                                child.patronymic
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        return fullName.includes(
                            query
                        );
                    }
                );


            renderPaymentChildren(
                filtered
            );


            /*
             * Qidiruvdan keyin avtomatik
             * bola tanlanmaydi.
             */

            select.value = "";
        }
    );
}


// =========================================================
// CLOSE MODAL
// =========================================================

function closePaymentModal() {

    const container =
        $("#paymentModalContainer");


    if (container) {

        container.innerHTML = "";
    }


    editingPaymentId = null;

    paymentChildren = [];
}


// =========================================================
// SUBMIT
// =========================================================

async function handlePaymentSubmit(
    event
) {

    event.preventDefault();


    const amount =
        Number(
            $("#paymentAmount")?.value
        );


    const paidDate =
        $("#paymentPaidDate")?.value ||
        null;


    const status =
        $("#paymentStatus")?.value;


    const description =
        $("#paymentDescription")?.value
            ?.trim() || null;


    if (!amount || amount <= 0) {

        showToast(
            "To‘lov summasini kiriting",
            "warning"
        );

        return;
    }


    try {

        // =================================================
        // UPDATE
        // =================================================

        if (editingPaymentId) {

            await updateChildPayment(
                editingPaymentId,
                {
                    amount,
                    paidDate,
                    status,
                    description
                }
            );


            showToast(
                "To‘lov muvaffaqiyatli yangilandi",
                "success"
            );

        }

            // =================================================
            // CREATE
        // =================================================

        else {

            const childId =
                Number(
                    $("#paymentChildId")?.value
                );


            const paymentMonthInput =
                $("#paymentMonth")?.value;


            if (!childId) {

                showToast(
                    "Bolani tanlang",
                    "warning"
                );

                return;
            }


            if (!paymentMonthInput) {

                showToast(
                    "To‘lov oyini tanlang",
                    "warning"
                );

                return;
            }


            const result =
                await createChildPayment(
                    {
                        childId,

                        paymentMonth:
                            monthToLocalDate(
                                paymentMonthInput
                            ),

                        amount,

                        paidDate,

                        status,

                        description
                    }
                );


            if (result?.alreadyExists) {

                showToast(
                    "Bu bola uchun ushbu oyga to‘lov allaqachon mavjud",
                    "error"
                );

                return;

            } else {

                showToast(
                    "To‘lov muvaffaqiyatli qo‘shildi",
                    "success"
                );
            }
        }


        closePaymentModal();


        await loadPaymentsPage();


        window.dispatchEvent(
            new CustomEvent(
                "accounting:dashboard-refresh"
            )
        );


    } catch (error) {

        console.error(
            "Payment save error:",
            error
        );


        handleAccountingError(error);
    }
}


// =========================================================
// DELETE
// =========================================================

async function handleDeletePayment(
    id
) {

    const confirmed =
        confirmDelete(
            "Ushbu to‘lovni o‘chirmoqchimisiz?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteChildPayment(id);


        showToast(
            "To‘lov o‘chirildi",
            "success"
        );


        await loadPaymentsPage();


        window.dispatchEvent(
            new CustomEvent(
                "accounting:dashboard-refresh"
            )
        );


    } catch (error) {

        console.error(
            "Payment delete error:",
            error
        );


        handleAccountingError(error);
    }
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
// REFRESH EVENT
// =========================================================

window.addEventListener(
    "accounting:payments-refresh",
    () => {

        loadPaymentsPage();

    }
);