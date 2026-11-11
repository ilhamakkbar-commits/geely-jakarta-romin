'use strict';

/* =========================================================
   1. MENU GARIS TIGA + LOGO CADANGAN
   ========================================================= */
(function () {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const subToggle = document.getElementById('produk-toggle');
  const subMenu = document.getElementById('produk-sub');

  if (toggle && menu) {
    // Buka / tutup menu utama (garis tiga)
    const setMenu = function (open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      if (!open && subToggle && subMenu) setSub(false);
    };

    // Buka / tutup isi Produk di dalam menu
    const setSub = function (open) {
      subMenu.classList.toggle('is-open', open);
      subToggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    if (subToggle && subMenu) {
      subToggle.addEventListener('click', function () {
        setSub(subToggle.getAttribute('aria-expanded') !== 'true');
      });
    }

    // Tutup saat klik di luar menu
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });

    // Tutup dengan tombol Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); }
    });
  }

  // Jika file logo belum ada, sembunyikan ikon gambar rusak
  const img = document.getElementById('logo-img');
  if (img) {
    const sembunyikanLogo = function () { img.hidden = true; };
    img.addEventListener('error', sembunyikanLogo);
    if (img.complete && img.naturalWidth === 0) sembunyikanLogo();
  }
})();

/* =========================================================
   2. SIMULASI CICILAN -> KIRIM KE WHATSAPP ROMIN
   ========================================================= */
(function () {
  const form = document.getElementById('form-cicilan');
  if (!form) return;

  const NOMOR = '6281387179069';
  const error = document.getElementById('cicilan-error');
  const model = document.getElementById('cicilan-model');
  const dp = document.getElementById('cicilan-dp');
  const tenor = document.getElementById('cicilan-tenor');
  const nama = document.getElementById('cicilan-nama');

  // Hanya nilai yang ada di daftar pilihan yang diterima
  function nilaiValid(select) {
    return Array.prototype.some.call(select.options, function (o) {
      return o.value !== '' && o.value === select.value;
    });
  }

  // Nama: hanya huruf, spasi, titik, apostrof, dan tanda hubung
  function bersihkanNama(teks) {
    return teks.replace(/[^\p{L}\p{M}\s.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const namaBersih = bersihkanNama(nama.value);
    const kolom = [
      [model, nilaiValid(model)],
      [dp, nilaiValid(dp)],
      [tenor, nilaiValid(tenor)],
      [nama, namaBersih.length >= 2]
    ];

    let pertama = null;
    kolom.forEach(function (k) {
      k[0].setAttribute('aria-invalid', String(!k[1]));
      if (!k[1] && !pertama) pertama = k[0];
    });

    if (pertama) {
      error.textContent = 'Mohon lengkapi semua kolom dengan benar.';
      pertama.focus();
      return;
    }
    error.textContent = '';

    const pesan =
      'Halo Romin, saya ingin simulasi cicilan ' + model.value + '.\n\n' +
      'Nama: ' + namaBersih + '\n' +
      'Model: ' + model.value + '\n' +
      'DP: ' + dp.value + '\n' +
      'Tenor: ' + tenor.value + '\n\n' +
      'Mohon dibantu hitungkan estimasi angsurannya. Terima kasih.';

    window.open('https://wa.me/' + NOMOR + '?text=' + encodeURIComponent(pesan), '_blank', 'noopener,noreferrer');
  });
})();

/* =========================================================
   3. TEST DRIVE -> KIRIM KE WHATSAPP ROMIN
   ========================================================= */
(function () {
  const form = document.getElementById('form-testdrive');
  if (!form) return;

  const NOMOR = '6281387179069';
  const HARI_MAKS = 90; // tanggal paling jauh yang bisa dipilih
  const error = document.getElementById('td-error');
  const nama = document.getElementById('td-nama');
  const model = document.getElementById('td-model');
  const tanggal = document.getElementById('td-tanggal');
  const jam = document.getElementById('td-jam');

  function dua(n) { return String(n).padStart(2, '0'); }
  function teksTanggal(d) {
    return d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate());
  }

  // Batas tanggal: mulai hari ini sampai 90 hari ke depan
  const awal = new Date();
  const akhir = new Date();
  akhir.setDate(akhir.getDate() + HARI_MAKS);
  tanggal.min = teksTanggal(awal);
  tanggal.max = teksTanggal(akhir);

  // Hanya nilai yang ada di daftar pilihan yang diterima
  function nilaiValid(select) {
    return Array.prototype.some.call(select.options, function (o) {
      return o.value !== '' && o.value === select.value;
    });
  }

  // Nama: hanya huruf, spasi, titik, apostrof, dan tanda hubung
  function bersihkanNama(teks) {
    return teks.replace(/[^\p{L}\p{M}\s.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  }

  // Tanggal harus format yyyy-mm-dd, benar-benar ada, dan dalam rentang
  function tanggalValid(nilai, hariIni, batas) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nilai)) return false;
    const p = nilai.split('-').map(Number);
    const d = new Date(p[0], p[1] - 1, p[2]);
    if (d.getFullYear() !== p[0] || d.getMonth() !== p[1] - 1 || d.getDate() !== p[2]) return false;
    return nilai >= hariIni && nilai <= batas;
  }

  // Jam harus format HH:MM, dan kalau hari ini tidak boleh sudah lewat
  function jamValid(nilai, tanggalDipilih, hariIni, kini) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(nilai)) return false;
    if (tanggalDipilih === hariIni) {
      return nilai > dua(kini.getHours()) + ':' + dua(kini.getMinutes());
    }
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const kini = new Date();
    const hariIni = teksTanggal(kini);
    const batasAkhir = new Date();
    batasAkhir.setDate(batasAkhir.getDate() + HARI_MAKS);
    const batas = teksTanggal(batasAkhir);

    const namaBersih = bersihkanNama(nama.value);
    const kolom = [
      [nama, namaBersih.length >= 2],
      [model, nilaiValid(model)],
      [tanggal, tanggalValid(tanggal.value, hariIni, batas)],
      [jam, jamValid(jam.value, tanggal.value, hariIni, kini)]
    ];

    let pertama = null;
    kolom.forEach(function (k) {
      k[0].setAttribute('aria-invalid', String(!k[1]));
      if (!k[1] && !pertama) pertama = k[0];
    });

    if (pertama) {
      error.textContent = (pertama === jam && tanggal.value === hariIni)
        ? 'Pilih jam yang belum lewat.'
        : 'Mohon lengkapi semua kolom dengan benar.';
      pertama.focus();
      return;
    }
    error.textContent = '';

    // Ubah 2026-11-13 menjadi "Jumat, 13 November 2026"
    const p = tanggal.value.split('-').map(Number);
    const tampilTanggal = new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    });

    const pesan =
      'Halo Romin, saya ingin menjadwalkan test drive ' + model.value + '.\n\n' +
      'Nama: ' + namaBersih + '\n' +
      'Model: ' + model.value + '\n' +
      'Tanggal: ' + tampilTanggal + '\n' +
      'Jam: ' + jam.value + '\n\n' +
      'Mohon dikonfirmasi jadwalnya. Terima kasih.';

    window.open('https://wa.me/' + NOMOR + '?text=' + encodeURIComponent(pesan), '_blank', 'noopener,noreferrer');
  });
})();