// Devam Takip Sistemi - istemci tarafi yardimci betikler

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.confirm-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var message = form.getAttribute('data-confirm') || 'Emin misiniz?';
      if (!window.confirm(message)) e.preventDefault();
    });
  });

  function toggleRow(selectEl) {
    var row = selectEl.closest('tr') || selectEl.closest('form') || document;
    var status = selectEl.value;
    row.querySelectorAll('input').forEach(function (input) {
      var name = input.getAttribute('name') || '';
      if (name.indexOf('checkIn') !== -1 || name.indexOf('checkOut') !== -1) {
        var disable = status && status !== 'Geldi';
        if (disable) { input.value = ''; input.setAttribute('disabled', 'disabled'); }
        else input.removeAttribute('disabled');
      }
    });
  }

  document.querySelectorAll('.status-select').forEach(function (sel) {
    sel.addEventListener('change', function () { toggleRow(sel); });
  });

  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      form.querySelectorAll('input[type="time"][disabled]').forEach(function (i) { i.removeAttribute('disabled'); });
    });
  });
});
