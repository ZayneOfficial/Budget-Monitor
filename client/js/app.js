const form = document.getElementById("transactionForm");
const formSubmitButton = form.querySelector("button[type='submit']");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("filterCategory");
const typeFilter = document.getElementById("filterType");
const monthFilter = document.getElementById("filterMonth");
const statusMessage = document.getElementById("appStatus");
const tableBody = document.getElementById("transactionTable");

let transactions = [];
let editingId = null;

function localDateParts(date = new Date()) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return { month: `${date.getFullYear()}-${month}`, date: `${date.getFullYear()}-${month}-${day}` };
}

function showStatus(message, isError = false) {
	statusMessage.textContent = message;
	statusMessage.classList.toggle("error", isError);
}

function getVisibleTransactions() {
	return filterTransactions(transactions, {
		search: searchInput.value,
		category: categoryFilter.value,
		type: typeFilter.value,
		month: monthFilter.value
	});
}

function render() {
	const visibleTransactions = getVisibleTransactions();
	updateSummary(visibleTransactions);
	renderTransactions(visibleTransactions, tableBody, beginEdit, removeTransaction);
	updateChart(visibleTransactions);
}

async function loadTransactions() {
	try {
		transactions = await getTransactions();
		updateCategoryOptions(transactions, categoryFilter);
		render();
		showStatus("");
	} catch (error) {
		showStatus(error.message || "Could not load transactions.", true);
	}
}

function beginEdit(transaction) {
	document.getElementById("name").value = transaction.name;
	document.getElementById("category").value = transaction.category;
	document.getElementById("amount").value = transaction.amount;
	document.getElementById("type").value = transaction.type;
	document.getElementById("transaction_date").value = String(transaction.transaction_date).slice(0, 10);
	editingId = transaction.id;
	formSubmitButton.textContent = "Update Transaction";
	document.getElementById("name").focus();
}

async function removeTransaction(transaction) {
	if (!window.confirm(`Delete "${transaction.name}"?`)) {
		return;
	}

	try {
		const result = await deleteTransactionAPI(transaction.id);
		await loadTransactions();
		showStatus(result.message);
	} catch (error) {
		showStatus(error.message || "Could not delete the transaction.", true);
	}
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const transaction = {
		name: document.getElementById("name").value.trim(),
		category: document.getElementById("category").value.trim(),
		amount: Number(document.getElementById("amount").value),
		type: document.getElementById("type").value,
		transaction_date: document.getElementById("transaction_date").value
	};

	try {
		const result = editingId
			? await updateTransaction(editingId, transaction)
			: await createTransaction(transaction);
		form.reset();
		editingId = null;
		formSubmitButton.textContent = "Add Transaction";
		await loadTransactions();
		showStatus(result.message);
	} catch (error) {
		showStatus(error.message || "Could not save the transaction.", true);
	}
});

[searchInput, categoryFilter, typeFilter, monthFilter].forEach((filter) => {
	filter.addEventListener(filter === searchInput ? "input" : "change", render);
});

const today = localDateParts();
monthFilter.value = today.month;
document.getElementById("transaction_date").value = today.date;
void loadTransactions();
