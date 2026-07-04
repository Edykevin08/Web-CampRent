/* ============================================================
   CampRent — data.js
   Handles: read localStorage, render table, search,
            delete, status change, export CSV
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  var STORAGE_KEY = 'camprent_data';

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

  /* ── Elements ── */
  var tableBody    = document.getElementById('data-tbody');
  var emptyState   = document.getElementById('empty-state');
  var tableWrapper = document.getElementById('table-wrapper');
  var searchInput  = document.getElementById('search-input');
  var statTotal    = document.getElementById('stat-total');
  var statMenunggu = document.getElementById('stat-menunggu');
  var statAktif    = document.getElementById('stat-aktif');
  var statSelesai  = document.getElementById('stat-selesai');

  var allData = [];

  /* ── Load Data ── */
  function loadData() {
    allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Sort: newest first
    allData.sort(function (a, b) {
      return new Date(b.dibuat) - new Date(a.dibuat);
    });
    updateStats();
    renderTable(allData);
  }

  /* ── Update Stats ── */
  function updateStats() {
    if (statTotal)    statTotal.textContent    = allData.length;
    if (statMenunggu) statMenunggu.textContent = allData.filter(function (d) { return d.status === 'Menunggu'; }).length;
    if (statAktif)    statAktif.textContent    = allData.filter(function (d) { return d.status === 'Aktif'; }).length;
    if (statSelesai)  statSelesai.textContent  = allData.filter(function (d) { return d.status === 'Selesai'; }).length;
  }

  /* ── Format Helpers ── */
  function formatDate(str) {
    if (!str) return '-';
    var d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatRupiah(n) {
    if (!n || n <= 0) return 'Sesuai kesepakatan';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  function getStatusClass(status) {
    if (status === 'Menunggu')   return 'badge badge-accent';
    if (status === 'Aktif')      return 'badge badge-primary';
    if (status === 'Selesai')    return 'badge badge-secondary';
    if (status === 'Dibatalkan') return 'badge badge-danger';
    return 'badge badge-neutral';
  }

  /* ── Render Table ── */
  function renderTable(data) {
    if (!tableBody) return;

    if (data.length === 0) {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (emptyState)   emptyState.style.display   = 'block';
      return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (emptyState)   emptyState.style.display   = 'none';

    tableBody.innerHTML = '';

    var highlightId = new URLSearchParams(window.location.search).get('new');

    data.forEach(function (item, index) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-id', item.id);

      tr.innerHTML =
        '<td style="color:var(--color-text-muted);font-weight:600;width:40px;">' + (index + 1) + '</td>' +
        '<td>' +
          '<div style="font-weight:600;color:var(--color-text);">' + escHtml(item.nama) + '</div>' +
          '<div style="font-size:0.78rem;color:var(--color-text-muted);margin-top:2px;">📞 ' + escHtml(item.telepon) + '</div>' +
        '</td>' +
        '<td>' +
          '<div style="font-weight:500;font-size:0.88rem;">' + escHtml(item.paketNama || item.paket) + '</div>' +
          '<div style="font-size:0.76rem;color:var(--color-text-muted);margin-top:2px;">👥 ' + item.jumlah + ' orang</div>' +
        '</td>' +
        '<td>' +
          '<div style="font-size:0.88rem;">' + formatDate(item.tglMulai) + '</div>' +
          '<div style="font-size:0.76rem;color:var(--color-text-muted);margin-top:2px;">s/d ' + formatDate(item.tglSelesai) + ' (' + item.durasi + ' hari)</div>' +
        '</td>' +
        '<td><span class="' + getStatusClass(item.status) + '">' + escHtml(item.status) + '</span></td>' +
        '<td style="font-weight:600;color:var(--color-primary);">' + formatRupiah(item.total) + '</td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            '<a href="sewa.html?edit=' + item.id + '" class="btn btn-sm btn-ghost btn-edit" title="Edit" style="font-size:0.78rem;padding:6px 10px;text-decoration:none;">✏️</a>' +
            '<button class="btn btn-sm btn-ghost btn-status" data-id="' + item.id + '" title="Ubah status" style="font-size:0.78rem;padding:6px 10px;">🔄</button>' +
            '<button class="btn btn-sm btn-danger btn-delete" data-id="' + item.id + '" title="Hapus" style="font-size:0.78rem;padding:6px 10px;">🗑️</button>' +
          '</div>' +
        '</td>';

      // Highlight newly added row
      if (highlightId && String(item.id) === String(highlightId)) {
        tr.style.backgroundColor = 'rgba(46,94,78,0.07)';
        setTimeout(function () {
          tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }

      tableBody.appendChild(tr);
    });

    /* Delete buttons */
    var deleteButtons = tableBody.querySelectorAll('.btn-delete');
    deleteButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'));
        if (!confirm('Hapus data penyewaan ini?')) return;
        allData = allData.filter(function (d) { return d.id !== id; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        updateStats();
        renderTable(getFiltered());
        showToast('Data berhasil dihapus.', 'success');
      });
    });

    /* Status buttons */
    var statusCycle = ['Menunggu', 'Aktif', 'Selesai', 'Dibatalkan'];
    var statusButtons = tableBody.querySelectorAll('.btn-status');
    statusButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'));
        var item = null;
        allData.forEach(function (d) { if (d.id === id) item = d; });
        if (!item) return;

        var currentIdx = statusCycle.indexOf(item.status);
        item.status = statusCycle[(currentIdx + 1) % statusCycle.length];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        updateStats();
        renderTable(getFiltered());
        showToast('Status diubah: ' + item.status, 'success');
      });
    });
  }

  /* ── Search / Filter ── */
  function getFiltered() {
    var q = searchInput ? searchInput.value.toLowerCase() : '';
    if (!q) return allData;
    return allData.filter(function (d) {
      return (
        d.nama.toLowerCase().indexOf(q) > -1 ||
        d.telepon.indexOf(q) > -1 ||
        (d.paketNama || d.paket).toLowerCase().indexOf(q) > -1 ||
        d.status.toLowerCase().indexOf(q) > -1
      );
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderTable(getFiltered());
    });
  }

  /* ── Clear All ── */
  var btnClearAll = document.getElementById('btn-clear-all');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', function () {
      if (allData.length === 0) { showToast('Tidak ada data untuk dihapus.', 'error'); return; }
      if (!confirm('Hapus SEMUA data penyewaan? Tindakan ini tidak dapat dibatalkan.')) return;
      localStorage.removeItem(STORAGE_KEY);
      allData = [];
      updateStats();
      renderTable([]);
      showToast('Semua data telah dihapus.', 'success');
    });
  }

  /* ── Export CSV ── */
  var btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', function () {
      if (allData.length === 0) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }

      var headers = ['No', 'Nama', 'Telepon', 'Paket', 'Jumlah Orang', 'Tgl Mulai', 'Tgl Selesai', 'Durasi (hari)', 'Total Harga', 'Status', 'Dibuat'];
      var rows = allData.map(function (d, i) {
        return [
          i + 1,
          d.nama,
          d.telepon,
          d.paketNama || d.paket,
          d.jumlah,
          d.tglMulai,
          d.tglSelesai,
          d.durasi,
          d.total > 0 ? d.total : '',
          d.status,
          new Date(d.dibuat).toLocaleString('id-ID')
        ];
      });

      var csvContent = [headers].concat(rows)
        .map(function (row) {
          return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
        })
        .join('\n');

      var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href = url;
      a.download = 'camprent_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data berhasil diekspor!', 'success');
    });
  }

  /* ── Toast ── */
  function showToast(message, type) {
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.textContent = (type === 'error' ? '❌ ' : '✅ ') + message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  /* ── Init ── */
  loadData();

});
