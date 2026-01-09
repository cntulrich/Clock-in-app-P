// Minimal clock in/out and admin demo logic saved to localStorage
(function () {
  'use strict';

  // Short selector helper
  function $(id) { return document.getElementById(id); }

  // Load/save state with defensive parsing
  function loadState() {
    try {
      var raw = localStorage.getItem('clockState');
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (e) {
      console.warn('Failed to parse clockState from localStorage, resetting.');
      return {};
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem('clockState', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  // Escape helper to avoid HTML injection
  function escapeHtml(s) {
    return String(s).replace(/[&<>\"'\/]/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;","/":"&#47;"}[c]);
    });
  }

  // Clock UI rendering
  function renderClock() {
    var statusEl = $('status');
    var clockInBtn = $('clockIn');
    var clockOutBtn = $('clockOut');
    var activityEl = $('activity');
    if (!statusEl) return;

    var state = loadState();
    var clockedIn = !!state.clockedIn;
    if (clockedIn) {
      statusEl.textContent = 'Clocked in since ' + (new Date(state.since)).toLocaleString();
      if (clockInBtn) clockInBtn.disabled = true;
      if (clockOutBtn) clockOutBtn.disabled = false;
    } else {
      statusEl.textContent = 'Not clocked in';
      if (clockInBtn) clockInBtn.disabled = false;
      if (clockOutBtn) clockOutBtn.disabled = true;
    }

    var logs = state.logs || [];
    if (!activityEl) return;
    if (!logs.length) {
      activityEl.innerHTML = '<li class="muted">No activity yet</li>';
    } else {
      activityEl.innerHTML = logs.map(function (l) { return '<li>' + escapeHtml(l) + '</li>'; }).join('');
    }
  }

  function doClockIn() {
    var state = loadState();
    var t = new Date().toISOString();
    state.clockedIn = true;
    state.since = t;
    state.logs = state.logs || [];
    state.logs.unshift('Clocked in at ' + new Date(t).toLocaleString());
    saveState(state);
    renderClock();
    renderAudit();
  }

  function doClockOut() {
    var state = loadState();
    var t = new Date().toISOString();
    state.clockedIn = false;
    state.logs = state.logs || [];
    state.logs.unshift('Clocked out at ' + new Date(t).toLocaleString());
    saveState(state);
    renderClock();
    renderAudit();
  }

  // Employee management
  function renderEmployees() {
    var empList = $('employeeList');
    if (!empList) return;
    var state = loadState();
    var emps = state.employees || [];
    if (!emps.length) {
      empList.innerHTML = '<li class="muted">No employees yet</li>';
      return;
    }
    empList.innerHTML = emps.map(function (e, i) {
      return '<li class="employee-item"><div><strong>' + escapeHtml(e.name) + '</strong>' + (e.email ? ' — ' + escapeHtml(e.email) : '') + '</div><div><button data-i="' + i + '" class="btn btn-sm btn-danger remove-emp">Remove</button></div></li>';
    }).join('');

    Array.prototype.slice.call(document.querySelectorAll('.remove-emp')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = Number(btn.getAttribute('data-i'));
        removeEmployee(i);
      });
    });
  }

  function addEmployee(name, email) {
    var state = loadState();
    state.employees = state.employees || [];
    state.employees.push({ name: name, email: email });
    saveState(state);
    renderEmployees();
  }

  function removeEmployee(index) {
    var state = loadState();
    state.employees = state.employees || [];
    if (index >= 0 && index < state.employees.length) {
      state.employees.splice(index, 1);
      saveState(state);
      renderEmployees();
    }
  }

  // Audit logs
  function renderAudit() {
    var auditList = $('auditList');
    if (!auditList) return;
    var state = loadState();
    var logs = state.logs || [];
    if (!logs.length) {
      auditList.innerHTML = '<li class="muted">No logs yet</li>';
      return;
    }
    auditList.innerHTML = logs.map(function (l) { return '<li>' + escapeHtml(l) + '</li>'; }).join('');
  }

  // Sidebar toggle
  function toggleSidebar(id) {
    var sb = document.getElementById(id);
    if (!sb) return;
    sb.classList.toggle('hidden');
  }

  // Attach event listeners
  document.addEventListener('DOMContentLoaded', function () {
    var clockInBtn = $('clockIn');
    var clockOutBtn = $('clockOut');
    if (clockInBtn) clockInBtn.addEventListener('click', doClockIn);
    if (clockOutBtn) clockOutBtn.addEventListener('click', doClockOut);

    var menuBtn = $('menuButton');
    if (menuBtn) menuBtn.addEventListener('click', function () { toggleSidebar('sidebar'); });
    var menuBtnAdmin = $('menuButtonAdmin');
    if (menuBtnAdmin) menuBtnAdmin.addEventListener('click', function () { toggleSidebar('sidebar'); });

    var empForm = $('employeeForm');
    if (empForm) {
      empForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var nameEl = $('empName');
        var emailEl = $('empEmail');
        var name = nameEl ? nameEl.value.trim() : '';
        var email = emailEl ? emailEl.value.trim() : '';
        if (!name) return alert('Please enter a name');
        addEmployee(name, email);
        if (empForm.reset) empForm.reset();
      });
    }

    // Initial renders
    renderClock();
    renderEmployees();
    renderAudit();
  });

})();
