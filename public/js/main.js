(function () {
  'use strict';

  var WA_NUMBER = '447359307175';
  var BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
  }

  // Mobile call/WhatsApp bar: hide while the quote form is on screen so it never covers fields
  var sticky = document.getElementById('stickyActions');
  var quote = document.getElementById('quote');
  if (sticky && quote && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      sticky.classList.toggle('is-hidden', entries.some(function (en) { return en.isIntersecting; }));
    }, { threshold: 0.08 }).observe(quote);
  }

  // Photo viewer (native <dialog>)
  var dialog = document.getElementById('lightbox');
  var photos = Array.prototype.slice.call(document.querySelectorAll('.photo'));
  if (dialog && photos.length && typeof dialog.showModal === 'function') {
    var lbImg = document.getElementById('lightbox-img');
    var lbCount = document.getElementById('lb-count');
    var current = 0, opener = null;
    var show = function (i) {
      current = (i + photos.length) % photos.length;
      var btn = photos[current];
      lbImg.src = btn.getAttribute('data-full');
      lbImg.alt = btn.querySelector('img').alt;
      lbCount.textContent = (current + 1) + ' / ' + photos.length;
    };
    photos.forEach(function (btn, i) {
      btn.addEventListener('click', function () { opener = btn; show(i); dialog.showModal(); });
    });
    document.getElementById('lb-prev').addEventListener('click', function () { show(current - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(current + 1); });
    document.getElementById('lb-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog || e.target.classList.contains('lightbox-inner')) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    dialog.addEventListener('close', function () { lbImg.src = BLANK; if (opener) opener.focus(); });
  } else {
    photos.forEach(function (b) { b.classList.add('no-zoom'); });
  }

  // ---------- Enquiry form ----------
  var form = document.getElementById('bookingForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var progressBar = document.getElementById('progress');
  var progressDots = progressBar.querySelectorAll('span');
  var stepCount = document.getElementById('stepCount');
  var currentStep = 1;

  function showStep(n, focusHeading) {
    currentStep = n;
    steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== n; });
    Array.prototype.forEach.call(progressDots, function (d, i) { d.classList.toggle('on', i < n); });
    progressBar.setAttribute('aria-valuenow', String(n));
    stepCount.textContent = 'Step ' + n + ' of 3';
    if (focusHeading) {
      var h = steps[n - 1].querySelector('h3');
      if (h) h.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function firstInvalid(stepEl) {
    var els = stepEl.querySelectorAll('input, select, textarea');
    for (var i = 0; i < els.length; i++) {
      if (!els[i].disabled && !els[i].checkValidity()) return els[i];
    }
    return null;
  }

  function validateStep(n) {
    var bad = firstInvalid(steps[n - 1]);
    if (bad) { bad.reportValidity(); return false; }
    return true;
  }

  form.addEventListener('click', function (e) {
    var next = e.target.closest('[data-next]');
    var back = e.target.closest('[data-back]');
    if (next) { if (validateStep(currentStep)) showStep(currentStep + 1, true); }
    if (back) { showStep(currentStep - 1, true); }
  });

  // Date: no past dates
  var dateInput = document.getElementById('date');
  if (dateInput) {
    var t = new Date();
    dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  // "Other" date flexibility reveals a detail box
  var flexOtherWrap = document.getElementById('flexOtherWrap');
  var flexOther = document.getElementById('flexOther');
  function updateFlex() {
    var show = form.elements.flexibility.value === 'Other';
    flexOtherWrap.hidden = !show;
    if (!show) flexOther.value = '';
  }
  Array.prototype.forEach.call(form.elements.flexibility, function (r) { r.addEventListener('change', updateFlex); });

  // Lift question only appears above the ground floor
  ['c', 'd'].forEach(function (p) {
    var floor = document.getElementById(p + '-floor');
    var wrap = document.getElementById(p + '-lift-wrap');
    floor.addEventListener('change', function () {
      var show = floor.value !== '' && floor.value !== 'Ground';
      wrap.hidden = !show;
      if (!show) Array.prototype.forEach.call(form.elements[p + '-lift'], function (r) { r.checked = false; });
    });
  });

  // No delivery address
  var noDelivery = document.getElementById('noDelivery');
  var deliveryFields = document.getElementById('deliveryFields');
  function updateDelivery() {
    var none = noDelivery.checked;
    deliveryFields.hidden = none;
    Array.prototype.forEach.call(deliveryFields.querySelectorAll('input, select'), function (el) { el.disabled = none; });
  }
  noDelivery.addEventListener('change', updateDelivery);

  // Postcodes in capitals
  ['c-post', 'd-post'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('change', function () { el.value = el.value.trim().toUpperCase(); });
  });

  // Item steppers
  Array.prototype.forEach.call(form.querySelectorAll('.item'), function (item) {
    var out = item.querySelector('.count');
    var minus = item.querySelector('[data-dir="-1"]');
    item.addEventListener('click', function (e) {
      var btn = e.target.closest('.step-btn');
      if (!btn) return;
      var n = Math.max(0, Math.min(99, Number(out.textContent) + Number(btn.getAttribute('data-dir'))));
      out.textContent = n;
      minus.disabled = n === 0;
    });
  });

  // ---------- Build the WhatsApp message ----------
  function val(name) {
    var el = form.elements[name];
    return el && el.value ? String(el.value).trim() : '';
  }
  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function capFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function describeAccess(p) {
    var parts = [];
    var type = val(p + '-type'), floor = val(p + '-floor'), lift = val(p + '-lift'), park = val(p + '-park');
    if (type) parts.push(type.toLowerCase());
    if (floor) {
      parts.push(floor === 'Ground' ? 'ground floor' : floor === '3rd or higher' ? '3rd floor or higher' : floor + ' floor');
    }
    if (lift) parts.push(lift === 'Yes' ? 'lift available' : lift === 'No' ? 'no lift' : 'lift unknown');
    if (park) parts.push(park === 'At the door' ? 'parking at the door' : park === 'Short walk' ? 'short walk to parking' : 'long carry to parking');
    return capFirst(parts.join(', '));
  }
  function itemsText() {
    var list = [];
    Array.prototype.forEach.call(form.querySelectorAll('.item'), function (item) {
      var n = Number(item.querySelector('.count').textContent);
      if (n > 0) list.push(n + ' ' + (n === 1 ? item.getAttribute('data-one') : item.getAttribute('data-many')));
    });
    return list.length ? list.join(', ') : 'Not specified';
  }
  function buildMessage() {
    var lines = ['YORKSHIRE MAN AND VAN REMOVALS', 'NEW WEBSITE ENQUIRY', ''];
    lines.push('Service: ' + (val('service') || 'Not provided'));
    var dateLine = val('date') ? formatDate(val('date')) : 'Not provided';
    var flex = val('flexibility');
    if (val('date') && flex) dateLine += ' (' + flex + (flex === 'Other' && val('flexOther') ? ': ' + val('flexOther') : '') + ')';
    else if (!val('date') && flex === 'Other' && val('flexOther')) dateLine += ' (' + val('flexOther') + ')';
    lines.push('Date: ' + dateLine, '');

    lines.push('Collect from: ' + val('c-post'));
    var ca = describeAccess('c'); if (ca) lines.push(ca);
    lines.push('');
    if (noDelivery.checked) {
      lines.push('Deliver to: No delivery address');
    } else {
      lines.push('Deliver to: ' + val('d-post'));
      var da = describeAccess('d'); if (da) lines.push(da);
    }
    lines.push('');
    lines.push('Items: ' + itemsText());
    if (val('heavy')) lines.push('Heavy or awkward: ' + val('heavy'));
    var extras = Array.prototype.map.call(form.querySelectorAll('input[name="extras"]:checked'), function (c) { return c.value; });
    if (extras.length) lines.push('Extras: ' + extras.join(', '));
    if (val('team')) lines.push('Team size: ' + val('team'));
    lines.push('');
    lines.push('Contact: ' + val('name') + ', ' + val('phone'));
    if (val('email')) lines.push('Email: ' + val('email'));
    return lines.join('\n');
  }

  // ---------- Submit ----------
  var result = document.getElementById('formResult');
  var resultLink = document.getElementById('resultLink');
  var copyBtn = document.getElementById('copyBtn');
  var lastMessage = '';

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    for (var n = 1; n <= 3; n++) {
      var bad = firstInvalid(steps[n - 1]);
      if (bad) { showStep(n, false); bad.reportValidity(); return; }
    }
    lastMessage = buildMessage();
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lastMessage);
    resultLink.href = url;
    result.hidden = false;

    var win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win && /Instagram|FBAN|FBAV|TikTok/i.test(navigator.userAgent)) window.location.href = url;
    result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function (ok) {
        copyBtn.textContent = ok ? 'Copied ✓' : 'Press and hold to copy';
        setTimeout(function () { copyBtn.textContent = 'Copy my message'; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastMessage).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });
  }

  showStep(1, false);
})();
