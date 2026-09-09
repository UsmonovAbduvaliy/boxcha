// =========================================================
// BOXCHA — ACCOUNTING TEACHER SALARIES
// =========================================================

import {
    getTeacherSalariesByMonth,
    createTeacherSalary,
    updateTeacherSalary,
    deleteTeacherSalary
} from "./accounting-api.js";

import {
    exportSalariesExcel,
    exportSalariesPdf
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
    getSalaryStatusText,
    getStatusClass
} from "./accounting-common.js";


// =========================================================
// STATE
// =========================================================

let salaries = [];

let filteredSalaries = [];

let editingSalaryId = null;

let salaryTeachers = [];


// =========================================================
// LOAD
// =========================================================

export async function loadSalariesPage() {

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


        const month =
            monthToLocalDate(
                selectedMonth
            );


        salaries =
            await getTeacherSalariesByMonth(
                month
            );


        if (!Array.isArray(salaries)) {
            salaries = [];
        }


        filteredSalaries =
            [...salaries];


        renderSalariesPage(
            selectedMonth
        );

    } catch (error) {

        console.error(
            "Salaries loading error:",
            error
        );

        handleAccountingError(
            error
        );

        showErrorState(
            content,
            "Ustozlar oyligini yuklab bo‘lmadi"
        );
    }
}


// =========================================================
// RENDER
// =========================================================

function renderSalariesPage(
    selectedMonth
) {

    const content =
        $("#accountingContent");

    if (!content) {
        return;
    }


    const list =
        Array.isArray(salaries)
            ? salaries
            : [];


    filteredSalaries =
        [...list];


    const paidTotal =
        list
            .filter(
                salary =>
                    salary.status === "PAID"
            )
            .reduce(
                (
                    total,
                    salary
                ) =>
                    total +
                    Number(
                        salary.amount || 0
                    ),
                0
            );


    const unpaidCount =
        list.filter(
            salary =>
                salary.status === "UNPAID"
        ).length;


    content.innerHTML = `

<div class="accounting-page-toolbar">

    <div>

        <h2>
            Ustozlar oyligi
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
            id="salarySearch"
            class="accounting-search"
            placeholder="Ustoz qidirish..."
            autocomplete="off"
        >


        <select
            id="salaryStatusFilter"
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

        </select>


        <button
            type="button"
            class="accounting-btn export-excel"
            id="exportSalariesExcelBtn"
            title="Excel faylga chiqarish"
        >
            📊 Excel
        </button>


        <button
            type="button"
            class="accounting-btn export-pdf"
            id="exportSalariesPdfBtn"
            title="PDF faylga chiqarish"
        >
            📄 PDF
        </button>


        <button
            type="button"
            class="accounting-primary-btn"
            id="addSalaryBtn"
        >
            + Oylik qo‘shish
        </button>

    </div>

</div>


<div class="accounting-mini-stats">

    <div class="accounting-mini-stat">

        <span>
            To‘langan oylik
        </span>

        <strong>
            ${formatMoney(
        paidTotal
    )}
        </strong>

    </div>


    <div class="accounting-mini-stat danger">

        <span>
            Oyligi berilmagan
        </span>

        <strong>
            ${unpaidCount} ta
        </strong>

    </div>

</div>


<section class="accounting-panel">

    <div class="accounting-panel-header">

        <div>

            <h2>
                Oyliklar
            </h2>

            <p id="salariesCount">
                ${list.length} ta yozuv
            </p>

        </div>

    </div>


    <div class="accounting-table-wrapper">

        <table class="accounting-table">

            <thead>

                <tr>

                    <th>
                        Ustoz
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
                        Izoh
                    </th>

                    <th>
                        Amal
                    </th>

                </tr>

            </thead>


            <tbody id="salariesTableBody">
            </tbody>

        </table>

    </div>

</section>


<div
    id="salaryModalContainer"
></div>

    `;


    renderSalariesTable(
        filteredSalaries
    );

    setupSalaryEvents();
}


// =========================================================
// TABLE
// =========================================================

function renderSalariesTable(
    list
) {

    const tbody =
        $("#salariesTableBody");

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
                    Ushbu oy uchun oylik yozuvlari mavjud emas.
                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        list.map(
            salary => `

<tr>

    <td>

        <div class="table-person">

            <div class="table-avatar teacher-avatar">
                ${getInitials(
                salary.teacherName
            )}
            </div>

            <strong>
                ${escapeHtml(
                salary.teacherName ||
                "Noma’lum"
            )}
            </strong>

        </div>

    </td>


    <td>
        ${formatMonth(
                salary.salaryMonth
            )}
    </td>


    <td>

        <strong>
            ${formatMoney(
                salary.amount
            )}
        </strong>

    </td>


    <td>
        ${formatDate(
                salary.paidDate
            )}
    </td>


    <td>

        <span
            class="status-badge ${getStatusClass(
                salary.status
            )}"
        >
            ${getSalaryStatusText(
                salary.status
            )}
        </span>

    </td>


    <td>
        ${escapeHtml(
                salary.description ||
                "—"
            )}
    </td>


    <td>

        <div class="table-actions">

            <button
                type="button"
                class="table-action-btn edit"
                data-edit-salary="${salary.id}"
                title="Tahrirlash"
            >
                ✎
            </button>


            <button
                type="button"
                class="table-action-btn delete"
                data-delete-salary="${salary.id}"
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

function setupSalaryEvents() {

    // -----------------------------------------------------
    // ADD
    // -----------------------------------------------------

    $("#addSalaryBtn")
        ?.addEventListener(
            "click",
            () => {

                editingSalaryId = null;

                openSalaryModal();

            }
        );


    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

    $("#salarySearch")
        ?.addEventListener(
            "input",
            filterSalaries
        );


    // -----------------------------------------------------
    // STATUS FILTER
    // -----------------------------------------------------

    $("#salaryStatusFilter")
        ?.addEventListener(
            "change",
            filterSalaries
        );


    // -----------------------------------------------------
    // EXCEL
    // -----------------------------------------------------

    $("#exportSalariesExcelBtn")
        ?.addEventListener(
            "click",
            handleSalariesExcelExport
        );


    // -----------------------------------------------------
    // PDF
    // -----------------------------------------------------

    $("#exportSalariesPdfBtn")
        ?.addEventListener(
            "click",
            handleSalariesPdfExport
        );


    // -----------------------------------------------------
    // TABLE
    // -----------------------------------------------------

    $("#salariesTableBody")
        ?.addEventListener(
            "click",
            handleSalaryTableClick
        );
}


// =========================================================
// EXCEL EXPORT
// =========================================================

function handleSalariesExcelExport() {

    if (!filteredSalaries.length) {

        showToast(
            "Excelga chiqarish uchun ma'lumot yo‘q.",
            "warning"
        );

        return;
    }


    const selectedMonth =
        $("#accountingMonth")?.value || "";


    try {

        exportSalariesExcel(
            filteredSalaries,
            selectedMonth,
            formatMoney
        );


        showToast(
            "Excel fayl tayyorlandi.",
            "success"
        );

    } catch (error) {

        console.error(
            "Salaries Excel export error:",
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

function handleSalariesPdfExport() {

    if (!filteredSalaries.length) {

        showToast(
            "PDFga chiqarish uchun ma'lumot yo‘q.",
            "warning"
        );

        return;
    }


    const selectedMonth =
        $("#accountingMonth")?.value || "";


    try {

        exportSalariesPdf(
            filteredSalaries,
            selectedMonth,
            formatMoney
        );


        showToast(
            "PDF fayl tayyorlandi.",
            "success"
        );

    } catch (error) {

        console.error(
            "Salaries PDF export error:",
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

async function handleSalaryTableClick(
    event
) {

    const editButton =
        event.target.closest(
            "[data-edit-salary]"
        );


    if (editButton) {

        const id =
            Number(
                editButton.dataset.editSalary
            );


        const salary =
            salaries.find(
                item =>
                    Number(item.id) === id
            );


        if (salary) {

            editingSalaryId =
                id;


            openSalaryModal(
                salary
            );
        }


        return;
    }


    const deleteButton =
        event.target.closest(
            "[data-delete-salary]"
        );


    if (deleteButton) {

        const id =
            Number(
                deleteButton.dataset.deleteSalary
            );


        await handleDeleteSalary(
            id
        );
    }
}


// =========================================================
// FILTER
// =========================================================

function filterSalaries() {

    const search =
        ($("#salarySearch")?.value || "")
            .trim()
            .toLowerCase();


    const status =
        $("#salaryStatusFilter")?.value ||
        "ALL";


    filteredSalaries =
        salaries.filter(
            salary => {

                const teacherName =
                    String(
                        salary.teacherName || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    teacherName.includes(
                        search
                    );


                const matchesStatus =
                    status === "ALL" ||
                    String(
                        salary.status || ""
                    ).toUpperCase() === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    renderSalariesTable(
        filteredSalaries
    );


    const count =
        $("#salariesCount");


    if (count) {

        count.textContent =
            `${filteredSalaries.length} ta yozuv`;
    }
}


// =========================================================
// MODAL
// =========================================================

function openSalaryModal(
    salary = null
) {

    const container =
        $("#salaryModalContainer");


    if (!container) {
        return;
    }


    const isEdit =
        Boolean(salary);


    const selectedMonth =
        $("#accountingMonth")?.value || "";


    container.innerHTML = `

<div class="accounting-modal-backdrop">

    <div class="accounting-modal">

        <div class="accounting-modal-header">

            <div>

                <h2>
                    ${
        isEdit
            ? "Oylikni tahrirlash"
            : "Yangi oylik"
    }
                </h2>

                <p>
                    Ustoz oyligi ma’lumotlarini kiriting
                </p>

            </div>


            <button
                type="button"
                class="accounting-modal-close"
                id="closeSalaryModal"
            >
                ×
            </button>

        </div>


        <form
            id="salaryForm"
            class="accounting-form"
        >

            ${
        !isEdit
            ? `

                        <div class="form-group">

                            <label>
                                Ustoz
                            </label>

                            <div
                                class="salary-teacher-picker"
                                id="salaryTeacherPicker"
                            >

                                <input
                                    type="search"
                                    id="salaryTeacherSearch"
                                    class="accounting-search"
                                    placeholder="Ustozni qidirish..."
                                    autocomplete="off"
                                >

                                <select
                                    id="salaryTeacherId"
                                    class="accounting-select"
                                    required
                                >

                                    <option value="">
                                        Ustozlar yuklanmoqda...
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div class="form-group">

                            <label>
                                Oylik oyi
                            </label>

                            <input
                                type="month"
                                id="salaryMonth"
                                required
                                value="${selectedMonth}"
                            >

                        </div>

                    `
            : `

                        <div class="form-group">

                            <label>
                                Ustoz
                            </label>

                            <input
                                type="text"
                                disabled
                                value="${escapeHtml(
                salary.teacherName ||
                "Noma’lum"
            )}"
                            >

                        </div>

                    `
    }


            <div class="form-group">

                <label>
                    Oylik miqdori
                </label>

                <input
                    type="number"
                    id="salaryAmount"
                    required
                    min="1"
                    step="0.01"
                    placeholder="3000000"
                    value="${
        salary?.amount ??
        ""
    }"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>
                        To‘langan sana
                    </label>

                    <input
                        type="date"
                        id="salaryPaidDate"
                        value="${
        salary?.paidDate ??
        ""
    }"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Holat
                    </label>

                    <select
                        id="salaryStatus"
                        required
                    >

                        <option
                            value="UNPAID"
                            ${
        salary?.status === "UNPAID"
            ? "selected"
            : ""
    }
                        >
                            To‘lanmagan
                        </option>


                        <option
                            value="PAID"
                            ${
        salary?.status === "PAID"
            ? "selected"
            : ""
    }
                        >
                            To‘langan
                        </option>

                    </select>

                </div>

            </div>


            <div class="form-group">

                <label>
                    Izoh
                </label>

                <textarea
                    id="salaryDescription"
                    rows="3"
                    placeholder="Qo‘shimcha izoh..."
                >${escapeHtml(
        salary?.description || ""
    )}</textarea>

            </div>


            <div class="accounting-modal-footer">

                <button
                    type="button"
                    class="accounting-secondary-btn"
                    id="cancelSalaryModal"
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
            : "Oylik qo‘shish"
    }
                </button>

            </div>

        </form>

    </div>

</div>

`;


    $("#closeSalaryModal")
        ?.addEventListener(
            "click",
            closeSalaryModal
        );


    $("#cancelSalaryModal")
        ?.addEventListener(
            "click",
            closeSalaryModal
        );


    $("#salaryForm")
        ?.addEventListener(
            "submit",
            handleSalarySubmit
        );


    if (!isEdit) {

        loadSalaryTeachers();
    }
}


// =========================================================
// LOAD TEACHERS FOR SALARY
// =========================================================

async function loadSalaryTeachers() {

    const select =
        $("#salaryTeacherId");


    if (!select) {
        return;
    }


    try {

        const teachers =
            await api(
                "/api/user?page=0&size=100"
            ) || [];


        salaryTeachers =
            Array.isArray(teachers)
                ? teachers.filter(
                    teacher =>
                        teacher.isActive !== false
                )
                : [];


        if (!salaryTeachers.length) {

            select.innerHTML = `
                <option value="">
                    Faol ustozlar topilmadi
                </option>
            `;

            return;
        }


        renderSalaryTeachers(
            salaryTeachers
        );


        setupSalaryTeacherSearch();


    } catch (error) {

        console.error(
            "Salary teachers loading error:",
            error
        );


        select.innerHTML = `
            <option value="">
                Ustozlarni yuklab bo‘lmadi
            </option>
        `;


        showToast(
            "Ustozlar ro‘yxatini yuklab bo‘lmadi",
            "error"
        );
    }
}


// =========================================================
// RENDER TEACHERS
// =========================================================

function renderSalaryTeachers(
    teachers
) {

    const select =
        $("#salaryTeacherId");


    if (!select) {
        return;
    }


    if (!teachers.length) {

        select.innerHTML = `
            <option value="">
                Ustoz topilmadi
            </option>
        `;

        return;
    }


    select.innerHTML = `

        <option value="">
            Ustozni tanlang
        </option>

        ${
        teachers
            .map(
                teacher => {

                    const fullName =
                        [
                            teacher.firstName,
                            teacher.lastName
                        ]
                            .filter(Boolean)
                            .join(" ");


                    return `
                            <option
                                value="${teacher.id}"
                            >
                                ${escapeHtml(
                        fullName ||
                        `Ustoz #${teacher.id}`
                    )}
                            </option>
                        `;
                }
            )
            .join("")
    }

    `;
}


// =========================================================
// CLOSE
// =========================================================

function closeSalaryModal() {

    const container =
        $("#salaryModalContainer");


    if (container) {

        container.innerHTML = "";
    }


    editingSalaryId = null;
}


// =========================================================
// SUBMIT
// =========================================================

async function handleSalarySubmit(
    event
) {

    event.preventDefault();


    const amount =
        Number(
            $("#salaryAmount")?.value
        );


    const paidDate =
        $("#salaryPaidDate")?.value ||
        null;


    const status =
        $("#salaryStatus")?.value;


    const description =
        $("#salaryDescription")?.value
            ?.trim() || null;


    if (!amount || amount <= 0) {

        showToast(
            "Oylik miqdorini kiriting",
            "warning"
        );

        return;
    }


    try {

        // =================================================
        // UPDATE
        // =================================================

        if (editingSalaryId) {

            await updateTeacherSalary(
                editingSalaryId,
                {
                    amount,
                    paidDate,
                    status,
                    description
                }
            );


            showToast(
                "Oylik muvaffaqiyatli yangilandi",
                "success"
            );

        }

            // =================================================
            // CREATE
        // =================================================

        else {

            const teacherId =
                Number(
                    $("#salaryTeacherId")?.value
                );


            const monthInput =
                $("#salaryMonth")?.value;


            if (!teacherId) {

                showToast(
                    "Ustozni tanlang",
                    "warning"
                );

                return;
            }


            if (!monthInput) {

                showToast(
                    "Oylik oyini tanlang",
                    "warning"
                );

                return;
            }


            const result =
                await createTeacherSalary(
                    {
                        teacherId,

                        salaryMonth:
                            monthToLocalDate(
                                monthInput
                            ),

                        amount,

                        paidDate,

                        status,

                        description
                    }
                );


            if (result?.alreadyExists) {

                showToast(
                    "Bu ustoz uchun ushbu oyga oylik allaqachon mavjud",
                    "error"
                );

                return;
            }


            showToast(
                "Oylik muvaffaqiyatli qo‘shildi",
                "success"
            );
        }


        closeSalaryModal();


        await loadSalariesPage();


        window.dispatchEvent(
            new CustomEvent(
                "accounting:dashboard-refresh"
            )
        );


    } catch (error) {

        console.error(
            "Salary save error:",
            error
        );


        handleAccountingError(
            error
        );
    }
}


// =========================================================
// TEACHER SEARCH
// =========================================================

function setupSalaryTeacherSearch() {

    const search =
        $("#salaryTeacherSearch");


    if (!search) {
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
                salaryTeachers.filter(
                    teacher => {

                        const firstName =
                            String(
                                teacher.firstName || ""
                            )
                                .toLowerCase();


                        const lastName =
                            String(
                                teacher.lastName || ""
                            )
                                .toLowerCase();


                        const fullName =
                            `${firstName} ${lastName}`;


                        return (
                            !query ||
                            firstName.includes(query) ||
                            lastName.includes(query) ||
                            fullName.includes(query)
                        );
                    }
                );


            renderSalaryTeachers(
                filtered
            );
        }
    );
}


// =========================================================
// DELETE
// =========================================================

async function handleDeleteSalary(
    id
) {

    const confirmed =
        confirmDelete(
            "Ushbu oylik yozuvini o‘chirmoqchimisiz?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteTeacherSalary(
            id
        );


        showToast(
            "Oylik yozuvi o‘chirildi",
            "success"
        );


        await loadSalariesPage();


        window.dispatchEvent(
            new CustomEvent(
                "accounting:dashboard-refresh"
            )
        );


    } catch (error) {

        console.error(
            "Salary delete error:",
            error
        );


        handleAccountingError(
            error
        );
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
    "accounting:salaries-refresh",
    () => {

        loadSalariesPage();

    }
);