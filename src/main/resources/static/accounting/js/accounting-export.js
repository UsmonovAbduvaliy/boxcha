/* =========================================================
   BOXCHA ACCOUNTING
   ACCOUNTING-EXPORT.JS
   Excel + PDF Export
   ========================================================= */


/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Fayl nomini xavfsiz qilish
 */
function cleanFileName(value) {
    return String(value || "")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase()
        .trim();
}


/**
 * PDF uchun xavfsiz text
 *
 * jsPDF Helvetica ba'zi Unicode belgilarini
 * to'g'ri ko'rsatmasligi mumkin.
 */
function pdfSafeText(value) {
    return String(value ?? "")
        .replace(/[‘’ʻʼ]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/№/g, "No");
}


/**
 * Rasxod kategoriyasi
 *
 * accounting-expenses.js dan alohida
 * funksiya import qilish shart emas.
 */
function getExpenseCategoryTextSafe(category) {

    const map = {
        FOOD: "Oziq-ovqat",
        OFFICE_SUPPLIES: "Kanselyariya",
        MEDICINE: "Dori-darmon",
        CLEANING: "Tozalash",
        EQUIPMENT: "Jihozlar",
        REPAIR: "Ta'mirlash",
        UTILITIES: "Kommunal",
        TRANSPORT: "Transport",
        OTHER: "Boshqa"
    };

    return map[String(category || "").toUpperCase()] || "Boshqa";
}


/**
 * Browser orqali Blob yuklash
 */
function downloadBlob(blob, filename) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}


/* =========================================================
   EXCEL EXPORT
   ========================================================= */

/**
 * Universal Excel export
 *
 * @param {Object} options
 */
export function exportToExcel({
                                  filename,
                                  sheetName = "Sheet1",
                                  title = "",
                                  subtitle = "",
                                  headers = [],
                                  rows = [],
                                  totalLabel = "",
                                  totalValue = ""
                              }) {

    if (!window.XLSX) {

        alert(
            "Excel kutubxonasi yuklanmagan.\n\n" +
            "xlsx.full.min.js fayli index.html ga ulanganini tekshiring."
        );

        return;
    }


    /* -----------------------------------------------------
       DATA
       ----------------------------------------------------- */

    const data = [];


    // Title
    if (title) {
        data.push([title]);
    }


    // Subtitle
    if (subtitle) {
        data.push([subtitle]);
    }


    // Empty row
    if (title || subtitle) {
        data.push([]);
    }


    // Headers
    data.push(headers);


    // Rows
    data.push(...rows);


    // Total
    if (totalLabel) {

        data.push([]);

        data.push([
            totalLabel,
            totalValue
        ]);
    }


    /* -----------------------------------------------------
       WORKSHEET
       ----------------------------------------------------- */

    const worksheet =
        XLSX.utils.aoa_to_sheet(data);


    /* -----------------------------------------------------
       COLUMN WIDTHS
       ----------------------------------------------------- */

    worksheet["!cols"] = headers.map(
        (header, index) => {

            let maxLength =
                String(header ?? "").length;


            rows.forEach(row => {

                const value = row[index];

                if (
                    value !== undefined &&
                    value !== null
                ) {

                    maxLength = Math.max(
                        maxLength,
                        String(value).length
                    );
                }
            });


            return {
                wch: Math.min(
                    Math.max(maxLength + 2, 12),
                    40
                )
            };
        }
    );


    /* -----------------------------------------------------
       TITLE MERGE
       ----------------------------------------------------- */

    if (title) {

        const lastColumn =
            Math.max(headers.length - 1, 0);


        worksheet["!merges"] = [
            {
                s: {
                    r: 0,
                    c: 0
                },

                e: {
                    r: 0,
                    c: lastColumn
                }
            }
        ];
    }


    /* -----------------------------------------------------
       WORKBOOK
       ----------------------------------------------------- */

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        String(sheetName || "Sheet1")
            .substring(0, 31)
    );


    /* -----------------------------------------------------
       WRITE FILE
       ----------------------------------------------------- */

    XLSX.writeFile(
        workbook,
        filename
    );
}


/* =========================================================
   PDF EXPORT
   ========================================================= */

/**
 * Universal PDF export
 *
 * A4 Landscape
 */
export function exportToPdf({
                                filename,
                                title,
                                subtitle = "",
                                headers = [],
                                rows = [],
                                summary = []
                            }) {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF kutubxonasi yuklanmagan.\n\n" +
            "jspdf.umd.min.js fayli index.html ga ulanganini tekshiring."
        );

        return;
    }


    const { jsPDF } = window.jspdf;


    /* -----------------------------------------------------
       DOCUMENT
       ----------------------------------------------------- */

    const doc = new jsPDF({

        orientation: "landscape",

        unit: "mm",

        format: "a4"
    });


    /* -----------------------------------------------------
       TITLE
       ----------------------------------------------------- */

    const safeTitle =
        pdfSafeText(title);


    const safeSubtitle =
        pdfSafeText(subtitle);


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(18);


    doc.text(
        safeTitle,
        14,
        15
    );


    /* -----------------------------------------------------
       SUBTITLE
       ----------------------------------------------------- */

    if (safeSubtitle) {

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);

        doc.text(
            safeSubtitle,
            14,
            22
        );
    }


    /* -----------------------------------------------------
       GENERATED DATE
       ----------------------------------------------------- */

    const generatedText =
        `Yaratilgan: ${new Date().toLocaleString("uz-UZ")}`;


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);


    doc.text(
        pdfSafeText(generatedText),
        283,
        15,
        {
            align: "right"
        }
    );


    /* -----------------------------------------------------
       SAFE TABLE DATA
       ----------------------------------------------------- */

    const safeHeaders =
        headers.map(pdfSafeText);


    const safeRows =
        rows.map(row =>
            row.map(pdfSafeText)
        );


    const startY =
        safeSubtitle
            ? 28
            : 22;


    /* -----------------------------------------------------
       AUTOTABLE CHECK
       ----------------------------------------------------- */

    if (
        typeof doc.autoTable !== "function"
    ) {

        alert(
            "PDF jadval plagini yuklanmagan.\n\n" +
            "jspdf.plugin.autotable.min.js fayli index.html ga ulanganini tekshiring."
        );

        return;
    }


    /* -----------------------------------------------------
       TABLE
       ----------------------------------------------------- */

    doc.autoTable({

        head: [
            safeHeaders
        ],

        body: safeRows,

        startY,

        theme: "grid",

        styles: {

            font: "helvetica",

            fontSize: 8,

            cellPadding: 3,

            overflow: "linebreak",

            valign: "middle"
        },

        headStyles: {

            fontStyle: "bold",

            halign: "center"
        },

        bodyStyles: {

            valign: "middle"
        },

        alternateRowStyles: {

            fillColor: [
                245,
                247,
                250
            ]
        },

        margin: {

            left: 14,

            right: 14
        }
    });


    /* -----------------------------------------------------
       SUMMARY
       ----------------------------------------------------- */

    let finalY =
        doc.lastAutoTable?.finalY ||
        (startY + 10);


    if (summary.length) {

        finalY += 8;


        // Summary title
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(11);


        doc.text(
            "Hisobot:",
            14,
            finalY
        );


        finalY += 7;


        // Summary rows
        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);


        summary.forEach(item => {

            const label =
                pdfSafeText(item.label);


            const value =
                pdfSafeText(item.value);


            doc.text(
                `${label}: ${value}`,
                14,
                finalY
            );


            finalY += 6;
        });
    }


    /* -----------------------------------------------------
       SAVE
       ----------------------------------------------------- */

    doc.save(filename);
}


/* =========================================================
   PAYMENTS
   BOLALAR TO'LOVLARI
   ========================================================= */

/**
 * Bolalar to'lovlarini Excelga chiqarish
 */
export function exportPaymentsExcel(
    payments,
    selectedMonth,
    formatMoney
) {

    const safePayments =
        Array.isArray(payments)
            ? payments
            : [];


    /* -----------------------------------------------------
       ROWS
       ----------------------------------------------------- */

    const rows =
        safePayments.map(payment => [

            payment.childName || "-",

            payment.groupName || "-",

            payment.paymentMonth ||
            selectedMonth ||
            "-",

            formatMoney(
                payment.amount
            ),

            payment.paidDate || "-",

            payment.status || "-",

            payment.description || "-"
        ]);


    /* -----------------------------------------------------
       TOTAL
       ----------------------------------------------------- */

    const total =
        safePayments.reduce(
            (sum, payment) =>
                sum +
                Number(
                    payment.amount || 0
                ),
            0
        );


    /* -----------------------------------------------------
       EXPORT
       ----------------------------------------------------- */

    exportToExcel({

        filename:
            `boxcha-bolalar-tolovi-${cleanFileName(selectedMonth)}.xlsx`,

        sheetName:
            "Bolalar to'lovi",

        title:
            "BOXCHA - Bolalar to'lovi",

        subtitle:
            `Hisobot oyi: ${selectedMonth || "-"}`,

        headers: [

            "Bola",

            "Guruh",

            "Oy",

            "Summa",

            "To'langan sana",

            "Holat",

            "Izoh"
        ],

        rows,

        totalLabel:
            "Jami",

        totalValue:
            formatMoney(total)
    });
}


/**
 * Bolalar to'lovlarini PDFga chiqarish
 */
export function exportPaymentsPdf(
    payments,
    selectedMonth,
    formatMoney
) {

    const safePayments =
        Array.isArray(payments)
            ? payments
            : [];


    /* -----------------------------------------------------
       ROWS
       ----------------------------------------------------- */

    const rows =
        safePayments.map(payment => [

            payment.childName || "-",

            payment.groupName || "-",

            payment.paymentMonth ||
            selectedMonth ||
            "-",

            formatMoney(
                payment.amount
            ),

            payment.paidDate || "-",

            payment.status || "-",

            payment.description || "-"
        ]);


    /* -----------------------------------------------------
       TOTAL
       ----------------------------------------------------- */

    const total =
        safePayments.reduce(
            (sum, payment) =>
                sum +
                Number(
                    payment.amount || 0
                ),
            0
        );


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    const paid =
        safePayments.filter(
            payment =>
                String(
                    payment.status || ""
                ).toUpperCase() === "PAID"
        ).length;


    const unpaid =
        safePayments.filter(
            payment =>
                String(
                    payment.status || ""
                ).toUpperCase() === "UNPAID"
        ).length;


    /* -----------------------------------------------------
       EXPORT
       ----------------------------------------------------- */

    exportToPdf({

        filename:
            `boxcha-bolalar-tolovi-${cleanFileName(selectedMonth)}.pdf`,

        title:
            "BOXCHA - Bolalar to'lovi",

        subtitle:
            `Hisobot oyi: ${selectedMonth || "-"}`,

        headers: [

            "Bola",

            "Guruh",

            "Oy",

            "Summa",

            "To'langan sana",

            "Holat",

            "Izoh"
        ],

        rows,

        summary: [

            {
                label: "Jami summa",
                value: formatMoney(total)
            },

            {
                label: "To'langan",
                value: paid
            },

            {
                label: "To'lanmagan",
                value: unpaid
            }
        ]
    });
}


/* =========================================================
   SALARIES
   USTOZLAR OYLIKLARI
   ========================================================= */

/**
 * Ustozlar oyligini Excelga chiqarish
 */
export function exportSalariesExcel(
    salaries,
    selectedMonth,
    formatMoney
) {

    const safeSalaries =
        Array.isArray(salaries)
            ? salaries
            : [];


    /* -----------------------------------------------------
       ROWS
       ----------------------------------------------------- */

    const rows =
        safeSalaries.map(salary => [

            salary.teacherName || "-",

            salary.salaryMonth ||
            selectedMonth ||
            "-",

            formatMoney(
                salary.amount
            ),

            salary.paidDate || "-",

            salary.status || "-",

            salary.description || "-"
        ]);


    /* -----------------------------------------------------
       TOTAL
       ----------------------------------------------------- */

    const total =
        safeSalaries.reduce(
            (sum, salary) =>
                sum +
                Number(
                    salary.amount || 0
                ),
            0
        );


    /* -----------------------------------------------------
       EXPORT
       ----------------------------------------------------- */

    exportToExcel({

        filename:
            `boxcha-ustozlar-oyligi-${cleanFileName(selectedMonth)}.xlsx`,

        sheetName:
            "Ustozlar oyligi",

        title:
            "BOXCHA - Ustozlar oyligi",

        subtitle:
            `Hisobot oyi: ${selectedMonth || "-"}`,

        headers: [

            "Ustoz",

            "Oy",

            "Summa",

            "To'langan sana",

            "Holat",

            "Izoh"
        ],

        rows,

        totalLabel:
            "Jami",

        totalValue:
            formatMoney(total)
    });
}


/**
 * Ustozlar oyligini PDFga chiqarish
 */
export function exportSalariesPdf(
    salaries,
    selectedMonth,
    formatMoney
) {

    const safeSalaries =
        Array.isArray(salaries)
            ? salaries
            : [];


    /* -----------------------------------------------------
       ROWS
       ----------------------------------------------------- */

    const rows =
        safeSalaries.map(salary => [

            salary.teacherName || "-",

            salary.salaryMonth ||
            selectedMonth ||
            "-",

            formatMoney(
                salary.amount
            ),

            salary.paidDate || "-",

            salary.status || "-",

            salary.description || "-"
        ]);


    /* -----------------------------------------------------
       TOTAL
       ----------------------------------------------------- */

    const total =
        safeSalaries.reduce(
            (sum, salary) =>
                sum +
                Number(
                    salary.amount || 0
                ),
            0
        );


    /* -----------------------------------------------------
       STATUS
       ----------------------------------------------------- */

    const paid =
        safeSalaries.filter(
            salary =>
                String(
                    salary.status || ""
                ).toUpperCase() === "PAID"
        ).length;


    const unpaid =
        safeSalaries.filter(
            salary =>
                String(
                    salary.status || ""
                ).toUpperCase() === "UNPAID"
        ).length;


    /* -----------------------------------------------------
       EXPORT
       ----------------------------------------------------- */

    exportToPdf({

        filename:
            `boxcha-ustozlar-oyligi-${cleanFileName(selectedMonth)}.pdf`,

        title:
            "BOXCHA - Ustozlar oyligi",

        subtitle:
            `Hisobot oyi: ${selectedMonth || "-"}`,

        headers: [

            "Ustoz",

            "Oy",

            "Summa",

            "To'langan sana",

            "Holat",

            "Izoh"
        ],

        rows,

        summary: [

            {
                label: "Jami oylik",
                value: formatMoney(total)
            },

            {
                label: "To'langan",
                value: paid
            },

            {
                label: "To'lanmagan",
                value: unpaid
            }
        ]
    });
}


/* =========================================================
   EXPENSES
   RASXODLAR
   ========================================================= */

/**
 * Rasxodlarni Excelga chiqarish
 *
 * IMPORTANT:
 * accounting-expenses.js dan faqat:
 *
 * exportExpensesExcel(
 *     expenses,
 *     selectedMonth,
 *     formatMoney
 * );
 *
 * ko'rinishida chaqiriladi.
 */
export function exportExpensesExcel(
    expenses,
    selectedMonth,
    formatMoney
) {

    const safeExpenses =
        Array.isArray(expenses)
            ? expenses
            : [];


    /* -----------------------------------------------------
       ROWS
       ----------------------------------------------------- */

    const rows =
        safeExpenses.map(expense => [

            expense.title || "-",

            getExpenseCategoryTextSafe(
                expense.category
            ),

            formatMoney(
                expense.amount
            ),

            /*
             * MUHIM:
             * date emas,
             * expenseDate ishlatiladi.
             */
            expense.expenseDate || "-",

            expense.description || "-"
        ]);


    /* -----------------------------------------------------
       TOTAL
       ----------------------------------------------------- */

    const total =
        safeExpenses.reduce(
            (sum, expense) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    /* -----------------------------------------------------
       EXPORT
       ----------------------------------------------------- */

    exportToExcel({

        filename:
            `boxcha-rasxodlar-${cleanFileName(selectedMonth)}.xlsx`,

        sheetName:
            "Rasxodlar",

        title:
            "BOXCHA - Rasxodlar",

        subtitle:
            `Hisobot oyi: ${selectedMonth || "-"}`,

        headers: [

            "Nomi",

            "Kategoriya",

            "Summa",

            "Sana",

            "Izoh"
        ],

        rows,

        totalLabel:
            "Jami",

        totalValue:
            formatMoney(total)
    });
}


/**
 * Rasxodlarni PDFga chiqarish
 */
export function exportExpensesPdf(
    expenses,
    selectedMonth,
    formatMoney
) {

    const safeExpenses =
        Array.isArray(expenses)
            ? expenses
            : [];


    /* -----------------------------------------------------
       ROWS
       ----------------------------------------------------- */

    const rows =
        safeExpenses.map(expense => [

            expense.title || "-",

            getExpenseCategoryTextSafe(
                expense.category
            ),

            formatMoney(
                expense.amount
            ),

            /*
             * MUHIM:
             * date emas,
             * expenseDate ishlatiladi.
             */
            expense.expenseDate || "-",

            expense.description || "-"
        ]);


    /* -----------------------------------------------------
       TOTAL
       ----------------------------------------------------- */

    const total =
        safeExpenses.reduce(
            (sum, expense) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    /* -----------------------------------------------------
       CATEGORY STATISTICS
       ----------------------------------------------------- */

    const categoryTotals = {};


    safeExpenses.forEach(expense => {

        const category =
            getExpenseCategoryTextSafe(
                expense.category
            );


        const amount =
            Number(
                expense.amount || 0
            );


        categoryTotals[category] =
            (
                categoryTotals[category] || 0
            ) + amount;
    });


    /* -----------------------------------------------------
       SUMMARY
       ----------------------------------------------------- */

    const summary = [

        {
            label: "Jami rasxod",
            value: formatMoney(total)
        },

        {
            label: "Rasxodlar soni",
            value: safeExpenses.length
        }
    ];


    /*
     * Kategoriyalar bo'yicha jami
     */
    Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(
            ([category, amount]) => {

                summary.push({

                    label: category,

                    value: formatMoney(amount)
                });
            }
        );


    /* -----------------------------------------------------
       EXPORT
       ----------------------------------------------------- */

    exportToPdf({

        filename:
            `boxcha-rasxodlar-${cleanFileName(selectedMonth)}.pdf`,

        title:
            "BOXCHA - Rasxodlar",

        subtitle:
            `Hisobot oyi: ${selectedMonth || "-"}`,

        headers: [

            "Nomi",

            "Kategoriya",

            "Summa",

            "Sana",

            "Izoh"
        ],

        rows,

        summary
    });
}