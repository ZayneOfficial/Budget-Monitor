const API_URL = "/api/transactions";

async function requestJSON(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status}).`);
    }

    return result;
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