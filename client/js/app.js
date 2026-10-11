const currencyFormatter = new Intl.NumberFormat("en-ZA", {
	style: "currency",
	currency: "ZAR"
});

function localDateParts(date = new Date()) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return {
		month: `${date.getFullYear()}-${month}`,
		date: `${date.getFullYear()}-${month}-${day}`
	};
}

function formatTransactionDate(value) {
	const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
	return Number.isNaN(date.getTime())
		? String(value)
		: new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function getDefaultFormState() {
	const today = localDateParts();
	return {
		name: "",
		category: "",
		amount: "",
		type: "income",
		transaction_date: today.date
	};
}

function App() {
	const [transactions, setTransactions] = React.useState([]);
	const [statusMessage, setStatusMessage] = React.useState("");
	const [statusError, setStatusError] = React.useState(false);
	const [editingId, setEditingId] = React.useState(null);
	const [search, setSearch] = React.useState("");
	const [categoryFilter, setCategoryFilter] = React.useState("");
	const [typeFilter, setTypeFilter] = React.useState("");
	const [monthFilter, setMonthFilter] = React.useState(localDateParts().month);
	const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem("theme") === "dark");
	const [formData, setFormData] = React.useState(getDefaultFormState());

	const categories = React.useMemo(() => {
		return [...new Set(transactions.map((transaction) => transaction.category).filter(Boolean))]
			.sort((left, right) => left.localeCompare(right));
	}, [transactions]);

	const visibleTransactions = React.useMemo(() => {
		return window.filterTransactions(transactions, {
			search,
			category: categoryFilter,
			type: typeFilter,
			month: monthFilter
		});
	}, [transactions, search, categoryFilter, typeFilter, monthFilter]);

	const summary = React.useMemo(() => {
		return visibleTransactions.reduce((totals, transaction) => {
			const amount = Number(transaction.amount);
			if (transaction.type === "income") {
				totals.income += amount;
			} else {
				totals.expense += amount;
			}
			return totals;
		}, { income: 0, expense: 0 });
	}, [visibleTransactions]);

	React.useEffect(() => {
		document.body.classList.toggle("dark", darkMode);
		localStorage.setItem("theme", darkMode ? "dark" : "light");
	}, [darkMode]);

	async function loadTransactions() {
		try {
			const data = await window.getTransactions();
			setTransactions(data);
			setStatusMessage("");
			setStatusError(false);
		} catch (error) {
			setStatusMessage(error.message || "Could not load transactions.");
			setStatusError(true);
		}
	}

	React.useEffect(() => {
		void loadTransactions();
	}, []);

	function handleFormChange(event) {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		const payload = {
			name: formData.name.trim(),
			category: formData.category.trim(),
			amount: Number(formData.amount),
			type: formData.type,
			transaction_date: formData.transaction_date
		};

		try {
			const result = editingId
				? await window.updateTransaction(editingId, payload)
				: await window.createTransaction(payload);
			setFormData(getDefaultFormState());
			setEditingId(null);
			await loadTransactions();
			setStatusMessage(result.message);
			setStatusError(false);
		} catch (error) {
			setStatusMessage(error.message || "Could not save the transaction.");
			setStatusError(true);
		}
	}

	function beginEdit(transaction) {
		setFormData({
			name: transaction.name,
			category: transaction.category,
			amount: transaction.amount,
			type: transaction.type,
			transaction_date: String(transaction.transaction_date).slice(0, 10)
		});
		setEditingId(transaction.id);
		setStatusMessage("");
	}

	async function removeTransaction(transaction) {
		if (!window.confirm(`Delete "${transaction.name}"?`)) {
			return;
		}

		try {
			const result = await window.deleteTransactionAPI(transaction.id);
			await loadTransactions();
			setStatusMessage(result.message);
			setStatusError(false);
		} catch (error) {
			setStatusMessage(error.message || "Could not delete the transaction.");
			setStatusError(true);
		}
	}

	return (
		<main className="container">
			<header>
				<h1>Budget Monitor</h1>
				<button
					type="button"
					id="themeToggle"
					aria-label="Toggle dark theme"
					onClick={() => setDarkMode((current) => !current)}
				>
					{darkMode ? "☀️" : "🌙"}
				</button>
			</header>

			<p className={`app-status${statusError ? " error" : ""}`} role="status" aria-live="polite">
				{statusMessage}
			</p>

			<form onSubmit={handleSubmit}>
				<input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Transaction name" maxLength="255" required />
				<input type="text" name="category" value={formData.category} onChange={handleFormChange} placeholder="Category" maxLength="100" required />
				<input type="number" name="amount" value={formData.amount} onChange={handleFormChange} placeholder="Amount" min="0.01" step="0.01" required />
				<select name="type" value={formData.type} onChange={handleFormChange} aria-label="Transaction type">
					<option value="income">Income</option>
					<option value="expense">Expense</option>
				</select>
				<input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleFormChange} required />
				<button type="submit">{editingId ? "Update Transaction" : "Add Transaction"}</button>
			</form>

			<section className="summary-cards" aria-label="Budget summary">
				<div className="card income-card">
					<h2>Total Income</h2>
					<p>{currencyFormatter.format(summary.income)}</p>
				</div>
				<div className="card expense-card">
					<h2>Total Expenses</h2>
					<p>{currencyFormatter.format(summary.expense)}</p>
				</div>
				<div className="card balance-card">
					<h2>Balance</h2>
					<p>{currencyFormatter.format(summary.income - summary.expense)}</p>
				</div>
			</section>

			<section className="filters" aria-label="Filter transactions">
				<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" />
				<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
					<option value="">All categories</option>
					{categories.map((category) => (
						<option key={category} value={category}>{category}</option>
					))}
				</select>
				<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by type">
					<option value="">All types</option>
					<option value="income">Income</option>
					<option value="expense">Expense</option>
				</select>
				<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} aria-label="Filter by month" />
			</section>

			<section className="table-container">
				<h2>Transactions</h2>
				<div className="table-scroll" role="region" aria-label="Transactions table" tabIndex="0">
					<table>
						<thead>
							<tr>
								<th scope="col">Name</th>
								<th scope="col">Category</th>
								<th scope="col">Amount</th>
								<th scope="col">Type</th>
								<th scope="col">Date</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{visibleTransactions.length === 0 ? (
								<tr>
									<td colSpan="6">No transactions match these filters.</td>
								</tr>
							) : (
								visibleTransactions.map((transaction) => (
									<tr key={transaction.id}>
										<td>{transaction.name}</td>
										<td>{transaction.category}</td>
										<td>{currencyFormatter.format(Number(transaction.amount))}</td>
										<td>{transaction.type}</td>
										<td>{formatTransactionDate(transaction.transaction_date)}</td>
										<td className="actions">
											<button type="button" className="edit-btn" aria-label={`Edit ${transaction.name}`} onClick={() => beginEdit(transaction)}>Edit</button>
											<button type="button" className="delete-btn" aria-label={`Delete ${transaction.name}`} onClick={() => removeTransaction(transaction)}>Delete</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
