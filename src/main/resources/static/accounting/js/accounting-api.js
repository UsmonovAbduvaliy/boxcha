// =========================================================
// BOXCHA — ACCOUNTING API
// =========================================================
// Barcha Accounting backend requestlari shu faylda.
// UI / DOM logikasi bu faylda bo'lmaydi.
// =========================================================


// =========================================================
// BASE URL
// =========================================================

const API_BASE_URL = "/api/accounting";


// =========================================================
// TOKEN
// =========================================================

function getToken() {

    const possibleKeys = [
        "accessToken",
        "token",
        "access_token"
    ];

    for (const key of possibleKeys) {

        const value = localStorage.getItem(key);

        if (value && value.trim()) {

            return value
                .replace(/^Bearer\s+/i, "")
                .trim();
        }
    }

    return null;
}


// =========================================================
// AUTH FETCH
// =========================================================

async function fetchWithAuth(
    url,
    options = {}
) {

    const token = getToken();

    const headers = {
        ...(options.headers || {})
    };

    if (!headers["Content-Type"] && options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
        url,
        {
            ...options,
            headers
        }
    );


    // =====================================================
    // UNAUTHORIZED
    // =====================================================

    if (response.status === 401) {

        console.error(
            "Accounting API: 401 Unauthorized"
        );

        throw new Error(
            "AUTH_REQUIRED"
        );
    }


    // =====================================================
    // FORBIDDEN
    // =====================================================

    if (response.status === 403) {

        console.error(
            "Accounting API: 403 Forbidden"
        );

        throw new Error(
            "ACCESS_DENIED"
        );
    }


    // =====================================================
    // NOT FOUND
    // =====================================================

    if (response.status === 404) {

        console.error(
            "Accounting API: 404 Not Found",
            url
        );

        throw new Error(
            "NOT_FOUND"
        );
    }


    // =====================================================
    // DELETE / EMPTY RESPONSE
    // =====================================================

    if (response.status === 204) {
        return null;
    }


    // =====================================================
    // ERROR RESPONSE
    // =====================================================

    if (!response.ok) {

        let errorMessage =
            `Request failed: ${response.status}`;

        try {

            const text =
                await response.text();

            if (text) {
                errorMessage = text;
            }

        } catch (error) {

            console.error(
                "Error reading API error:",
                error
            );
        }

        throw new Error(
            errorMessage
        );
    }


    // =====================================================
    // RESPONSE JSON
    // =====================================================

    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        return await response.json();
    }


    // Empty / text response

    return null;
}


// =========================================================
// DASHBOARD
// =========================================================

export async function getAccountingDashboard(
    month
) {

    if (!month) {
        throw new Error(
            "Month is required"
        );
    }

    const url =
        `${API_BASE_URL}/dashboard?month=${encodeURIComponent(month)}`;

    return await fetchWithAuth(
        url
    );
}


// =========================================================
// CHILD PAYMENTS
// =========================================================


// GET ALL

export async function getChildPayments() {

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments`
    );
}


// GET BY ID

export async function getChildPaymentById(
    id
) {

    if (!id) {
        throw new Error(
            "Payment ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments/${id}`
    );
}


// GET BY CHILD

export async function getChildPaymentsByChildId(
    childId
) {

    if (!childId) {
        throw new Error(
            "Child ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments/child/${childId}`
    );
}


// GET BY MONTH

export async function getChildPaymentsByMonth(
    month
) {

    if (!month) {
        throw new Error(
            "Month is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments/month?month=${encodeURIComponent(month)}`
    );
}


// GET BY STATUS

export async function getChildPaymentsByStatus(
    status
) {

    if (!status) {
        throw new Error(
            "Payment status is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments/status?status=${encodeURIComponent(status)}`
    );
}


// CREATE

export async function createChildPayment(
    data
) {

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments`,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}


// UPDATE

export async function updateChildPayment(
    id,
    data
) {

    if (!id) {
        throw new Error(
            "Payment ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
}


// DELETE

export async function deleteChildPayment(
    id
) {

    if (!id) {
        throw new Error(
            "Payment ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/child-payments/${id}`,
        {
            method: "DELETE"
        }
    );
}


// =========================================================
// TEACHER SALARIES
// =========================================================


// GET ALL

export async function getTeacherSalaries() {

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries`
    );
}


// GET BY ID

export async function getTeacherSalaryById(
    id
) {

    if (!id) {
        throw new Error(
            "Salary ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries/${id}`
    );
}


// GET BY TEACHER

export async function getTeacherSalariesByTeacherId(
    teacherId
) {

    if (!teacherId) {
        throw new Error(
            "Teacher ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries/teacher/${teacherId}`
    );
}


// GET BY MONTH

export async function getTeacherSalariesByMonth(
    month
) {

    if (!month) {
        throw new Error(
            "Month is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries/month?month=${encodeURIComponent(month)}`
    );
}


// GET BY STATUS

export async function getTeacherSalariesByStatus(
    status
) {

    if (!status) {
        throw new Error(
            "Salary status is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries/status?status=${encodeURIComponent(status)}`
    );
}


// CREATE

export async function createTeacherSalary(
    data
) {

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries`,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}


// UPDATE

export async function updateTeacherSalary(
    id,
    data
) {

    if (!id) {
        throw new Error(
            "Salary ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
}


// DELETE

export async function deleteTeacherSalary(
    id
) {

    if (!id) {
        throw new Error(
            "Salary ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/teacher-salaries/${id}`,
        {
            method: "DELETE"
        }
    );
}


// =========================================================
// EXPENSES
// =========================================================


// GET ALL

export async function getExpenses() {

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses`
    );
}


// GET BY ID

export async function getExpenseById(
    id
) {

    if (!id) {
        throw new Error(
            "Expense ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses/${id}`
    );
}


// GET BY DATE

export async function getExpensesByDate(
    date
) {

    if (!date) {
        throw new Error(
            "Date is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses/date?date=${encodeURIComponent(date)}`
    );
}


// GET BETWEEN DATES

export async function getExpensesBetween(
    startDate,
    endDate
) {

    if (!startDate || !endDate) {
        throw new Error(
            "Start date and end date are required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses/between?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
}


// GET BY CATEGORY

export async function getExpensesByCategory(
    category
) {

    if (!category) {
        throw new Error(
            "Expense category is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses/category?category=${encodeURIComponent(category)}`
    );
}


// CREATE

export async function createExpense(
    data
) {

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses`,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}


// UPDATE

export async function updateExpense(
    id,
    data
) {

    if (!id) {
        throw new Error(
            "Expense ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
}


// DELETE

export async function deleteExpense(
    id
) {

    if (!id) {
        throw new Error(
            "Expense ID is required"
        );
    }

    return await fetchWithAuth(
        `${API_BASE_URL}/expenses/${id}`,
        {
            method: "DELETE"
        }
    );
}
// =========================================================
// GROUP STATISTICS
// =========================================================

export async function getGroupStatistics(
    groupId,
    month
) {

    if (!groupId) {
        throw new Error(
            "Group ID is required"
        );
    }


    if (!month) {
        throw new Error(
            "Month is required"
        );
    }


    return await fetchWithAuth(
        `${API_BASE_URL}/group-statistics/${groupId}?month=${encodeURIComponent(month)}`
    );
}