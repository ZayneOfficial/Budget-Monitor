const currencyFormatter = new Intl.NumberFormat("en-ZA", {
	style: "currency",
	currency: "ZAR"
});

function updateSummary(transactions) {
	const totals = transactions.reduce((summary, transaction) => {
		const amount = Number(transaction.amount);
		if (transaction.type === "income") {
			summary.income += amount;
		} else {
			summary.expense += amount;
		}
		return summary;
	}, { income: 0, expense: 0 });

	document.getElementById("totalIncome").textContent = currencyFormatter.format(totals.income);
	document.getElementById("totalExpense").textContent = currencyFormatter.format(totals.expense);
	document.getElementById("balance").textContent = currencyFormatter.format(totals.income - totals.expense);
}

function formatTransactionDate(value) {
	const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
	return Number.isNaN(date.getTime())
		? String(value)
		: new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function renderTransactions(transactions, tableBody, onEdit, onDelete) {
	tableBody.replaceChildren();

	if (transactions.length === 0) {
		const row = tableBody.insertRow();
		const cell = row.insertCell();
		cell.colSpan = 6;
		cell.textContent = "No transactions match these filters.";
		return;
	}

	transactions.forEach((transaction) => {
		const row = tableBody.insertRow();
		[
			transaction.name,
			transaction.category,
			currencyFormatter.format(Number(transaction.amount)),
			transaction.type,
			formatTransactionDate(transaction.transaction_date)
		].forEach((value) => {
			row.insertCell().textContent = value;
		});

		const actions = row.insertCell();
		actions.className = "actions";

		const editButton = document.createElement("button");
		editButton.type = "button";
		editButton.className = "edit-btn";
		editButton.textContent = "Edit";
		editButton.setAttribute("aria-label", `Edit ${transaction.name}`);
		editButton.addEventListener("click", () => onEdit(transaction));

		const deleteButton = document.createElement("button");
		deleteButton.type = "button";
		deleteButton.className = "delete-btn";
		deleteButton.textContent = "Delete";
		deleteButton.setAttribute("aria-label", `Delete ${transaction.name}`);
		deleteButton.addEventListener("click", () => onDelete(transaction));

		actions.append(editButton, deleteButton);
	});
}
