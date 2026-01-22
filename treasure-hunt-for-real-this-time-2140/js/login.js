const API_BASE = 'https://kotc.islandbitcoin.com/api';

const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const identifier = document.getElementById('identifier').value.trim();

    if (identifier.length < 3) {
        showError('Please enter a valid username, email, or Flash username.');
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ identifier })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess(result.message || 'Login successful! Redirecting...');

            if (result.token) {
                localStorage.setItem('hunt_token', result.token);
            }

            setTimeout(() => {
                window.location.href = 'dashboard.html?t=' + Date.now();
            }, 1500);

        } else {
            showError(result.message || 'Login failed. Please try again.');
            setLoadingState(false);
        }

    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection and try again.');
        setLoadingState(false);
    }
});

function setLoadingState(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoader.style.display = loading ? 'inline-flex' : 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('hunt_token');

    if (token) {
        fetch(`${API_BASE}/verify-session.php`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(result => {
            if (result.valid) {
                window.location.href = 'dashboard.html?t=' + Date.now();
            }
        })
        .catch(() => {
            localStorage.removeItem('hunt_token');
        });
    }
});
