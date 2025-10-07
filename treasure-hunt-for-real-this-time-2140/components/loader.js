/**
 * Component Loader for Keys of the Caribbean
 * Loads header, footer, and coming soon components into pages
 */

// Load header component
async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        try {
            const response = await fetch('components/header.html');
            const html = await response.text();
            headerPlaceholder.innerHTML = html;

            // Initialize mobile menu after header is loaded
            initMobileMenu();
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }
}

// Load footer component
async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        try {
            const response = await fetch('components/footer.html');
            const html = await response.text();
            footerPlaceholder.innerHTML = html;
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }
}

// Load coming soon overlay component
async function loadComingSoon() {
    const comingSoonPlaceholder = document.getElementById('coming-soon-placeholder');
    if (comingSoonPlaceholder) {
        try {
            const response = await fetch('components/coming-soon.html');
            const html = await response.text();
            comingSoonPlaceholder.innerHTML = html;

            // Initialize coming soon logic after component is loaded
            initComingSoon();
        } catch (error) {
            console.error('Error loading coming soon overlay:', error);
        }
    }
}

// Initialize coming soon overlay logic
function initComingSoon() {
    const launchDate = new Date('2025-12-01T00:00:00');
    const now = new Date();
    const overlay = document.getElementById('comingSoonOverlay');

    if (overlay) {
        if (now < launchDate) {
            // Before launch date - show overlay
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            // After launch date - hide overlay
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Initialize mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.hunt-nav')) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

// Load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadHeader();
        loadFooter();
        loadComingSoon();
    });
} else {
    loadHeader();
    loadFooter();
    loadComingSoon();
}
