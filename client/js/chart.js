let expenseChart = null;

function updateChart(transactions) {
    if (typeof Chart === "undefined") {
        return;
    }

    const totalsByCategory = new Map();
    transactions
        .filter((transaction) => transaction.type === "expense")
        .forEach((transaction) => {
            totalsByCategory.set(
                transaction.category,
                (totalsByCategory.get(transaction.category) || 0) + Number(transaction.amount)
            );
        });

    const canvas = document.getElementById("expenseChart");
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: [...totalsByCategory.keys()],
            datasets: [{
                data: [...totalsByCategory.values()],
                backgroundColor: ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#06b6d4", "#ec4899", "#64748b"]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
        }
    });
}