/**
 * Dark Mode Initialization
 * This script runs immediately to prevent dark mode flicker
 * Must be loaded in <head> before page renders
 */

// DO NOT ADD OTHER SCRIPTS HERE
if (localStorage.getItem("theme")) {
  let t = localStorage.getItem("theme");
  const r = document.querySelector(':root');
  t === "light" ? r.style.setProperty("--bg-body", "#fff") : r.style.setProperty("--bg-body", "#000");
}
