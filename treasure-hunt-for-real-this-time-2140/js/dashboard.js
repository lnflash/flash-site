// Keys of the Caribbean - Hunter Dashboard

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
        description: 'You\'ve reached Jamaica! Now interact with Flash merchants and decode The Caribbean Cipher.',
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
        window.location.href = 'register.html';
        return;
    }

    try {
        const response = await fetch('/treasure-hunt/api/verify-session.php', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.valid) {
            localStorage.removeItem('hunt_token');
            window.location.href = 'register.html';
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
        const response = await fetch('/treasure-hunt/api/get-prizes.php', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
});
