// Job Filters and Search Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Only run on pages with job listings
    if (!document.querySelector('.job-listings')) return;

    const jobCards = document.querySelectorAll('.job-card');
    const searchInput = document.getElementById('job-search');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Expand/Collapse Job Cards
    jobCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't collapse if clicking on Apply Now button or inside job footer
            if (e.target.closest('.apply-now-btn') || e.target.closest('.job-footer')) {
                return;
            }

            // Toggle collapsed state
            this.classList.toggle('collapsed');
        });
    });

    // Job Application Modal Functionality
    const modal = document.getElementById('application-modal');
    const modalForm = document.getElementById('job-application-form');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    const cancelBtn = document.getElementById('cancel-application');
    const applyButtons = document.querySelectorAll('.apply-now-btn');
    const jobPositionName = document.getElementById('job-position-name');
    const positionNameInput = document.getElementById('position-name');
    const fileInput = document.getElementById('applicant-resume');
    const fileWrapper = document.querySelector('.file-upload-wrapper');
    const fileName = document.querySelector('.file-name');
    const successDiv = document.querySelector('.submission-success');
    const closeSuccessBtn = document.getElementById('close-success');

    // Open Modal
    applyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const jobCard = this.closest('.job-card');
            const jobTitle = jobCard.querySelector('.job-title').textContent;

            // Set job title in modal
            jobPositionName.textContent = jobTitle;
            positionNameInput.value = jobTitle;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close Modal Functions
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form after animation
        setTimeout(() => {
            modalForm.reset();
            fileWrapper.classList.remove('has-file');
            fileName.textContent = 'Click to upload or drag & drop';
            modalForm.style.display = 'block';
            successDiv.style.display = 'none';
        }, 300);
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    closeSuccessBtn.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // File Upload Handler
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                this.value = '';
                return;
            }

            fileName.textContent = file.name;
            fileWrapper.classList.add('has-file');
        }
    });

    // Form Submission
    modalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);

        // Here you would normally send the data to your server
        // For now, we'll just show the success message
        console.log('Application submitted for:', formData.get('position-name'));
        console.log('Applicant:', formData.get('applicant-name'));
        console.log('Email:', formData.get('applicant-email'));
        console.log('Phone:', formData.get('applicant-phone'));
        console.log('LinkedIn:', formData.get('applicant-linkedin'));
        console.log('Message:', formData.get('applicant-message'));
        console.log('Resume:', formData.get('applicant-resume').name);

        // Show success message
        modalForm.style.display = 'none';
        successDiv.style.display = 'block';

        // Scroll to top of modal
        document.querySelector('.modal-content').scrollTop = 0;
    });

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterJobs(searchTerm, getActiveFilter());
        });
    }

    // Filter Functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter jobs
            const filterType = this.dataset.filter;
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterJobs(searchTerm, filterType);
        });
    });

    // Filter Jobs Function
    function filterJobs(searchTerm, filterType) {
        jobCards.forEach(card => {
            const jobTitle = card.querySelector('.job-title').textContent.toLowerCase();
            const jobDescription = card.querySelector('.job-description').textContent.toLowerCase();
            const jobType = card.dataset.type;

            // Check if matches search term
            const matchesSearch = searchTerm === '' ||
                                  jobTitle.includes(searchTerm) ||
                                  jobDescription.includes(searchTerm);

            // Check if matches filter
            const matchesFilter = filterType === 'all' || jobType === filterType;

            // Show/hide card
            if (matchesSearch && matchesFilter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Show message if no results
        updateNoResultsMessage();
    }

    // Get Active Filter
    function getActiveFilter() {
        const activeButton = document.querySelector('.filter-btn.active');
        return activeButton ? activeButton.dataset.filter : 'all';
    }

    // Update No Results Message
    function updateNoResultsMessage() {
        const visibleCards = document.querySelectorAll('.job-card:not(.hidden)');
        const listings = document.querySelector('.job-listings');
        let noResultsMsg = document.querySelector('.no-results-message');

        if (visibleCards.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.innerHTML = `
                    <p style="text-align: center; padding: 40px; color: var(--text-colour); opacity: 0.7; font-size: 1.1rem;">
                        No positions found. Try adjusting your search or filters.
                    </p>
                `;
                listings.appendChild(noResultsMsg);
            }
        } else {
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
    }
});
