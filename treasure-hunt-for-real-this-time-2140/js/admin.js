/**
 * Keys of the Caribbean - Admin Panel
 * Nostr Authentication (NIP-07 + NIP-98)
 */

// Import nostr-tools from CDN
import { getPublicKey, getEventHash, getSignature, nip19 } from 'https://esm.sh/nostr-tools@2.1.0';

const API_BASE = 'https://kotc.islandbitcoin.com/api';

// State
let currentPubkey = null;
let currentPage = 1;
const pageLimit = 50;

/**
 * Check if window.nostr is available
 */
function checkNostrExtension() {
    const extensionCheck = document.getElementById('extension-check');
    const loginBtn = document.getElementById('login-btn');
    const extensionHelp = document.getElementById('extension-help');

    if (typeof window.nostr !== 'undefined') {
        extensionCheck.innerHTML = '<div class="extension-found" style="color: var(--flash-green);">✓ Nostr extension detected</div>';
        loginBtn.style.display = 'block';
        extensionHelp.style.display = 'none';
    } else {
        extensionCheck.innerHTML = '<div class="extension-not-found" style="color: var(--gold-accent);">⚠ No Nostr extension found</div>';
        extensionHelp.style.display = 'block';
    }
}

/**
 * Get NIP-98 Authorization header
 */
async function getNIP98AuthHeader(url, method) {
    if (!window.nostr) {
        throw new Error('Nostr extension not available');
    }

    // Create NIP-98 event
    const event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['u', url],
            ['method', method.toUpperCase()]
        ],
        content: ''
    };

    // Sign event with extension
    const signedEvent = await window.nostr.signEvent(event);

    // Base64 encode the event
    const base64Event = btoa(JSON.stringify(signedEvent));

    return `Nostr ${base64Event}`;
}

/**
 * Login with Nostr
 */
async function loginWithNostr() {
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');

    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Authenticating...';
        loginError.style.display = 'none';

        // Get public key from extension
        const pubkey = await window.nostr.getPublicKey();
        currentPubkey = pubkey;

        // Store in localStorage
        localStorage.setItem('admin_npub', pubkey);

        // Show dashboard
        showDashboard();

    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Authentication failed: ' + error.message;
        loginError.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="margin-right: 8px;"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 10a2 2 0 114 0 2 2 0 01-4 0z"/></svg>Login with Nostr';
    }
}

/**
 * Inject admin navigation elements
 */
function injectAdminNav() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    // Check if already injected
    if (document.getElementById('admin-npub-display')) return;

    // Create npub display
    const npubDisplay = document.createElement('span');
    npubDisplay.id = 'admin-npub-display';
    npubDisplay.className = 'admin-npub';
    npubDisplay.style.display = 'none';

    // Create logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'btn btn-secondary';
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.display = 'none';
    logoutBtn.addEventListener('click', logout);

    // Append to nav
    navLinks.appendChild(npubDisplay);
    navLinks.appendChild(logoutBtn);
}

/**
 * Logout
 */
function logout() {
    localStorage.removeItem('admin_npub');
    currentPubkey = null;
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';

    const npubDisplay = document.getElementById('admin-npub-display');
    const logoutBtn = document.getElementById('logout-btn');
    if (npubDisplay) npubDisplay.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

/**
 * Show dashboard
 */
function showDashboard() {
    // Inject admin nav elements first
    injectAdminNav();

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';

    // Update nav
    const npubDisplay = document.getElementById('admin-npub-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (npubDisplay && logoutBtn) {
        // Show truncated npub
        const truncated = currentPubkey.substring(0, 8) + '...' + currentPubkey.substring(currentPubkey.length - 8);
        npubDisplay.textContent = truncated;
        npubDisplay.title = currentPubkey;
        npubDisplay.style.display = 'inline-block';
        logoutBtn.style.display = 'inline-block';
    }

    // Load dashboard data
    loadStats();
    loadHunters();
    loadActivity();
}

/**
 * Load statistics
 */
async function loadStats() {
    try {
        const url = `${API_BASE}/admin-stats.php`;
        const authHeader = await getNIP98AuthHeader(url, 'GET');

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load stats');
        }

        if (data.success && data.stats) {
            const stats = data.stats;
            document.getElementById('stat-total-hunters').textContent = stats.total_hunters || 0;
            document.getElementById('stat-completed').textContent = stats.completed_hunters || 0;
            document.getElementById('stat-sats').textContent = (stats.total_sats_distributed || 0).toLocaleString();
            document.getElementById('stat-avg-stage').textContent = stats.average_stage || '0.0';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        if (error.message.includes('Unauthorized')) {
            logout();
            alert('Authentication failed. Please log in again.');
        }
    }
}

/**
 * Load hunters list
 */
async function loadHunters() {
    const tbody = document.getElementById('hunters-tbody');
    tbody.innerHTML = '<tr class="loading-row"><td colspan="8"><div class="loading-spinner">Loading hunters...</div></td></tr>';

    try {
        const search = document.getElementById('search-input').value;
        const stage = document.getElementById('stage-filter').value;
        const sort = document.getElementById('sort-select').value;

        const params = new URLSearchParams({
            page: currentPage,
            limit: pageLimit,
            search,
            stage,
            sort
        });

        const url = `${API_BASE}/admin-hunters.php?${params}`;
        const authHeader = await getNIP98AuthHeader(url, 'GET');

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load hunters');
        }

        if (data.success && data.hunters) {
            renderHunters(data.hunters);
            updatePagination(data.page, data.pages, data.total);
        }
    } catch (error) {
        console.error('Error loading hunters:', error);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #ff6b6b;">Error: ${error.message}</td></tr>`;

        if (error.message.includes('Unauthorized')) {
            logout();
            alert('Authentication failed. Please log in again.');
        }
    }
}

/**
 * Render hunters in table
 */
function renderHunters(hunters) {
    const tbody = document.getElementById('hunters-tbody');

    if (hunters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--sea-gray);">No hunters found</td></tr>';
        return;
    }

    tbody.innerHTML = hunters.map(hunter => `
        <tr>
            <td>${hunter.id}</td>
            <td>${escapeHtml(hunter.username)}</td>
            <td>${escapeHtml(hunter.flash_username)}</td>
            <td>${escapeHtml(hunter.email)}</td>
            <td>${hunter.current_stage}</td>
            <td>${hunter.total_sats_won.toLocaleString()}</td>
            <td>${new Date(hunter.created_at).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="editHunter(${hunter.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteHunter(${hunter.id}, '${escapeHtml(hunter.username)}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update pagination
 */
function updatePagination(page, totalPages, total) {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    pageInfo.textContent = `Page ${page} of ${totalPages} (${total} total)`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
}

/**
 * Load activity feed
 */
async function loadActivity() {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '<div class="loading-spinner">Loading activity...</div>';

    try {
        const url = `${API_BASE}/admin-stats.php`;
        const authHeader = await getNIP98AuthHeader(url, 'GET');

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader
            }
        });

        const data = await response.json();

        if (data.success && data.stats && data.stats.recent_audit_log) {
            renderActivity(data.stats.recent_audit_log);
        }
    } catch (error) {
        console.error('Error loading activity:', error);
        activityList.innerHTML = `<div style="color: #ff6b6b;">Error loading activity</div>`;
    }
}

/**
 * Render activity feed
 */
function renderActivity(logs) {
    const activityList = document.getElementById('activity-list');

    if (logs.length === 0) {
        activityList.innerHTML = '<div style="color: var(--sea-gray);">No recent activity</div>';
        return;
    }

    activityList.innerHTML = logs.map(log => `
        <div class="activity-item">
            <div class="activity-action">${escapeHtml(log.action)}</div>
            <div class="activity-details">
                ${log.username ? 'Hunter: ' + escapeHtml(log.username) : 'N/A'}
                ${log.ip_address ? ' | IP: ' + log.ip_address : ''}
            </div>
            <div class="activity-time">${new Date(log.created_at).toLocaleString()}</div>
        </div>
    `).join('');
}

/**
 * Edit hunter
 */
window.editHunter = async function(hunterId) {
    // Find hunter in current list
    const tbody = document.getElementById('hunters-tbody');
    const row = Array.from(tbody.querySelectorAll('tr')).find(tr => {
        const firstCell = tr.querySelector('td');
        return firstCell && firstCell.textContent == hunterId;
    });

    if (!row) return;

    const cells = row.querySelectorAll('td');

    // Populate edit form
    document.getElementById('edit-hunter-id').value = hunterId;
    document.getElementById('edit-username').value = cells[1].textContent;
    document.getElementById('edit-flash-username').value = cells[2].textContent;
    document.getElementById('edit-email').value = cells[3].textContent;
    document.getElementById('edit-stage').value = cells[4].textContent;
    document.getElementById('edit-sats').value = cells[5].textContent.replace(/,/g, '');

    // Show modal
    document.getElementById('edit-modal').style.display = 'flex';
};

/**
 * Close edit modal
 */
window.closeEditModal = function() {
    document.getElementById('edit-modal').style.display = 'none';
};

/**
 * Save hunter edits
 */
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-hunter-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const hunterId = document.getElementById('edit-hunter-id').value;
            const updateData = {
                id: parseInt(hunterId),
                username: document.getElementById('edit-username').value,
                flash_username: document.getElementById('edit-flash-username').value,
                email: document.getElementById('edit-email').value,
                current_stage: parseInt(document.getElementById('edit-stage').value),
                total_sats_won: parseInt(document.getElementById('edit-sats').value)
            };

            try {
                const url = `${API_BASE}/admin-hunters.php`;
                const authHeader = await getNIP98AuthHeader(url, 'PUT');

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    },
                    body: JSON.stringify(updateData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update hunter');
                }

                alert('Hunter updated successfully!');
                closeEditModal();
                loadHunters();
            } catch (error) {
                console.error('Error updating hunter:', error);
                alert('Error updating hunter: ' + error.message);
            }
        });
    }
});

/**
 * Delete hunter
 */
window.deleteHunter = async function(hunterId, username) {
    if (!confirm(`Are you sure you want to delete hunter "${username}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const url = `${API_BASE}/admin-hunters.php?id=${hunterId}`;
        const authHeader = await getNIP98AuthHeader(url, 'DELETE');

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete hunter');
        }

        alert('Hunter deleted successfully!');
        loadHunters();
    } catch (error) {
        console.error('Error deleting hunter:', error);
        alert('Error deleting hunter: ' + error.message);
    }
};

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize admin after header is loaded
 */
function initAdmin() {
    // Check if header is loaded
    if (!document.getElementById('navLinks')) {
        // Header not loaded yet, wait and retry
        setTimeout(initAdmin, 100);
        return;
    }

    // Check for existing session
    const savedNpub = localStorage.getItem('admin_npub');
    if (savedNpub) {
        currentPubkey = savedNpub;
        showDashboard();
    }

    // Check for Nostr extension
    checkNostrExtension();

    // Event listeners
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', loginWithNostr);
    }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for header component to load
    initAdmin();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadHunters();
            }, 500);
        });
    }

    const stageFilter = document.getElementById('stage-filter');
    if (stageFilter) {
        stageFilter.addEventListener('change', () => {
            currentPage = 1;
            loadHunters();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentPage = 1;
            loadHunters();
        });
    }

    const refreshBtn = document.getElementById('refresh-hunters-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadHunters);
    }

    const prevPageBtn = document.getElementById('prev-page-btn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadHunters();
            }
        });
    }

    const nextPageBtn = document.getElementById('next-page-btn');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            loadHunters();
        });
    }
});
