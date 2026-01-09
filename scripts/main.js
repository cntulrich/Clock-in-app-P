// Minimal clock in/out and admin demo logic saved to localStorage
(function () {
  'use strict';

  // Utilities
  function $(id) { return document.getElementById(id); }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem('clockState') || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem('clockState', JSON.stringify(state));
  }

  // Clock portal UI
  var statusEl = $('status');
  var clockInBtn = $('clockIn');
  var clockOutBtn = $('clockOut');
  var activityEl = $('activity');

  function renderClock() {
    if (!statusEl) return; // not on this page
    var state = loadState();
    if (state.clockedIn) {
      statusEl.textContent = 'Clocked in since ' + new Date(state.since).toLocaleString();
      clockInBtn.disabled = true;
      clockOutBtn.disabled = false;
    } else {
      statusEl.textContent = 'Not clocked in';
      clockInBtn.disabled = false;
      clockOutBtn.disabled = true;
    }

    var logs = state.logs || [];
    if (!logs.length) {
      activityEl.innerHTML = '<li class="muted">No activity yet</li>';
    } else {
      activityEl.innerHTML = logs.map(function (l) { return '<li>' + escapeHtml(l) + '</li>'; }).join('');
    }
  }

  function clockIn() {
    var state = loadState();
    var t = new Date().toISOString();
    state.clockedIn = true;
    state.since = t;
    state.logs = state.logs || [];
    state.logs.unshift('Clocked in at ' + new Date(t).toLocaleString());
    saveState(state);
    renderClock();
  }

  function clockOut() {
    var state = loadState();
    var t = new Date().toISOString();
    state.clockedIn = false;
    state.logs = state.logs || [];
    state.logs.unshift('Clocked out at ' + new Date(t).toLocaleString());
    saveState(state);
    renderClock();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>\