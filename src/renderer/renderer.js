// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const optionsToggle = document.getElementById('optionsToggle');
const optionsContent = document.getElementById('optionsContent');
const gameLimitInput = document.getElementById('gameLimit');
const databaseInput = document.getElementById('database');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingProgress = document.getElementById('loadingProgress');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');
const successToast = document.getElementById('successToast');
const successMessage = document.getElementById('successMessage');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');

// State
let currentSearchType = 'username';
let currentResults = null;

// Toggle search type
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSearchType = btn.dataset.type;

        // Update placeholder
        if (currentSearchType === 'username') {
            searchInput.placeholder = 'Enter Roblox username...';
        } else {
            searchInput.placeholder = 'Enter Roblox user ID...';
        }
    });
});

// Toggle advanced options
optionsToggle.addEventListener('click', () => {
    optionsToggle.classList.toggle('active');
    optionsContent.classList.toggle('open');
});

// Search button click
searchBtn.addEventListener('click', () => {
    performSearch();
});

// Enter key to search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Export results
exportBtn.addEventListener('click', () => {
    if (currentResults) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `bloxsint_${currentResults.roblox_id}_${timestamp}.json`;

        window.api.saveResults(currentResults, filename).then(result => {
            if (result.success) {
                showSuccess(`Results exported to: ${result.path}`);
            } else {
                showError(`Failed to export: ${result.error}`);
            }
        });
    }
});

// Clear results
clearBtn.addEventListener('click', () => {
    resultsSection.style.display = 'none';
    resultsContent.innerHTML = '';
    currentResults = null;
});

// Perform search
async function performSearch() {
    const searchValue = searchInput.value.trim();

    if (!searchValue) {
        showError('Please enter a username or ID');
        return;
    }

    // Validate ID if search type is ID
    if (currentSearchType === 'id' && isNaN(searchValue)) {
        showError('Please enter a valid numeric ID');
        return;
    }

    // Get options
    const options = {
        gameLimit: parseInt(gameLimitInput.value) || 10,
        database: databaseInput.value.trim() || null
    };

    // Show loading
    showLoading();

    try {
        const result = await window.api.lookupUser(currentSearchType, searchValue, options);

        if (result.success) {
            currentResults = result.data;
            displayResults(result.data);
            hideLoading();
        } else {
            hideLoading();
            showError('Lookup failed. Please try again.');
        }
    } catch (error) {
        hideLoading();
        showError(error.message || 'An error occurred during lookup');
    }
}

// Display results
function displayResults(data) {
    resultsContent.innerHTML = '';

    // Create result items for each key
    for (const [key, value] of Object.entries(data)) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = formatLabel(key);

        const valueDiv = document.createElement('div');
        valueDiv.className = 'result-value';

        if (typeof value === 'object' && value !== null) {
            const pre = document.createElement('pre');
            pre.textContent = JSON.stringify(value, null, 2);
            valueDiv.appendChild(pre);
        } else {
            valueDiv.textContent = value || 'N/A';
        }

        resultItem.appendChild(label);
        resultItem.appendChild(valueDiv);
        resultsContent.appendChild(resultItem);
    }

    resultsSection.style.display = 'block';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Format label
function formatLabel(key) {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Show loading
function showLoading() {
    loadingOverlay.style.display = 'flex';
    loadingProgress.textContent = 'Initializing...';
}

// Hide loading
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Show error toast
function showError(message) {
    errorMessage.textContent = message;
    errorToast.style.display = 'flex';

    setTimeout(() => {
        errorToast.style.display = 'none';
    }, 5000);
}

// Show success toast
function showSuccess(message) {
    successMessage.textContent = message;
    successToast.style.display = 'flex';

    setTimeout(() => {
        successToast.style.display = 'none';
    }, 5000);
}

// Listen for progress updates
window.api.onLookupProgress((data) => {
    if (data.message) {
        loadingProgress.textContent = data.message;
    }
});

// Listen for completion
window.api.onLookupComplete((data) => {
    console.log('Lookup completed:', data);
});

// Listen for errors
window.api.onLookupError((error) => {
    console.error('Lookup error:', error);
    hideLoading();
    showError(error);
});
