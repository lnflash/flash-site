const API_BASE = 'https://kotc.islandbitcoin.com/api';

let hunterData = null;

// DOM Elements
const usernameEl = document.getElementById('hunter-username');
const currentStageEl = document.getElementById('current-stage');
const totalSatsEl = document.getElementById('total-sats');
const taskTitleEl = document.getElementById('task-title');
const taskDescriptionEl = document.getElementById('task-description');
const taskActionEl = document.getElementById('task-action');
const prizesListEl = document.getElementById('prizes-list');
const logoutBtn = document.getElementById('logout-btn');

// Stage information
const stageInfo = {
    0: {
        title: 'Begin Your Journey',
        description: 'Visit the Flash website and watch the lightning strikes. After 15 strikes, check your browser console for a hidden message...',
        action: 'Go to Flash Website',
        actionUrl: '../index.html',
        icon: '⚡'
    },
    1: {
        title: 'Continue to Stage 2',
        description: 'You have completed The Awakening! Now it\'s time to analyze the blockchain and crack the cipher in The Ledger.',
        action: 'Start Stage 2',
        actionUrl: 'stage2.html',
        icon: '📖'
    },
    2: {
        title: 'Continue to Stage 3',
        description: 'The Ledger is complete! Discover hidden messages through steganography in The Gallery of Legends.',
        action: 'Start Stage 3',
        actionUrl: 'stage3.html',
        icon: '🖼️'
    },
    3: {
        title: 'Continue to Stage 4',
        description: 'Time to leave the digital realm. Pack your bags - you\'re heading to Jamaica for The Physical Pilgrimage!',
        action: 'Start Stage 4',
        actionUrl: 'stage4.html',
        icon: '🏝️'
    },
    4: {
        title: 'Continue to Stage 5',
        description: 'You\'ve made it to the Caribbean! Now interact with Flash merchants across the islands and decode The Caribbean Cipher.',
        action: 'Start Stage 5',
        actionUrl: 'stage5.html',
        icon: '🔐'
    },
    5: {
        title: 'Continue to Stage 6',
        description: 'Cultural clues decoded! Prepare for the ultimate challenge - The Genesis Block awaits.',
        action: 'Start Stage 6',
        actionUrl: 'stage6.html',
        icon: '⛏️'
    },
    6: {
        title: 'The Final Challenge',
        description: 'You stand at the threshold of The Vault. Face the ultimate moral dilemma and make your choice.',
        action: 'Enter The Vault',
        actionUrl: 'stage7.html',
        icon: '🏆'
    },
    7: {
        title: 'Journey Complete!',
        description: 'Congratulations! You have completed Keys of the Caribbean. Check your Hall of Heroes status.',
        action: 'View Profile',
        actionUrl: 'profile.html',
        icon: '👑'
    }
};

// Load hunter data
async function loadHunterData() {
    const token = localStorage.getItem('hunt_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/verify-session.php`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (!data.valid) {
            localStorage.removeItem('hunt_token');
            window.location.href = 'login.html';
            return;
        }

        hunterData = data.hunter;
        updateDashboard();
        loadPrizes();

    } catch (error) {
        console.error('Error loading hunter data:', error);
        showError('Failed to load your data. Please refresh the page.');
    }
}

// Update dashboard with hunter data
function updateDashboard() {
    // Update header
    usernameEl.textContent = hunterData.username;
    currentStageEl.textContent = `Stage ${hunterData.current_stage}`;
    totalSatsEl.textContent = hunterData.total_sats_won.toLocaleString();

    // Update progress tracker
    updateProgressTracker();

    // Update next task
    updateNextTask();
}

// Update progress tracker
function updateProgressTracker() {
    const stageItems = document.querySelectorAll('.stage-item');
    const currentStage = hunterData.current_stage;

    stageItems.forEach((item, index) => {
        const stageNum = index + 1;
        const statusEl = item.querySelector('.stage-status');

        if (stageNum < currentStage || (stageNum === currentStage && currentStage === 7)) {
            // Completed
            item.classList.add('completed');
            item.classList.remove('active');
            statusEl.textContent = 'Completed';
        } else if (stageNum === currentStage || (currentStage === 0 && stageNum === 1)) {
            // Active
            item.classList.add('active');
            item.classList.remove('completed');
            statusEl.textContent = 'In Progress';
        } else {
            // Locked
            item.classList.remove('completed', 'active');
            statusEl.textContent = 'Locked';
        }
    });
}

// Update next task
function updateNextTask() {
    const stage = hunterData.current_stage;
    const info = stageInfo[stage];

    if (!info) {
        taskTitleEl.textContent = 'No tasks available';
        taskDescriptionEl.textContent = 'Something went wrong. Please contact support.';
        return;
    }

    // Update task card
    const taskIcon = document.querySelector('.task-icon');
    taskIcon.textContent = info.icon;

    taskTitleEl.textContent = info.title;
    taskDescriptionEl.textContent = info.description;

    // Update action button
    taskActionEl.textContent = info.action;
    taskActionEl.href = info.actionUrl;
    taskActionEl.style.display = 'inline-block';
}

// Load prizes
async function loadPrizes() {
    const token = localStorage.getItem('hunt_token');

    try {
        const response = await fetch(`${API_BASE}/get-prizes.php`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.prizes.length > 0) {
            renderPrizes(data.prizes);
        } else {
            // Keep empty state
            prizesListEl.innerHTML = `
                <div class="prizes-empty">
                    <p>No prizes claimed yet. Complete stages to earn Bitcoin!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading prizes:', error);
    }
}

// Render prizes
function renderPrizes(prizes) {
    prizesListEl.innerHTML = prizes.map(prize => `
        <div class="prize-card ${prize.state}">
            <div class="prize-header">
                <div class="prize-stage">Stage ${prize.stage}</div>
                <div class="prize-state ${prize.state}">${prize.state}</div>
            </div>
            <div class="prize-amount-display">${prize.amount_sats.toLocaleString()} sats</div>
            <div class="prize-date">${formatDate(prize.created_at)}</div>
        </div>
    `).join('');
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Logout
function logout() {
    localStorage.removeItem('hunt_token');
    window.location.href = 'index.html';
}

// Event Listeners
logoutBtn.addEventListener('click', logout);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHunterData();
    initTerminalAccess();
});

// Terminal Access Token functionality
function initTerminalAccess() {
    const tokenInput = document.getElementById('stage1-token');
    const saveTokenBtn = document.getElementById('save-token-btn');
    const tokenStatus = document.getElementById('token-status');

    if (!saveTokenBtn || !tokenInput) {
        console.log('Terminal access elements not found');
        return;
    }

    // Save Stage 1 Token
    async function saveStage1Token() {
        const token = localStorage.getItem('hunt_token');
        const stage1Token = tokenInput.value.trim();

        if (!stage1Token) {
            showTokenStatus('Please enter a token', 'error');
            return;
        }

        showTokenStatus('Verifying token...', 'loading');

        try {
            const response = await fetch(`${API_BASE}/save-stage1-token.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ stage1_token: stage1Token })
            });

            const data = await response.json();

            if (data.success) {
                showTokenStatus('✓ Token verified and saved! You can now access the terminal with your username.', 'success');
                tokenInput.value = '';
                // Refresh hunter data to reflect changes
                loadHunterData();
            } else {
                showTokenStatus(data.message || 'Invalid token. Please check and try again.', 'error');
            }
        } catch (error) {
            console.error('Error saving token:', error);
            showTokenStatus('Network error. Please try again.', 'error');
        }
    }

    // Show token status message
    function showTokenStatus(message, type) {
        if (tokenStatus) {
            tokenStatus.textContent = message;
            tokenStatus.className = 'token-status ' + type;
        }
    }

    // Add event listeners
    saveTokenBtn.addEventListener('click', saveStage1Token);
    
    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveStage1Token();
        }
    });

    console.log('Terminal access initialized');
}
