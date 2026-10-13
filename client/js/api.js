const API_URL = "/api/transactions";
const AUTH_URL = "/api/auth";

async function requestJSON(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(result.error || `Request failed (${response.status}).`);
        error.status = response.status;
        throw error;
    }

    return result;
}

async function getCurrentUser() {
    try {
        return (await requestJSON(`${AUTH_URL}/me`)).user;
    } catch (error) {
        if (error.status === 401) {
            return null;
        }
        throw error;
    }
}

async function authenticate(action, credentials) {
    return requestJSON(`${AUTH_URL}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    });
}

async function logout() {
    return requestJSON(`${AUTH_URL}/logout`, { method: "POST" });
}

async function getTransactions() {
    return requestJSON(API_URL);
}

async function createTransaction(transaction) {
    return requestJSON(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
    });
}

async function updateTransaction(id, transaction) {
    return requestJSON(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
    });
}

async function deleteTransactionAPI(id) {
    return requestJSON(`${API_URL}/${id}`, { method: "DELETE" });
}