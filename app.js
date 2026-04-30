
// State
let expenses = JSON.parse(localStorage.getItem('aura_expenses')) || [];
let currentFilter = 'All';
let monthlyBudget = Number(localStorage.getItem('aura_budget')) || 0;
let currentCurrency = localStorage.getItem('aura_currency') || 'USD';
let currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

// DOM Elements
const elements = {
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    apiKeyInput: document.getElementById('apiKey'),
    expenseForm: document.getElementById('expenseForm'),
    expenseInput: document.getElementById('expenseInput'),
    submitBtn: document.getElementById('submitBtn'),
    btnText: document.querySelector('.btn-text'),
    submitLoader: document.getElementById('submitLoader'),
    statusMessage: document.getElementById('statusMessage'),
    expenseList: document.getElementById('expenseList'),
    totalAmount: document.getElementById('totalAmount'),
    categoryFilters: document.getElementById('categoryFilters'),
    monthlyBudgetInput: document.getElementById('monthlyBudget'),
    budgetDisplay: document.getElementById('budgetDisplay'),
    budgetProgress: document.getElementById('budgetProgress'),
    monthPicker: document.getElementById('monthPicker'),
    globalCurrencySelect: document.getElementById('globalCurrency'),
    navTabs: document.querySelectorAll('.nav-tab'),
    pageViews: document.querySelectorAll('.page-view'),
    generateInsightsBtn: document.getElementById('generateInsightsBtn'),
    insightsLoader: document.getElementById('insightsLoader'),
    insightsContent: document.getElementById('insightsContent'),
    resetDataBtn: document.getElementById('resetDataBtn')
};

// Utilities
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrency
    }).format(amount);
};

const formatDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }).format(date);
    } catch {
        return dateStr;
    }
};

const getCategoryIcon = (category) => {
    const icons = {
        'Food & Dining': '🍔',
        'Transportation': '🚗',
        'Office Supplies': '📎',
        'Software & Subscriptions': '💻',
        'Travel': '✈️',
        'Utilities': '⚡',
        'Other': '📦'
    };
    return icons[category] || '💸';
};

// Initialization
function init() {
    elements.monthPicker.value = currentMonth;
    elements.globalCurrencySelect.value = currentCurrency;
    
    renderExpenses();
    setupEventListeners();
    elements.apiKeyInput.value = getApiKey();
    elements.monthlyBudgetInput.value = monthlyBudget || '';
}

// Event Listeners
function setupEventListeners() {
    // Modal
    elements.settingsBtn.addEventListener('click', () => elements.settingsModal.classList.add('active'));
    elements.closeSettingsBtn.addEventListener('click', () => elements.settingsModal.classList.remove('active'));
    elements.saveSettingsBtn.addEventListener('click', saveSettings);

    // Month Picker
    elements.monthPicker.addEventListener('change', (e) => {
        currentMonth = e.target.value || new Date().toISOString().slice(0, 7);
        renderExpenses();
    });

    // Close modal on outside click
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.remove('active');
        }
    });

    // Form
    elements.expenseForm.addEventListener('submit', handleExpenseSubmit);

    // Navigation
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetView = e.target.dataset.view;
            
            // Update active tab
            elements.navTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update active view
            elements.pageViews.forEach(v => {
                if (v.id === `view-${targetView}`) {
                    v.classList.add('active');
                } else {
                    v.classList.remove('active');
                }
            });
        });
    });

    // Insights
    elements.generateInsightsBtn.addEventListener('click', generateInsightsWithAI);

    // Reset Data
    elements.resetDataBtn.addEventListener('click', resetAllData);
}

// Data Management
window.deleteExpense = function(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses();
    renderExpenses();
};

function resetAllData() {
    if (confirm("Are you sure you want to delete ALL data? This includes your expenses, budget, and API key. This action cannot be undone.")) {
        localStorage.clear();
        expenses = [];
        monthlyBudget = 0;
        currentCurrency = 'USD';
        
        elements.apiKeyInput.value = '';
        elements.monthlyBudgetInput.value = '';
        elements.globalCurrencySelect.value = 'USD';
        
        renderExpenses();
        elements.settingsModal.classList.remove('active');
        showStatus('All data has been reset.', 'success');
    }
}

// API Key and Settings Management
function saveSettings() {
    const key = elements.apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('aura_apiKey', key);
    }
    
    const budget = Number(elements.monthlyBudgetInput.value);
    if (!isNaN(budget)) {
        monthlyBudget = budget;
        localStorage.setItem('aura_budget', budget);
    }
    
    currentCurrency = elements.globalCurrencySelect.value;
    localStorage.setItem('aura_currency', currentCurrency);
    
    renderExpenses(); // Re-render everything to update formats
    
    elements.settingsModal.classList.remove('active');
    showStatus('Settings saved successfully.', 'success');
}

function getApiKey() {
    return localStorage.getItem('aura_apiKey') || 'AIzaSyCsLUxmrW_YGnhc1tYubIySEmve5fPQ-hM';
}

// Status Messages
function showStatus(message, type = '') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message status-${type}`;
    if (type === 'success') {
        setTimeout(() => {
            elements.statusMessage.textContent = '';
            elements.statusMessage.className = 'status-message';
        }, 3000);
    }
}

// Budget Display
function updateBudgetDisplay(totalAmount) {
    elements.budgetDisplay.textContent = formatCurrency(monthlyBudget);
    
    if (monthlyBudget > 0) {
        const percent = Math.min((totalAmount / monthlyBudget) * 100, 100);
        elements.budgetProgress.style.width = `${percent}%`;
        
        elements.budgetProgress.className = 'progress-bar-fill';
        if (percent >= 90) {
            elements.budgetProgress.classList.add('danger');
        } else if (percent >= 75) {
            elements.budgetProgress.classList.add('warning');
        }
    } else {
        elements.budgetProgress.style.width = '0%';
        elements.budgetProgress.className = 'progress-bar-fill';
    }
}

// Gemini API Integration
async function parseExpenseWithAI(text) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key missing');

    const { GoogleGenerativeAI } = await import('https://esm.sh/@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.1, // Low temperature for deterministic, factual extraction
            topP: 0.8       // Restrict token selection for safer output
        }
    });

    const prompt = `
    You are an AI assistant for a business expense tracker. 
    Analyze the following text and extract the expense details.
    Today's date is: ${new Date().toISOString().split('T')[0]}.
    The user's currency is: ${currentCurrency}. Do not include the currency symbol in the amount, just the number.
    
    Text: "${text}"
    
    Respond STRICTLY with a JSON object in the following format. Do not include markdown code blocks or any other text.
    {
        "amount": number (just the value, e.g. 45.5),
        "merchant": "string",
        "category": "string" (Choose ONE: Food & Dining, Transportation, Office Supplies, Software & Subscriptions, Travel, Utilities, Other),
        "date": "YYYY-MM-DD",
        "description": "short description"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Strip markdown if present (e.g. ```json ... ```)
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error('AI Parsing Error:', error);
        throw new Error(error.message || 'Failed to parse the expense. Please try again.');
    }
}

async function generateInsightsWithAI() {
    const apiKey = getApiKey();
    if (!apiKey) {
        elements.settingsModal.classList.add('active');
        showStatus('Please set your API key first.', 'error');
        return;
    }
    if (expenses.length === 0) {
        elements.insightsContent.style.display = 'block';
        elements.insightsContent.innerHTML = '<p>No expenses to analyze yet. Log some expenses first!</p>';
        return;
    }

    elements.generateInsightsBtn.querySelector('.btn-text').style.display = 'none';
    elements.insightsLoader.style.display = 'block';
    elements.generateInsightsBtn.disabled = true;

    try {
        const { GoogleGenerativeAI } = await import('https://esm.sh/@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            generationConfig: {
                temperature: 0.7, // Higher temperature for creative, engaging financial advice
                topP: 0.95      // Broader expression for varied insights
            }
        });

        const currentMonthExpenses = expenses.filter(e => e.date && e.date.startsWith(currentMonth));
        
        const prompt = `
        You are a personal financial advisor. I have a monthly budget of ${formatCurrency(monthlyBudget)} and here are my expenses for ${currentMonth}:
        ${JSON.stringify(currentMonthExpenses.map(e => ({ amount: e.amount, merchant: e.merchant, category: e.category, date: e.date })))}
        
        Write a brief, encouraging, but realistic financial analysis. 
        Format it in HTML using only <h3>, <p>, <ul>, and <li> tags. Do not use markdown blocks.
        Focus on where I am spending the most, how close I am to my budget, and give me 1 or 2 actionable tips.
        `;

        const result = await model.generateContent(prompt);
        let html = result.response.text().trim();
        
        if (html.startsWith('```html')) html = html.replace(/```html\n?/, '').replace(/\n?```$/, '');
        else if (html.startsWith('```')) html = html.replace(/```\n?/, '').replace(/\n?```$/, '');
        
        elements.insightsContent.style.display = 'block';
        elements.insightsContent.innerHTML = html;
    } catch (error) {
        elements.insightsContent.style.display = 'block';
        elements.insightsContent.innerHTML = `<p class="status-error">Error generating insights: ${error.message}</p>`;
    } finally {
        elements.generateInsightsBtn.querySelector('.btn-text').style.display = 'block';
        elements.insightsLoader.style.display = 'none';
        elements.generateInsightsBtn.disabled = false;
    }
}

// Handle Form Submission
async function handleExpenseSubmit(e) {
    e.preventDefault();
    const text = elements.expenseInput.value.trim();
    if (!text) return;

    if (!getApiKey()) {
        elements.settingsModal.classList.add('active');
        showStatus('Please set your API key first.', 'error');
        return;
    }

    setLoading(true);
    showStatus('');

    try {
        const parsedData = await parseExpenseWithAI(text);

        const newExpense = {
            id: Date.now().toString(),
            ...parsedData,
            createdAt: new Date().toISOString()
        };

        expenses.unshift(newExpense);
        saveExpenses();
        renderExpenses();

        elements.expenseInput.value = '';
        showStatus('Expense logged successfully!', 'success');
    } catch (error) {
        showStatus(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        elements.btnText.style.display = 'none';
        elements.submitLoader.style.display = 'block';
        elements.submitBtn.disabled = true;
        elements.expenseInput.disabled = true;
    } else {
        elements.btnText.style.display = 'block';
        elements.submitLoader.style.display = 'none';
        elements.submitBtn.disabled = false;
        elements.expenseInput.disabled = false;
        elements.expenseInput.focus();
    }
}

// Rendering
function saveExpenses() {
    localStorage.setItem('aura_expenses', JSON.stringify(expenses));
}

function renderExpenses() {
    let filteredExpenses = expenses.filter(e => e.date && e.date.startsWith(currentMonth));

    if (currentFilter !== 'All') {
        filteredExpenses = filteredExpenses.filter(e => e.category === currentFilter);
    }

    // Update Total and Budget for current month
    const total = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    elements.totalAmount.textContent = formatCurrency(total);
    updateBudgetDisplay(total);

    // Render Filters (categories available in the current month)
    const categories = ['All', ...new Set(expenses.filter(e => e.date && e.date.startsWith(currentMonth)).map(e => e.category))];
    elements.categoryFilters.innerHTML = categories.map(cat => `
        <button class="filter-pill ${cat === currentFilter ? 'active' : ''}" data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    // Attach filter listeners
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.category;
            renderExpenses();
        });
    });

    // Render List
    if (filteredExpenses.length === 0) {
        elements.expenseList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💸</div>
                <p>${currentFilter === 'All' ? 'No expenses logged yet.' : `No expenses in ${currentFilter}.`}</p>
                <span>${currentFilter === 'All' ? 'Your AI parsed expenses will appear here.' : 'Try logging a new expense.'}</span>
            </div>
        `;
        return;
    }

    elements.expenseList.innerHTML = filteredExpenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="category-icon">${getCategoryIcon(expense.category)}</div>
                <div class="expense-details">
                    <h3>${expense.merchant}</h3>
                    <p>${expense.category} • ${formatDate(expense.date)}</p>
                </div>
            </div>
            <div class="expense-actions">
                <div class="expense-amount">
                    ${formatCurrency(expense.amount)}
                </div>
                <button class="delete-btn" onclick="deleteExpense('${expense.id}')" title="Delete Expense">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Start App
init();
