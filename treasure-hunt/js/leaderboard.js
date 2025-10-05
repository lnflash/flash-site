// Keys of the Caribbean - Leaderboard Page

// API Configuration - Points to private backend server
const API_BASE = 'https://kotc.islandbitcoin.com/api';
// For local development, use: const API_BASE = 'http://localhost:8000/api';

let hunters = [];
let heroes = [];
let currentFilter = 'all';
let currentSort = 'stage_desc';

// DOM Elements
const tbody = document.getElementById('leaderboard-tbody');
const filterStage = document.getElementById('filter-stage');
const sortBy = document.getElementById('sort-by');
const refreshBtn = document.getElementById('refresh-btn');
const heroesGrid = document.getElementById('heroes-grid');

// Stats elements
const totalHuntersEl = document.getElementById('total-hunters');
const totalCompletedEl = document.getElementById('total-completed');
const totalSatsEl = document.getElementById('total-sats');
const avgStageEl = document.getElementById('avg-stage');

// Load leaderboard data
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard.php`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            hunters = data.hunters || [];
            heroes = data.heroes || [];

            updateStats(data.stats);
            renderLeaderboard();
            renderHeroes();
        } else {
            showError('Failed to load leaderboard data');
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('Network error. Unable to load leaderboard.');
    }
}

// Update stats
function updateStats(stats) {
    totalHuntersEl.textContent = stats.total_hunters || 0;
    totalCompletedEl.textContent = stats.total_completed || 0;
    totalSatsEl.textContent = (stats.total_sats_distributed || 0).toLocaleString();
    avgStageEl.textContent = stats.avg_stage ? stats.avg_stage.toFixed(1) : '0.0';
}

// Render leaderboard
function renderLeaderboard() {
    // Filter hunters
    let filteredHunters = hunters;

    if (currentFilter !== 'all') {
        const stage = parseInt(currentFilter);
        filteredHunters = hunters.filter(h => h.current_stage === stage);
    }

    // Sort hunters
    filteredHunters.sort((a, b) => {
        switch (currentSort) {
            case 'stage_desc':
                return b.current_stage - a.current_stage || b.total_sats_won - a.total_sats_won;
            case 'stage_asc':
                return a.current_stage - b.current_stage || a.total_sats_won - b.total_sats_won;
            case 'sats_desc':
                return b.total_sats_won - a.total_sats_won;
            case 'sats_asc':
                return a.total_sats_won - b.total_sats_won;
            case 'recent':
                return new Date(b.created_at) - new Date(a.created_at);
            default:
                return 0;
        }
    });

    // Render rows
    if (filteredHunters.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-icon">🔍</div>
                    <p>No hunters found for this filter.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredHunters.map((hunter, index) => {
        const rank = index + 1;
        const isHero = hunter.chosen_path === 'satoshi_way';
        const isCompleted = hunter.current_stage === 7;

        // Determine status
        let statusBadge = '<span class="status-badge status-active">Active</span>';
        if (isHero) {
            statusBadge = '<span class="status-badge status-hero">Hero</span>';
        } else if (isCompleted) {
            statusBadge = '<span class="status-badge status-completed">Completed</span>';
        }

        // Stage badge
        const stageBadge = isCompleted
            ? '<span class="stage-badge stage-completed">✅ Stage 7</span>'
            : `<span class="stage-badge">Stage ${hunter.current_stage}</span>`;

        // Hunter name with potential badge
        const hunterNameBadge = isHero ? '⭐ ' : '';

        return `
            <tr class="rank-${rank} ${isHero ? 'hero-hunter' : ''}">
                <td>${rank}</td>
                <td>
                    <div class="hunter-name">
                        ${hunterNameBadge ? `<span class="hunter-badge">${hunterNameBadge}</span>` : ''}
                        <span>${escapeHtml(hunter.username)}</span>
                    </div>
                </td>
                <td>${stageBadge}</td>
                <td><span class="sats-value">${hunter.total_sats_won.toLocaleString()} sats</span></td>
                <td>${statusBadge}</td>
                <td><span class="date-value">${formatDate(hunter.created_at)}</span></td>
            </tr>
        `;
    }).join('');
}

// Render Hall of Heroes
function renderHeroes() {
    if (heroes.length === 0) {
        heroesGrid.innerHTML = `
            <div class="heroes-empty">
                <div class="empty-icon">🏴‍☠️</div>
                <p>No heroes inducted yet...</p>
                <p class="empty-subtitle">Be the first to complete the hunt and choose The Satoshi Way.</p>
            </div>
        `;
        return;
    }

    heroesGrid.innerHTML = heroes.map(hero => `
        <div class="hero-card">
            <div class="hero-icon">⭐</div>
            <h3>${escapeHtml(hero.username)}</h3>
            <div class="hero-stats">
                <div class="hero-stat">
                    <div class="hero-stat-value">${hero.completion_time_hours}h</div>
                    <div class="hero-stat-label">Time</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-value">${hero.total_sats_earned.toLocaleString()}</div>
                    <div class="hero-stat-label">Sats</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-value">${hero.shared_amount.toLocaleString()}</div>
                    <div class="hero-stat-label">Shared</div>
                </div>
            </div>
            ${hero.profile_text ? `<p class="hero-profile">"${escapeHtml(hero.profile_text)}"</p>` : ''}
        </div>
    `).join('');
}

// Event Listeners
filterStage.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderLeaderboard();
});

sortBy.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderLeaderboard();
});

refreshBtn.addEventListener('click', () => {
    refreshBtn.classList.add('loading');
    loadLeaderboard().then(() => {
        refreshBtn.classList.remove('loading');
    });
});

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function showError(message) {
    tbody.innerHTML = `
        <tr class="empty-state">
            <td colspan="6">
                <p style="color: #FCA5A5;">${escapeHtml(message)}</p>
            </td>
        </tr>
    `;
}

// Auto-refresh every 30 seconds
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        loadLeaderboard();
    }, 30000); // 30 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Page visibility handling (pause refresh when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    startAutoRefresh();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
