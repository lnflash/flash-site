/**
 * Component Loader
 * Loads reusable HTML components before page scripts execute
 * Uses synchronous approach to ensure components are available
 */

(function() {
  'use strict';

  /**
   * Calculate the base path based on current page location
   */
  function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;

    if (depth === 0) return './';
    if (depth === 1) return '../';
    if (depth === 2) return '../../';
    return '../../../';
  }

  /**
   * Load component synchronously using XMLHttpRequest
   * This ensures components are loaded before other scripts execute
   */
  function loadComponentSync(componentPath, targetSelector) {
    const target = document.querySelector(targetSelector);

    if (!target) {
      console.warn(`Component target not found: ${targetSelector}`);
      return false;
    }

    const basePath = getBasePath();
    const fullPath = basePath + componentPath;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', fullPath, false); // false = synchronous
      xhr.send();

      if (xhr.status === 200) {
        target.innerHTML = xhr.responseText;
        return true;
      } else {
        console.error(`Failed to load component: ${componentPath} (${xhr.status})`);
        return false;
      }
    } catch (error) {
      console.error('Component loading error:', error);
      return false;
    }
  }

  /**
   * Load all common components synchronously
   * This runs immediately when the script loads
   */
  function loadCommonComponents() {
    // These load in order, blocking until each completes
    loadComponentSync('components/header.html', '#header-placeholder');
    loadComponentSync('components/footer.html', '#footer-placeholder');
    loadComponentSync('components/svg-icons.html', '#svg-icons-placeholder');

    // Dispatch custom event when all components are loaded
    document.dispatchEvent(new Event('componentsLoaded'));
  }

  /**
   * Execute immediately - placeholders are already in DOM when this script loads
   * The script is placed right after the placeholders in the HTML
   */
  loadCommonComponents();

  // Expose utilities globally
  window.FlashComponents = {
    getBasePath: getBasePath,
    loadSync: loadComponentSync
  };

})();
