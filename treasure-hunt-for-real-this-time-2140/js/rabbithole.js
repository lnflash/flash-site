// Keys of the Caribbean - Rabbit Hole (Stage 1) Handler

const loadingScreen = document.getElementById('loading-screen');
const errorScreen = document.getElementById('error-screen');
const stage1Content = document.getElementById('stage1-content');
const stageFooter = document.getElementById('stage-footer');
const errorMessage = document.getElementById('error-message');
const completeStageBtn = document.getElementById('complete-stage1-btn');
const stageMessage = document.getElementById('stage-message');

let hunterData = null;
let stage1Token = null;

// Get token from URL
function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

// Verify Stage 1 token
async function verifyStage1Token(token) {
    try {
        const response = await fetch('/treasure-hunt/api/verify-stage1.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return data;
        } else {
            throw new Error(data.message || 'Token verification failed');
        }
    } catch (error) {
        throw error;
    }
}

// Show error screen
function showError(message) {
    loadingScreen.style.display = 'none';
    errorScreen.style.display = 'flex';
    errorMessage.textContent = message;
}

// Show stage content
function showStageContent(data) {
    hunterData = data.hunter;

    loadingScreen.style.display = 'none';
    stage1Content.style.display = 'block';
    stageFooter.style.display = 'block';

    // Check if already completed
    if (hunterData.current_stage > 0) {
        showMessage('You have already completed Stage 1. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
}

// Complete Stage 1 and claim prize
async function completeStage1() {
    const btnText = completeStageBtn.querySelector('.btn-text');
    const btnLoader = completeStageBtn.querySelector('.btn-loader');

    // Disable button
    completeStageBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';

    try {
        const response = await fetch('/treasure-hunt/api/complete-stage1.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hunt_token')}`
            },
            body: JSON.stringify({
                stage1_token: stage1Token
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Success! Show prize claim UI
            showMessage('🎉 Stage 1 Complete! Generating your prize...', 'success');

            // Wait 2 seconds then show LNURL
            setTimeout(() => {
                if (data.lnurl_w) {
                    showLNURLWithdrawal(data.lnurl_w, data.prize_amount);
                } else {
                    showMessage('Stage 1 complete! Advancing to Stage 2...', 'success');
                    setTimeout(() => {
                        window.location.href = 'stage2.html';
                    }, 2000);
                }
            }, 2000);

        } else {
            throw new Error(data.message || 'Failed to complete stage');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
        completeStageBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Show LNURL withdrawal
function showLNURLWithdrawal(lnurl, amount) {
    const container = document.createElement('div');
    container.className = 'lnurl-container';
    container.innerHTML = `
        <h3>⚡ Claim Your Prize</h3>
        <p class="prize-amount">${amount} sats</p>

        <div class="lnurl-qr">
            <div id="qrcode"></div>
        </div>

        <div class="lnurl-instructions">
            Scan this QR code with your Lightning wallet to claim your prize, or copy the LNURL below.
        </div>

        <div class="lnurl-code" id="lnurl-code">${lnurl}</div>

        <button class="copy-btn" onclick="copyLNURL()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z"/>
                <path d="M2 6h2v2H2V6zm0 3h2v2H2V9zm0 3h2v2H2v-2zm0-9h2v2H2V3z"/>
            </svg>
            Copy LNURL
        </button>

        <div style="margin-top: 2rem;">
            <a href="stage2.html" class="btn btn-primary">Continue to Stage 2 →</a>
        </div>
    `;

    // Replace stage action content
    const stageAction = document.querySelector('.stage-action');
    stageAction.innerHTML = '';
    stageAction.appendChild(container);

    // Generate QR code (you'll need to include QRCode.js library)
    if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById('qrcode'), {
            text: lnurl,
            width: 200,
            height: 200
        });
    } else {
        document.getElementById('qrcode').innerHTML = `
            <div style="width: 200px; height: 200px; background: #eee; display: flex; align-items: center; justify-content: center; color: #333;">
                QR Code
            </div>
        `;
    }
}

// Copy LNURL to clipboard
window.copyLNURL = function() {
    const lnurlCode = document.getElementById('lnurl-code');
    const text = lnurlCode.textContent;

    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
            Copied!
        `;

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
};

// Show message
function showMessage(message, type = 'info') {
    stageMessage.textContent = message;
    stageMessage.className = `stage-message ${type}`;
    stageMessage.style.display = 'block';

    // Scroll to message
    stageMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Event Listeners
completeStageBtn.addEventListener('click', completeStage1);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    stage1Token = getTokenFromURL();

    if (!stage1Token) {
        showError('No token provided. Please start from the beginning.');
        return;
    }

    try {
        const data = await verifyStage1Token(stage1Token);
        showStageContent(data);
    } catch (error) {
        showError(error.message || 'Invalid or expired token. Please try again.');
    }
});
