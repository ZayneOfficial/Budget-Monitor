const form = document.getElementById("transactionForm");
const searchInput = document.getElementById("searchInput");

const filterCategory = document.getElementById("filterCategory");
const filterMonth = document.getElementById("filterMonth");
filterMonth.value = new Date().toISOString().slice(0,7);
const filterType = document.getElementById("filterType");
let editingId = null;
let expenseChart = null;
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const transaction = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        amount: Number(document.getElementById("amount").value),
        type: document.getElementById("type").value,
        transaction_date: document.getElementById("transaction_date").value
    };

    try {
       const url = editingId
    ? `http://localhost:3000/api/transactions/${editingId}`
    : "http://localhost:3000/api/transactions";

const method = editingId ? "PUT" : "POST";

const response = await fetch(url, {
    method: method,
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(transaction)
});

        const result = await response.json();

        alert(result.message);

        form.reset();

        editingId = null;

form.querySelector("button").textContent = "Add Transaction";

        loadTransactions();

    } catch (error) {
        console.error(error);
        alert("Could not connect to the server.");
    }
});


async function loadTransactions() {

    const response = await fetch("http://localhost:3000/api/transactions");
    const transactions = await response.json();

    let filteredTransactions = transactions;
    const month = filterMonth.value;

const search = searchInput.value.toLowerCase();

const category = filterCategory.value;

const type = filterType.value;

filteredTransactions = filteredTransactions.filter(transaction => {

    const matchesSearch =
        transaction.name.toLowerCase().includes(search);

    const matchesCategory =
        category === "" ||
        transaction.category === category;

    const matchesType =
        type === "" ||
        transaction.type === type;

    return matchesSearch &&
       matchesCategory &&
       matchesType &&
       matchesMonth;

           const transactionMonth =
    transaction.transaction_date.slice(0,7);

const matchesMonth =
    month === "" ||
    transactionMonth === month;
});

    let totalIncome = 0;
let totalExpense = 0;

filteredTransactions.forEach(transaction => {

    if(transaction.type === "income"){
        totalIncome += Number(transaction.amount);
    }else{
        totalExpense += Number(transaction.amount);
    }

     updateChart(filteredTransactions);
});

const balance = totalIncome - totalExpense;

document.getElementById("totalIncome").textContent =
    `R${totalIncome.toFixed(2)}`;

document.getElementById("totalExpense").textContent =
    `R${totalExpense.toFixed(2)}`;

document.getElementById("balance").textContent =
    `R${balance.toFixed(2)}`;

    const table = document.getElementById("transactionTable");

    table.innerHTML = "";

    transactions.forEach(transaction => {

        table.innerHTML += `
        <tr>
            <td>${transaction.name}</td>
            <td>${transaction.category}</td>
            <td>R${transaction.amount}</td>
            <td>${transaction.type}</td>
            <td>${new Date(transaction.transaction_date).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric"
})}</td>
            <td class="actions">

    <button class="edit-btn"
        onclick="editTransaction(${transaction.id})">
        ✏️ Edit
    </button>

    <button class="delete-btn"
        onclick="deleteTransaction(${transaction.id})">
        🗑 Delete
    </button>

</td>
        </tr>
        `;

    });

}


// ✅ This function must be OUTSIDE loadTransactions()
async function deleteTransaction(id) {

    if (!confirm("Delete this transaction?")) return;

    try {

        const response = await fetch(`http://localhost:3000/api/transactions/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        alert(result.message);

        loadTransactions();

    } catch (error) {

        console.error(error);

    }

}

async function editTransaction(id) {

    const response = await fetch("http://localhost:3000/api/transactions");

    const transactions = await response.json();

    const transaction = transactions.find(t => t.id == id);

    if (!transaction) return;

    document.getElementById("name").value = transaction.name;
    document.getElementById("category").value = transaction.category;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("type").value = transaction.type;
    document.getElementById("transaction_date").value =
        transaction.transaction_date.split("T")[0];

    editingId = id;

    form.querySelector("button").textContent = "Update Transaction";

       
}

const themeToggle = document.getElementById("themeToggle");

// Load saved theme
if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
}

// Toggle theme
themeToggle.addEventListener("click", () =>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");
        themeToggle.textContent="☀️";

    }else{

        localStorage.setItem("theme","light");
        themeToggle.textContent="🌙";

    }

});

function updateChart(transactions){

    const categories = {};

    transactions.forEach(transaction=>{

        if(transaction.type==="expense"){

            if(!categories[transaction.category]){

                categories[transaction.category]=0;

            }

            categories[transaction.category]+=Number(transaction.amount);

        }

    });

    const labels=Object.keys(categories);
    const values=Object.values(categories);

    const ctx=document.getElementById("expenseChart");

    if(expenseChart){

        expenseChart.destroy();

    }

    expenseChart=new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:labels,

            datasets:[{

                data:values,

                backgroundColor:[
                    "#2563eb",
                    "#16a34a",
                    "#dc2626",
                    "#f59e0b",
                    "#7c3aed",
                    "#06b6d4",
                    "#ec4899"
                ]

            }]

        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    position:"bottom"
                }
            }

        }

    });

}

searchInput.addEventListener("input",loadTransactions);

filterCategory.addEventListener("change",loadTransactions);

filterType.addEventListener("change",loadTransactions);

filterMonth.addEventListener("change",loadTransactions);

loadTransactions();