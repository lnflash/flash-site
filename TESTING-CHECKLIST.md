# Component System Testing Checklist

## Overview
This checklist ensures all pages correctly load components and maintain functionality after the component system migration.

---

## Pre-Testing Setup

- [ ] Ensure you're running a local web server (not opening files directly)
  - **Why:** Component loading requires HTTP protocol
  - **How:** Run `python3 -m http.server 8000` or use Live Server in VS Code

---

## Core Functionality Tests (Test on ALL pages)

### 1. Component Loading
- [ ] Header loads and displays correctly
- [ ] Footer loads and displays correctly
- [ ] SVG icons (lightbulb, plus/minus) render correctly

### 2. Navigation
- [ ] Mobile hamburger menu opens/closes
- [ ] All navigation links work
- [ ] Active page is highlighted correctly
- [ ] Desktop navigation displays properly

### 3. Dark Mode
- [ ] No "flash of unstyled content" on page load
- [ ] Dark mode toggle switches theme
- [ ] Theme persists across page refreshes
- [ ] Lightbulb icon displays in both modes

### 4. Bitcoin Price Widget
- [ ] Widget displays in header
- [ ] Price loads and displays (may take 10s)
- [ ] Price updates with animation
- [ ] No console errors related to btcTracker

### 5. Styling
- [ ] All CSS loads correctly (no unstyled content)
- [ ] Page-specific styles apply correctly
- [ ] Responsive design works (test mobile/tablet/desktop)
- [ ] No CSS conflicts or override issues

### 6. JavaScript
- [ ] No console errors
- [ ] All interactive elements work
- [ ] Forms submit correctly (if applicable)
- [ ] Animations/transitions work

---

## Page-Specific Tests

### ✅ Already Tested (Manual verification completed)
- [x] index.html - Homepage
- [x] mission.html - Mission page
- [x] team.html - Team page

### 📋 Pages to Test After Script Execution

#### Blog Pages
- [ ] **blog/index.html**
  - [ ] Blog post grid displays
  - [ ] Read more buttons work
  - [ ] Images load correctly

- [ ] **blog/post-2.html**
  - [ ] Article content displays
  - [ ] Images load
  - [ ] Navigation arrows work (if present)

- [ ] **blog/post-3.html**
  - [ ] Article content displays
  - [ ] Images load

- [ ] **blog/post-4.html**
  - [ ] Article content displays
  - [ ] Images load
  - [ ] Open Graph meta tags present

#### Legal Pages
- [ ] **legal/terms.html**
  - [ ] Terms content displays fully
  - [ ] Internal anchors work

- [ ] **legal/privacy.html**
  - [ ] Privacy policy content displays
  - [ ] Internal anchors work

#### Subdirectory Pages (After Script Execution)
- [ ] **rewards/index.html**
  - [ ] Rewards content displays
  - [ ] Page-specific CSS applies

- [ ] **pulse/index.html**
  - [ ] Pulse content displays

- [ ] **sales/index.html**
  - [ ] Sales content displays

- [ ] **metrics/index.html**
  - [ ] Metrics content displays
  - [ ] Page-specific CSS applies

- [ ] **minutes/index.html**
  - [ ] Minutes content displays

- [ ] **training/index.html**
  - [ ] Training content displays

- [ ] **invite/index.html**
  - [ ] Invite content displays

- [ ] **map/index.html**
  - [ ] Map content displays
  - [ ] Page-specific CSS applies

---

## Browser Compatibility Testing

Test on at least 2 browsers:

- [ ] **Chrome/Edge** (Chromium-based)
  - [ ] All core functionality works
  - [ ] No console errors

- [ ] **Firefox**
  - [ ] All core functionality works
  - [ ] No console errors

- [ ] **Safari** (if on Mac)
  - [ ] All core functionality works
  - [ ] No console errors

---

## Responsive Testing

Test each page at these breakpoints:

- [ ] **Mobile** (375px width)
  - [ ] Mobile menu works
  - [ ] Content doesn't overflow
  - [ ] Touch interactions work

- [ ] **Tablet** (768px width)
  - [ ] Layout adapts appropriately
  - [ ] All interactions work

- [ ] **Desktop** (1920px width)
  - [ ] Full layout displays
  - [ ] All features accessible

---

## Performance Testing

- [ ] **Page Load Speed**
  - [ ] Components load synchronously (no flicker)
  - [ ] Page is interactive within 2 seconds
  - [ ] No layout shift after component load

- [ ] **Network Tab**
  - [ ] All component files (header, footer, SVG) load successfully (200 status)
  - [ ] CSS files load correctly
  - [ ] JS files load in correct order

---

## Common Issues & Solutions

### Issue: Components don't load
**Solution:** Ensure you're using a web server, not opening files directly (file:// protocol)

### Issue: "Flash of unstyled content"
**Solution:** Check that dark-mode-init.js loads in `<head>` before body renders

### Issue: Navigation doesn't work
**Solution:** Verify component-loader.js loads before main.js and btcTracker.js

### Issue: Bitcoin price doesn't update
**Solution:** Check Network tab for API errors, may be rate-limited

### Issue: Styles missing
**Solution:** Verify CSS file paths are correct and files exist in css/pages/

---

## Final Verification

- [ ] All pages load without errors
- [ ] All interactive features work
- [ ] Dark mode works across all pages
- [ ] Navigation works from any page to any page
- [ ] Mobile experience is smooth
- [ ] No console errors on any page
- [ ] Performance is acceptable (< 3s load time)

---

## Cleanup (Once testing passes)

- [ ] Remove all .bak files: `find . -name '*.bak' -delete`
- [ ] Remove OPTIMIZATION-SUMMARY.md (if no longer needed)
- [ ] Update README if changes needed
- [ ] Consider adding components/ to .gitignore (NO - these are needed!)

---

## Testing Status

**Started:** ___________
**Completed:** ___________
**Tested By:** ___________

**Issues Found:**
```
(List any issues discovered during testing)


```

**Resolution Notes:**
```
(Document how issues were resolved)


```

---

## Success Criteria

All checkboxes above must be checked before considering the migration complete.

**Estimated Time:** 30-45 minutes for complete testing
