const form = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const errorEl = document.getElementById("error-message");
const filterEl = document.getElementById("filter");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const totalSavingsEl = document.getElementById("total-savings");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    render();
}
let spendingChart = null;

function drawChart(categoryTotals) {
    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const emptyMsg = document.getElementById("chart-empty");
    const canvas = document.getElementById("spending-chart");

    if (spendingChart) {
        spendingChart.destroy();
    }

    if (labels.length === 0) {
        emptyMsg.style.display = "block";
        canvas.style.display = "none";
        return;
    }

    emptyMsg.style.display = "none";
    canvas.style.display = "block";

    spendingChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#e67e22", "#1abc9c", "#95a5a6"]
            }]
        }
    });
}
function render() {
    transactionList.innerHTML = "";

    let totalIncome = 0;
    let totalExpenses = 0;
    let categoryTotals = {};

    transactions.forEach(function (t, index) {
        if (t.type === "income") {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
            const cat =t.category || "Other";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
        }
        if (filterEl.value !== "all" && t.type !== filterEl.value) {
            return;
        }    
       const row = document.createElement("tr");
       row.className = t.type;
       row.innerHTML = `
           <td>${t.description}</td>
           <td>₹${t.amount.toLocaleString("en-IN")}</td>
           <td>${t.type}</td>
           <td>${t.category || "Other"}</td>
           <td><button class="delete-btn">Delete</button></td>
        `;   

        const deleteBtn = row.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
            deleteTransaction(index);
        });

        transactionList.appendChild(row);
    });

    totalIncomeEl.textContent = totalIncome.toLocaleString("en-IN");
    totalExpensesEl.textContent = totalExpenses.toLocaleString("en-IN");
    totalSavingsEl.textContent = (totalIncome - totalExpenses).toLocaleString("en-IN");
    drawChart(categoryTotals);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = document.getElementById("description").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;

    if (description === "") {
        errorEl.textContent = "Please enter a description.";
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        errorEl.textContent = "Amount must be greater than 0.";
        return;
    }

    errorEl.textContent = "";

    transactions.push({ description: description, amount: amount, type: type, category: category });

    saveTransactions();
    render();
    form.reset();
});
filterEl.addEventListener("change", render);


render();