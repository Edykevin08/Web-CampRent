/* ============================================================
   CampRent — sewa.js
   Handles: form validation, localStorage save, redirect
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Navbar Scroll ── */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ── Mobile Menu ── */
  var hamburger = document.getElementById('nav-hamburger');
  var mobileNav = document.getElementById('nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  /* ── Set Minimum Dates ── */
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var todayStr = yyyy + '-' + mm + '-' + dd;

  var inputMulai   = document.getElementById('tgl-mulai');
  var inputSelesai = document.getElementById('tgl-selesai');
  var selectPaket  = document.getElementById('paket');
  var summaryBox   = document.getElementById('booking-summary');

  if (inputMulai)   inputMulai.min = todayStr;
  if (inputSelesai) inputSelesai.min = todayStr;

  /* ── Harga Paket ── */
  var hargaPaket = {
    basic:    50000,
    standard: 85000,
    premium:  130000,
    custom:   0
  };

  var namaPaket = {
    basic:    'Basic (1–2 Orang)',
    standard: 'Standard (3–4 Orang)',
    premium:  'Premium (5–6 Orang)',
    custom:   'Pilih Sendiri'
  };

  /* ── Update Booking Summary ── */
  function updateSummary() {
    if (!summaryBox) return;
    var mulai   = inputMulai   ? inputMulai.value   : '';
    var selesai = inputSelesai ? inputSelesai.value : '';
    var paket   = selectPaket  ? selectPaket.value  : '';

    if (!mulai || !selesai || !paket) {
      summaryBox.style.display = 'none';
      return;
    }

    var tglMulai   = new Date(mulai);
    var tglSelesai = new Date(selesai);
    if (tglSelesai <= tglMulai) {
      summaryBox.style.display = 'none';
      return;
    }

    var durasi = Math.ceil((tglSelesai - tglMulai) / (1000 * 60 * 60 * 24));
    var harga  = hargaPaket[paket] || 0;
    var total  = harga * durasi;

    var elPaket  = document.getElementById('sum-paket');
    var elDurasi = document.getElementById('sum-durasi');
    var elHarga  = document.getElementById('sum-harga');
    var elTotal  = document.getElementById('sum-total');

    if (elPaket)  elPaket.textContent  = namaPaket[paket] || paket;
    if (elDurasi) elDurasi.textContent = durasi + ' hari';
    if (elHarga)  elHarga.textContent  = harga > 0 ? formatRupiah(harga) + '/hari' : 'Sesuai kesepakatan';
    if (elTotal)  elTotal.textContent  = total > 0 ? formatRupiah(total) : 'Hubungi kami';

    summaryBox.style.display = 'block';
  }

  if (inputMulai) {
    inputMulai.addEventListener('change', function () {
      if (inputMulai.value && inputSelesai) {
        var nextDay = new Date(inputMulai.value);
        nextDay.setDate(nextDay.getDate() + 1);
        var nd = String(nextDay.getDate()).padStart(2, '0');
        var nm = String(nextDay.getMonth() + 1).padStart(2, '0');
        var ny = nextDay.getFullYear();
        inputSelesai.min = ny + '-' + nm + '-' + nd;
        if (inputSelesai.value && inputSelesai.value <= inputMulai.value) {
          inputSelesai.value = '';
        }
      }
      updateSummary();
    });
  }

  if (inputSelesai) inputSelesai.addEventListener('change', updateSummary);
  if (selectPaket)  selectPaket.addEventListener('change', updateSummary);

  /* ── Pre-fill data if Editing ── */
  var urlParams = new URLSearchParams(window.location.search);
  var paketParam = urlParams.get('paket');
  var editId = urlParams.get('edit');
  var isEditing = false;
  var itemToEdit = null;

  if (editId) {
    var existingData = JSON.parse(localStorage.getItem('camprent_data') || '[]');
    for (var i = 0; i < existingData.length; i++) {
      if (String(existingData[i].id) === editId) {
        itemToEdit = existingData[i];
        break;
      }
    }
    if (itemToEdit) {
      isEditing = true;
      document.getElementById('nama').value = itemToEdit.nama || '';
      document.getElementById('telepon').value = itemToEdit.telepon || '';
      if (inputMulai) inputMulai.value = itemToEdit.tglMulai || '';
      if (inputSelesai) {
        if (inputMulai && inputMulai.value) {
          var nextDay = new Date(inputMulai.value);
          nextDay.setDate(nextDay.getDate() + 1);
          var nd = String(nextDay.getDate()).padStart(2, '0');
          var nm = String(nextDay.getMonth() + 1).padStart(2, '0');
          var ny = nextDay.getFullYear();
          inputSelesai.min = ny + '-' + nm + '-' + nd;
        }
        inputSelesai.value = itemToEdit.tglSelesai || '';
      }
      document.getElementById('jumlah').value = itemToEdit.jumlah || 1;
      if (selectPaket) selectPaket.value = itemToEdit.paket || '';
      document.getElementById('catatan').value = itemToEdit.catatan || '';
      
      var submitBtn = document.getElementById('btn-submit');
      if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
      
      updateSummary();
    }
  }
  
  if (!isEditing && paketParam && selectPaket) {
    selectPaket.value = paketParam;
    selectPaket.dispatchEvent(new Event('change'));
  }

  /* ── Form Validation ── */
  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (field)   field.classList.add('is-error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add('show'); }
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (field)   field.classList.remove('is-error');
    if (errorEl) errorEl.classList.remove('show');
  }

  function validateField(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return true;
    var val = field.value.trim();

    if (fieldId === 'nama') {
      if (!val)          { setError(fieldId, 'Nama wajib diisi.'); return false; }
      if (val.length < 3){ setError(fieldId, 'Nama minimal 3 karakter.'); return false; }
    }

    if (fieldId === 'telepon') {
      if (!val) { setError(fieldId, 'Nomor HP wajib diisi.'); return false; }
      var phoneRegex = /^(\+62|08)[0-9]{7,12}$/;
      if (!phoneRegex.test(val.replace(/\s|-/g, ''))) {
        setError(fieldId, 'Nomor HP tidak valid. Contoh: 08123456789'); return false;
      }
    }

    if (fieldId === 'tgl-mulai') {
      if (!field.value) { setError(fieldId, 'Tanggal mulai wajib diisi.'); return false; }
    }

    if (fieldId === 'tgl-selesai') {
      if (!field.value) { setError(fieldId, 'Tanggal selesai wajib diisi.'); return false; }
      if (inputMulai && inputMulai.value) {
        var s = new Date(inputMulai.value);
        var e = new Date(field.value);
        if (e <= s) { setError(fieldId, 'Tanggal selesai harus setelah tanggal mulai.'); return false; }
      }
    }

    if (fieldId === 'paket') {
      if (!field.value) { setError(fieldId, 'Pilih paket sewa.'); return false; }
    }

    if (fieldId === 'jumlah') {
      var n = parseInt(val);
      if (isNaN(n) || n < 1)  { setError(fieldId, 'Jumlah orang minimal 1.'); return false; }
      if (n > 30)              { setError(fieldId, 'Jumlah orang maksimal 30.'); return false; }
    }

    clearError(fieldId);
    return true;
  }

  /* ── Real-time validation ── */
  var validatedFields = ['nama', 'telepon', 'tgl-mulai', 'tgl-selesai', 'paket', 'jumlah'];
  validatedFields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function () { validateField(id); });
      el.addEventListener('input', function () {
        if (el.classList.contains('is-error')) validateField(id);
      });
    }
  });

  /* ── Form Submit ── */
  var form = document.getElementById('form-sewa');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      validatedFields.forEach(function (id) {
        if (!validateField(id)) valid = false;
      });

      if (!valid) {
        var firstError = form.querySelector('.is-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showToast('Periksa kembali isian form Anda.', 'error');
        return;
      }

      /* Build data object */
      var tglMulai   = new Date(inputMulai.value);
      var tglSelesai = new Date(inputSelesai.value);
      var durasi     = Math.ceil((tglSelesai - tglMulai) / (1000 * 60 * 60 * 24));
      var harga      = hargaPaket[selectPaket.value] || 0;

      var existing = JSON.parse(localStorage.getItem('camprent_data') || '[]');
      var targetId = isEditing ? parseInt(editId) : Date.now();

      var data = {
        id:         targetId,
        nama:       document.getElementById('nama').value.trim(),
        telepon:    document.getElementById('telepon').value.trim(),
        tglMulai:   inputMulai.value,
        tglSelesai: inputSelesai.value,
        paket:      selectPaket.value,
        paketNama:  namaPaket[selectPaket.value] || selectPaket.value,
        jumlah:     parseInt(document.getElementById('jumlah').value),
        catatan:    document.getElementById('catatan').value.trim(),
        durasi:     durasi,
        total:      harga * durasi,
        status:     isEditing ? itemToEdit.status : 'Menunggu',
        dibuat:     isEditing ? itemToEdit.dibuat : new Date().toISOString()
      };

      /* Save to localStorage */
      if (isEditing) {
        for (var i = 0; i < existing.length; i++) {
          if (existing[i].id === targetId) {
            existing[i] = data;
            break;
          }
        }
      } else {
        existing.push(data);
      }
      localStorage.setItem('camprent_data', JSON.stringify(existing));

      /* Submit button feedback */
      var submitBtn = document.getElementById('btn-submit');
      if (submitBtn) {
        submitBtn.textContent = 'Menyimpan...';
        submitBtn.disabled = true;
      }

      showToast('Pemesanan berhasil disimpan!', 'success');

      setTimeout(function () {
        window.location.href = 'data.html?new=' + data.id;
      }, 1200);
    });
  }

  /* ── Helpers ── */
  function formatRupiah(n) {
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  }

  function showToast(message, type) {
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.innerHTML = (type === 'error' ? '❌ ' : '✅ ') + message;
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

});
