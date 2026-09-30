const test = require("node:test");
const assert = require("node:assert/strict");
const { filterTransactions } = require("../../client/js/filter");

const transactions = [
    { name: "Groceries", category: "Food", amount: 450, type: "expense", transaction_date: "2026-09-04" },
    { name: "Monthly salary", category: "Salary", amount: 20000, type: "income", transaction_date: "2026-08-25" },
    { name: "Bus fare", category: "Transport", amount: 30, type: "expense", transaction_date: "2026-09-12" }
];

test("filters transactions by search, category, type, and month together", () => {
    const results = filterTransactions(transactions, {
        search: "GROC",
        category: "Food",
        type: "expense",
        month: "2026-09"
    });

    assert.deepEqual(results.map((transaction) => transaction.name), ["Groceries"]);
});

test("empty filters keep all transactions", () => {
    assert.equal(filterTransactions(transactions, {
        search: "",
        category: "",
        type: "",
        month: ""
    }).length, transactions.length);
});