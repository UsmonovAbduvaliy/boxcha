// =========================================================
// BOXCHA — ACCOUNTING EXPENSES
// =========================================================

import {
    getExpensesBetween,
    createExpense,
    updateExpense,
    deleteExpense
} from "./accounting-api.js";

import {
    exportExpensesExcel,
    exportExpensesPdf
} from "./accounting-export.js";

import {
    $,
    formatMoney,
    formatDate,
    monthToLocalDate,
    escapeHtml,
    showLoading,
    showEmptyState,
    showErrorState,
    showToast,
    handleAccountingError,
    confirmDelete,
    getExpenseCategoryText
} from "./accounting-common.js";


// =========================================================
// STATE
// =========================================================

let expenses = [];

let filteredExpenses = [];

let editingExpenseId = null;


// =========================================================
// LOAD
// =========================================================

export async function loadExpensesPage() {

    const content =
        $("#accountingContent");

    if (!content) {
        return;
    }

    showLoading(content);


    try {

        const selectedMonth =
            $("#accountingMonth")?.value;


        if (!selectedMonth) {

            showEmptyState(
                content,
                "Oy tanlanmagan"
            );

            return;
        }


        const firstDay =
            monthToLocalDate(
                selectedMonth
            );


        const [year, month] =
            selectedMonth
                .split("-")
                .map(Number);


        const lastDay =
            new Date(
                year,
                month,
                0
            );


        const endDate =
            `${year}-${String(month)
                .padStart(2, "0")}-${String(
                lastDay.getDate()
            ).padStart(2, "0")}`;


        expenses =
            await getExpensesBetween(
                firstDay,
                endDate
            );


        filteredExpenses = [
            ...expenses
        ];


        renderExpensesPage(
            selectedMonth
        );

    } catch (error) {

        console.error(
            "Expenses loading error:",
            error
        );

        handleAccountingError(
            error
        );

        showErrorState(
            content,
            "Rasxodlarni yuklab bo‘lmadi"
        );
    }
}


// =========================================================
// RENDER
// =========================================================

function renderExpensesPage(
    selectedMonth
) {

    const content =
        $("#accountingContent");

    if (!content) {
        return;
    }


    const list =
        Array.isArray(expenses)
            ? expenses
            : [];


    filteredExpenses = [
        ...list
    ];


    const total =
        list.reduce(
            (
                sum,
                expense
            ) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    content.innerHTML = `

<div class="accounting-page-toolbar">

    <div>

        <h2>
            Rasxodlar
        </h2>

        <p>
            ${escapeHtml(
        selectedMonth
    )}
        </p>

    </div>


    <div class="accounting-toolbar-actions">

        <input
            type="search"
            id="expenseSearch"
            class="accounting-search"
            placeholder="Rasxod qidirish..."
        >


        <select
    id="expenseCategoryFilter"
    class="accounting-select"
>
    <option value="ALL">Barcha kategoriyalar</option>
    <option value="FOOD">Oziq-ovqat</option>
    <option value="OFFICE_SUPPLIES">Kanselyariya</option>
    <option value="MEDICINE">Dori-darmon</option>
    <option value="CLEANING">Tozalash</option>
    <option value="EQUIPMENT">Jihozlar</option>
    <option value="REPAIR">Ta'mirlash</option>
    <option value="UTILITIES">Kommunal</option>
    <option value="TRANSPORT">Transport</option>
    <option value="OTHER">Boshqa</option>
</select>

<button
    type="button"
    class="accounting-btn export-excel"
    id="exportExpensesExcelBtn"
>
    📊 Excel
</button>

<button
    type="button"
    class="accounting-btn export-pdf"
    id="exportExpensesPdfBtn"
>
    📄 PDF
</button>

<button
    type="button"
    class="accounting-primary-btn"
    id="addExpenseBtn"
>
    + Rasxod qo‘shish
</button>

    </div>

</div>


<div class="accounting-mini-stats">

    <div class="accounting-mini-stat danger">

        <span>
            Jami rasxod
        </span>

        <strong>
            ${formatMoney(
        total
    )}
        </strong>

    </div>

</div>


<section class="accounting-panel">

    <div class="accounting-panel-header">

        <div>

            <h2>
                Rasxodlar ro‘yxati
            </h2>

            <p id="expensesCount">
                ${list.length} ta yozuv
            </p>

        </div>

    </div>


    <div class="accounting-table-wrapper">

        <table class="accounting-table">

            <thead>

            <tr>

                <th>
                    Nomi
                </th>

                <th>
                    Kategoriya
                </th>

                <th>
                    Summa
                </th>

                <th>
                    Sana
                </th>

                <th>
                    Izoh
                </th>

                <th>
                    Amal
                </th>

            </tr>

            </thead>


            <tbody id="expensesTableBody">
            </tbody>

        </table>

    </div>

</section>


<div
    id="expenseModalContainer"
></div>

    `;


    renderExpensesTable(
        list
    );

    setupExpenseEvents();
}


// =========================================================
// TABLE
// =========================================================

function renderExpensesTable(
    list
) {

    const tbody =
        $("#expensesTableBody");

    if (!tbody) {
        return;
    }


    if (!list.length) {

        tbody.innerHTML = `

<tr>

    <td
        colspan="6"
        class="accounting-table-empty"
    >
        Ushbu oy uchun rasxodlar mavjud emas.
    </td>

</tr>

`;

        return;
    }


    tbody.innerHTML =
        list.map(
            expense => `

<tr>

    <td>

        <strong>
            ${escapeHtml(
                expense.title ||
                "Noma’lum"
            )}
        </strong>

    </td>


    <td>

        <span class="category-badge">

            ${escapeHtml(
                getExpenseCategoryText(
                    expense.category
                )
            )}

        </span>

    </td>


    <td>

        <strong>
            ${formatMoney(
                expense.amount
            )}
        </strong>

    </td>


    <td>

        ${formatDate(
                expense.expenseDate
            )}

    </td>


    <td>

        ${escapeHtml(
                expense.description ||
                "—"
            )}

    </td>


    <td>

        <div class="table-actions">

            <button
                type="button"
                class="table-action-btn edit"
                data-edit-expense="${expense.id}"
                title="Tahrirlash"
            >
                ✎
            </button>


            <button
                type="button"
                class="table-action-btn delete"
                data-delete-expense="${expense.id}"
                title="O‘chirish"
            >
                ×
            </button>

        </div>

    </td>

</tr>

`
        ).join("");
}


// =========================================================
// EVENTS
// =========================================================

function setupExpenseEvents() {

    $("#addExpenseBtn")
        ?.addEventListener(
            "click",
            () => {

                editingExpenseId = null;

                openExpenseModal();

            }
        );


    $("#expenseSearch")
        ?.addEventListener(
            "input",
            filterExpenses
        );


    $("#expenseCategoryFilter")
        ?.addEventListener(
            "change",
            filterExpenses
        );


    $("#exportExpensesExcelBtn")
        ?.addEventListener(
            "click",
            handleExpensesExcelExport
        );


    $("#exportExpensesPdfBtn")
        ?.addEventListener(
            "click",
            handleExpensesPdfExport
        );


    $("#expensesTableBody")
        ?.addEventListener(
            "click",
            handleExpenseTableClick
        );
}


// =========================================================
// EXPORT — EXCEL
// =========================================================

function handleExpensesExcelExport() {

    if (!filteredExpenses.length) {

        showToast(
            "Excelga chiqarish uchun ma'lumot yo‘q.",
            "warning"
        );

        return;
    }


    const selectedMonth =
        $("#accountingMonth")?.value ||
        "";


    try {

        exportExpensesExcel(
            filteredExpenses,
            selectedMonth,
            formatMoney
        );


        showToast(
            "Excel fayl tayyorlandi.",
            "success"
        );

    } catch (error) {

        console.error(
            "Expenses Excel export error:",
            error
        );


        showToast(
            "Excel faylni yaratishda xatolik yuz berdi.",
            "error"
        );
    }
}


// =========================================================
// EXPORT — PDF
// =========================================================

function handleExpensesPdfExport() {

    if (!filteredExpenses.length) {

        showToast(
            "PDFga chiqarish uchun ma'lumot yo‘q.",
            "warning"
        );

        return;
    }


    const selectedMonth =
        $("#accountingMonth")?.value ||
        "";


    try {

        exportExpensesPdf(
            filteredExpenses,
            selectedMonth,
            formatMoney
        );


        showToast(
            "PDF fayl tayyorlandi.",
            "success"
        );

    } catch (error) {

        console.error(
            "Expenses PDF export error:",
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

async function handleExpenseTableClick(
    event
) {

    const editButton =
        event.target.closest(
            "[data-edit-expense]"
        );


    if (editButton) {

        const id =
            Number(
                editButton.dataset.editExpense
            );


        const expense =
            expenses.find(
                item =>
                    Number(item.id) === id
            );


        if (expense) {

            editingExpenseId =
                id;


            openExpenseModal(
                expense
            );
        }


        return;
    }


    const deleteButton =
        event.target.closest(
            "[data-delete-expense]"
        );


    if (deleteButton) {

        const id =
            Number(
                deleteButton.dataset.deleteExpense
            );


        await handleDeleteExpense(
            id
        );
    }
}


// =========================================================
// FILTER
// =========================================================

function filterExpenses() {

    const search =
        ($("#expenseSearch")?.value || "")
            .trim()
            .toLowerCase();


    const category =
        $("#expenseCategoryFilter")?.value ||
        "ALL";


    filteredExpenses =
        expenses.filter(
            expense => {

                const title =
                    String(
                        expense.title || ""
                    ).toLowerCase();


                const description =
                    String(
                        expense.description || ""
                    ).toLowerCase();


                const expenseCategory =
                    String(
                        expense.category || ""
                    ).toUpperCase();


                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    description.includes(search);


                const matchesCategory =
                    category === "ALL" ||
                    expenseCategory === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    renderExpensesTable(
        filteredExpenses
    );


    const count =
        $("#expensesCount");


    if (count) {

        count.textContent =
            `${filteredExpenses.length} ta yozuv`;
    }
}


// =========================================================
// MODAL
// =========================================================

function openExpenseModal(
    expense = null
) {

    const container =
        $("#expenseModalContainer");


    if (!container) {
        return;
    }


    const isEdit =
        Boolean(expense);


    container.innerHTML = `

<div class="accounting-modal-backdrop">

    <div class="accounting-modal">

        <div class="accounting-modal-header">

            <div>

                <h2>

                    ${
        isEdit
            ? "Rasxodni tahrirlash"
            : "Yangi rasxod"
    }

                </h2>


                <p>
                    Xarajat ma’lumotlarini kiriting
                </p>

            </div>


            <button
                type="button"
                class="accounting-modal-close"
                id="closeExpenseModal"
            >
                ×
            </button>

        </div>


        <form
            id="expenseForm"
            class="accounting-form"
        >

            <div class="form-group">

                <label>
                    Nomi
                </label>


                <input
                    type="text"
                    id="expenseTitle"
                    required
                    maxlength="500"
                    placeholder="Masalan: Oziq-ovqat xaridi"
                    value="${escapeHtml(
        expense?.title ||
        ""
    )}"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>
                        Kategoriya
                    </label>


                    <select
                        id="expenseCategory"
                        required
                    >

                        <option value="FOOD">
                            Oziq-ovqat
                        </option>

                        <option value="OFFICE_SUPPLIES">
                            Kanselyariya
                        </option>

                        <option value="MEDICINE">
                            Dori-darmon
                        </option>

                        <option value="CLEANING">
                            Tozalash
                        </option>

                        <option value="EQUIPMENT">
                            Jihozlar
                        </option>

                        <option value="REPAIR">
                            Ta’mirlash
                        </option>

                        <option value="UTILITIES">
                            Kommunal
                        </option>

                        <option value="TRANSPORT">
                            Transport
                        </option>

                        <option value="OTHER">
                            Boshqa
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Summa
                    </label>


                    <input
                        type="number"
                        id="expenseAmount"
                        required
                        min="1"
                        step="0.01"
                        placeholder="500000"
                        value="${
        expense?.amount ??
        ""
    }"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>
                    Sana
                </label>


                <input
                    type="date"
                    id="expenseDate"
                    required
                    value="${
        expense?.expenseDate ??
        new Date()
            .toISOString()
            .split("T")[0]
    }"
                >

            </div>


            <div class="form-group">

                <label>
                    Izoh
                </label>


                <textarea
                    id="expenseDescription"
                    rows="3"
                    maxlength="1000"
                    placeholder="Qo‘shimcha izoh..."
                >${escapeHtml(
        expense?.description ||
        ""
    )}</textarea>

            </div>


            <div class="form-group">

                <label>
                    Chek / Receipt URL
                </label>


                <input
                    type="url"
                    id="expenseReceiptUrl"
                    maxlength="1000"
                    placeholder="https://..."
                    value="${escapeHtml(
        expense?.receiptUrl ||
        ""
    )}"
                >

            </div>


            <div class="accounting-modal-footer">

                <button
                    type="button"
                    class="accounting-secondary-btn"
                    id="cancelExpenseModal"
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
            : "Rasxod qo‘shish"
    }

                </button>

            </div>

        </form>

    </div>

</div>

`;


    const category =
        $("#expenseCategory");


    if (
        category &&
        expense?.category
    ) {

        category.value =
            expense.category;
    }


    $("#closeExpenseModal")
        ?.addEventListener(
            "click",
            closeExpenseModal
        );


    $("#cancelExpenseModal")
        ?.addEventListener(
            "click",
            closeExpenseModal
        );


    $("#expenseForm")
        ?.addEventListener(
            "submit",
            handleExpenseSubmit
        );
}


// =========================================================
// CLOSE
// =========================================================

function closeExpenseModal() {

    const container =
        $("#expenseModalContainer");


    if (container) {

        container.innerHTML = "";
    }


    editingExpenseId = null;
}


// =========================================================
// SUBMIT
// =========================================================

async function handleExpenseSubmit(
    event
) {

    event.preventDefault();


    const title =
        $("#expenseTitle")
            ?.value
            ?.trim();


    const category =
        $("#expenseCategory")
            ?.value;


    const amount =
        Number(
            $("#expenseAmount")?.value
        );


    const expenseDate =
        $("#expenseDate")
            ?.value;


    const description =
        $("#expenseDescription")
            ?.value
            ?.trim() ||
        null;


    const receiptUrl =
        $("#expenseReceiptUrl")
            ?.value
            ?.trim() ||
        null;


    if (!title) {

        showToast(
            "Rasxod nomini kiriting",
            "warning"
        );

        return;
    }


    if (!category) {

        showToast(
            "Kategoriyani tanlang",
            "warning"
        );

        return;
    }


    if (!amount || amount <= 0) {

        showToast(
            "Rasxod summasini kiriting",
            "warning"
        );

        return;
    }


    if (!expenseDate) {

        showToast(
            "Rasxod sanasini tanlang",
            "warning"
        );

        return;
    }


    try {

        const data = {

            category,

            title,

            amount,

            expenseDate,

            description,

            receiptUrl
        };


        if (editingExpenseId) {

            await updateExpense(
                editingExpenseId,
                data
            );


            showToast(
                "Rasxod muvaffaqiyatli yangilandi",
                "success"
            );

        } else {

            await createExpense(
                data
            );


            showToast(
                "Rasxod muvaffaqiyatli qo‘shildi",
                "success"
            );
        }


        closeExpenseModal();


        await loadExpensesPage();


        window.dispatchEvent(
            new CustomEvent(
                "accounting:dashboard-refresh"
            )
        );

    } catch (error) {

        console.error(
            "Expense save error:",
            error
        );


        handleAccountingError(
            error
        );
    }
}


// =========================================================
// DELETE
// =========================================================

async function handleDeleteExpense(
    id
) {

    const confirmed =
        confirmDelete(
            "Ushbu rasxodni o‘chirmoqchimisiz?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteExpense(
            id
        );


        showToast(
            "Rasxod o‘chirildi",
            "success"
        );


        await loadExpensesPage();


        window.dispatchEvent(
            new CustomEvent(
                "accounting:dashboard-refresh"
            )
        );

    } catch (error) {

        console.error(
            "Expense delete error:",
            error
        );


        handleAccountingError(
            error
        );
    }
}