// Keys of the Caribbean - Registration Form Handler

// API Configuration - Points to private backend server
const API_BASE = 'https://kotc.islandbitcoin.com/api';
// For local development, use: const API_BASE = 'http://localhost:8000/api';

const registerForm = document.getElementById('register-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Form submission handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous messages
    hideMessages();

    // Get form data
    const formData = new FormData(registerForm);
    const data = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim(),
        satoshi_date: formData.get('satoshi_date'),
        satoshi_topic: formData.get('satoshi_topic').trim(),
        agree_rules: formData.get('agree_rules') === 'on',
        age_confirm: formData.get('age_confirm') === 'on'
    };

    // Client-side validation
    if (!validateForm(data)) {
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        const response = await fetch(`${API_BASE}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for CORS
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success! Show message and redirect
            showSuccess(result.message || 'Registration successful! Redirecting...');

            // Store session token if provided
            if (result.token) {
                localStorage.setItem('hunt_token', result.token);
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } else {
            // Show error message from server
            showError(result.message || 'Registration failed. Please try again.');
            setLoadingState(false);
        }

    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error. Please check your connection and try again.');
        setLoadingState(false);
    }
});

// Client-side validation
function validateForm(data) {
    // Username validation
    if (data.username.length < 3 || data.username.length > 20) {
        showError('Username must be between 3 and 20 characters.');
        return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        showError('Username can only contain letters, numbers, and underscores.');
        return false;
    }

    // Email validation
    if (!isValidEmail(data.email)) {
        showError('Please enter a valid email address.');
        return false;
    }

    // Satoshi date validation
    const date = new Date(data.satoshi_date);
    if (isNaN(date.getTime())) {
        showError('Please enter a valid date for the Satoshi question.');
        return false;
    }

    // Satoshi topic validation
    if (data.satoshi_topic.length < 5) {
        showError('Please provide a more complete answer for the whitepaper title.');
        return false;
    }

    // Checkbox validation
    if (!data.agree_rules || !data.age_confirm) {
        showError('You must agree to the rules and confirm you are 18 or older.');
        return false;
    }

    return true;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// UI Helper Functions
function setLoadingState(loading) {
    submitBtn.disabled = loading;

    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';

    // Scroll to error message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';

    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Real-time validation hints
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');

usernameInput.addEventListener('input', (e) => {
    const value = e.target.value;

    if (value.length > 0) {
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            usernameInput.setCustomValidity('Only letters, numbers, and underscores allowed');
        } else if (value.length < 3) {
            usernameInput.setCustomValidity('Minimum 3 characters required');
        } else {
            usernameInput.setCustomValidity('');
        }
    }
});

emailInput.addEventListener('blur', (e) => {
    const value = e.target.value;
    if (value && !isValidEmail(value)) {
        emailInput.setCustomValidity('Please enter a valid email address');
    } else {
        emailInput.setCustomValidity('');
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('hunt_token');

    if (token) {
        // Verify token is still valid
        fetch(`${API_BASE}/verify-session.php`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(result => {
            if (result.valid) {
                // Already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        })
        .catch(() => {
            // Token invalid, clear it
            localStorage.removeItem('hunt_token');
        });
    }
});
