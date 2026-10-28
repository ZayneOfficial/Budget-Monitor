function filterTransactions(transactions, filters) {
	const search = filters.search.trim().toLowerCase();

	return transactions.filter((transaction) => {
		const transactionDate = String(transaction.transaction_date).slice(0, 10);
		const matchesSearch = `${transaction.name} ${transaction.category}`
			.toLowerCase()
			.includes(search);
		const matchesCategory = !filters.category || transaction.category === filters.category;
		const matchesType = !filters.type || transaction.type === filters.type;
		const matchesMonth = !filters.month || transactionDate.startsWith(filters.month);

		return matchesSearch && matchesCategory && matchesType && matchesMonth;
	});
}

function getTransactionMonths(transactions, currentMonth, selectedMonth = "") {
	const months = new Set([currentMonth, selectedMonth].filter(Boolean));
	transactions.forEach((transaction) => {
		const month = String(transaction.transaction_date).slice(0, 7);
		if (/^\d{4}-\d{2}$/.test(month)) {
			months.add(month);
		}
	});

	return [...months].sort((left, right) => right.localeCompare(left));
}

function summarizeTransactions(transactions) {
	return transactions.reduce((summary, transaction) => {
		if (transaction.type === "income") {
			summary.income += Number(transaction.amount);
		} else {
			summary.expense += Number(transaction.amount);
		}
		return summary;
	}, { income: 0, expense: 0 });
}

function updateCategoryOptions(transactions, select) {
	const selectedCategory = select.value;
	const categories = [...new Set(transactions.map((transaction) => transaction.category))]
		.filter(Boolean)
		.sort((left, right) => left.localeCompare(right));
	const options = [new Option("All categories", "")];

	categories.forEach((category) => options.push(new Option(category, category)));
	select.replaceChildren(...options);

	if (categories.includes(selectedCategory)) {
		select.value = selectedCategory;
	}
}

if (typeof module !== "undefined") {
	module.exports = { filterTransactions, getTransactionMonths, summarizeTransactions };
}
