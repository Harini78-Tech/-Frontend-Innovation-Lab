const API_BASE = 'http://localhost:8000/api';
let expenses = [];
let incomes = [];
let categoryChart, trendChart, incomeExpenseChart;

// ==========================
// Auth Token Helper
// ==========================
function getAuthToken() {
    return localStorage.getItem('token');
}

// ==========================
// Generic API Request
// ==========================
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    const defaultOptions = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
    const response = await fetch(`${API_BASE}${url}`, { ...defaultOptions, ...options });
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
    }
    return response;
}

// ==========================
// Load Expenses & Incomes
// ==========================
async function loadExpenses() {
    try {
        const response = await apiRequest('/expenses');
        const data = await response.json();
        if (data.success) {
            expenses = data.expenses;
            renderExpenses();
            updateBalance();
            updateCharts();
        }
    } catch(err){ console.error(err); }
}

async function loadIncomes() {
    try {
        const response = await apiRequest('/incomes');
        const data = await response.json();
        if (data.success) {
            incomes = data.incomes;
            renderIncomes();
            updateBalance();
            updateCharts();
        }
    } catch(err){ console.error(err); }
}

// ==========================
// Render Expenses & Incomes
// ==========================
function renderExpenses() {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    if (!expenses.length) {
        expenseList.innerHTML = `<div class="empty-state"><div>📊</div><p>No expenses yet</p></div>`;
        return;
    }
    expenses.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="expense-details">
                <div class="expense-name">${exp.name}</div>
                <div class="expense-category">${exp.category}</div>
            </div>
            <div class="expense-amount">-$${parseFloat(exp.amount).toFixed(2)}</div>
        `;
        expenseList.appendChild(item);
    });
}

function renderIncomes() {
    const incomeList = document.getElementById('income-list');
    incomeList.innerHTML = '';
    if (!incomes.length) {
        incomeList.innerHTML = `<div class="empty-state"><div>💰</div><p>No incomes yet</p></div>`;
        return;
    }
    incomes.forEach(inc => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="expense-details">
                <div class="expense-name">${inc.name || inc.source}</div>
                <div class="expense-category">${inc.date}</div>
            </div>
            <div class="expense-amount">+$${parseFloat(inc.amount).toFixed(2)}</div>
        `;
        incomeList.appendChild(item);
    });
}

// ==========================
// Add Expense & Income
// ==========================
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    if (!name || !amount || !category || !date) return;

    try {
        const response = await apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify({ name, amount, category, date })
        });
        const data = await response.json();
        if (data.success) {
            await loadExpenses();
        } else {
            console.error('Expense not saved:', data.message);
        }
    } catch (err) {
        console.error('Error saving expense:', err);
    }

    e.target.reset();
});

document.getElementById('income-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('income-name').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    if (!name || !amount || !date) return;

    try {
        const response = await apiRequest('/incomes', {
            method: 'POST',
            body: JSON.stringify({ source: name, amount, date })
        });
        const data = await response.json();
        if (data.success) {
            await loadIncomes();
        } else {
            console.error('Income not saved:', data.message);
        }
    } catch (err) {
        console.error('Error saving income:', err);
    }

    e.target.reset();
});

// ==========================
// Update Balance
// ==========================
function updateBalance() {
    const totalIncome = incomes.reduce((a,b)=> a+Number(b.amount),0);
    const totalExpenses = expenses.reduce((a,b)=> a+Number(b.amount),0);
    document.getElementById('total-income').textContent = `+$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `-$${totalExpenses.toFixed(2)}`;
    document.getElementById('balance-amount').textContent = `$${(totalIncome-totalExpenses).toFixed(2)}`;
}

// ==========================
// Charts Initialization
// ==========================
function initCharts() {
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');

    categoryChart = new Chart(categoryCtx, {
        type:'doughnut',
        data: {
            labels:['Food','Transport','Entertainment','Shopping','Bills','Other'],
            datasets:[{ data:[0,0,0,0,0,0], backgroundColor:['#ffd166','#06d6a0','#ef476f','#118ab2','#073b4c','#6a5acd'] }]
        }
    });

    trendChart = new Chart(trendCtx, {
        type:'line',
        data: {
            labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets:[{ label:'Monthly Expenses', data:Array(12).fill(0), borderColor:'#ef476f', backgroundColor:'rgba(239,71,111,0.2)', fill:true, tension:0.3 }]
        }
    });

    incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type:'bar',
        data: {
            labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets:[
                { label:'Income', data:Array(12).fill(0), backgroundColor:'#06d6a0' },
                { label:'Expenses', data:Array(12).fill(0), backgroundColor:'#ef476f' }
            ]
        },
        options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
    });

    updateCharts();
}

// ==========================
// Update Charts
// ==========================
function updateCharts() {
    // Category Chart
    const categoryData = { food:0, transport:0, entertainment:0, shopping:0, bills:0, other:0 };
    expenses.forEach(e => categoryData[e.category] += Number(e.amount));
    categoryChart.data.datasets[0].data = Object.values(categoryData);
    categoryChart.update();

    // Monthly Trend Chart
    const monthlyExpenses = Array(12).fill(0);
    expenses.forEach(e => { monthlyExpenses[new Date(e.date).getMonth()] += Number(e.amount); });
    trendChart.data.datasets[0].data = monthlyExpenses;
    trendChart.update();

    // Income vs Expenses Chart
    const monthlyIncome = Array(12).fill(0);
    const monthlyExp = Array(12).fill(0);
    incomes.forEach(i => monthlyIncome[new Date(i.date).getMonth()] += Number(i.amount));
    expenses.forEach(e => monthlyExp[new Date(e.date).getMonth()] += Number(e.amount));
    incomeExpenseChart.data.datasets[0].data = monthlyIncome;
    incomeExpenseChart.data.datasets[1].data = monthlyExp;
    incomeExpenseChart.update();
}

// ==========================
// Logout
// ==========================
function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
}

// ==========================
// Initialize
// ==========================
window.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadExpenses();
    loadIncomes();
});
