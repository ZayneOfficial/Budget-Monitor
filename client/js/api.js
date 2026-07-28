const API_URL = "http://localhost:3000/api/transactions";

async function getTransactions() {
    const response = await fetch(API_URL);
    return await response.json();
}

async function createTransaction(transaction) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transaction)
    });

    return await response.json();
}

async function updateTransaction(id, transaction) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transaction)
    });

    return await response.json();
}

async function deleteTransactionAPI(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    return await response.json();
}