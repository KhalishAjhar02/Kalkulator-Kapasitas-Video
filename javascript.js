// Bitrate rata-rata per kualitas (dipakai secara internal, tidak ditampilkan).
const PRESETS = [
  { label: "360p",          bitrate: 0.7,  color: "#94a3b8" },
  { label: "480p",          bitrate: 1.2,  color: "#38bdf8" },
  { label: "720p HD",       bitrate: 2.5,  color: "#19c3a6" },
  { label: "1080p Full HD", bitrate: 5,    color: "#6d5efc" },
  { label: "1440p 2K",      bitrate: 9,    color: "#f59e0b" },
  { label: "2160p 4K",      bitrate: 16,   color: "#ff5d8f" }
];

let selected = 3; // default 1080p
const $ = id => document.getElementById(id);

function seconds() {
  const v = id => {
    const n = parseFloat($(id).value);
    return isFinite(n) && n > 0 ? n : 0;
  };
  return v("durJam") * 3600 + v("durMenit") * 60 + v("durDetik");
}
function fmtAngka(n, d = 2) {
  return n.toLocaleString("id-ID", { maximumFractionDigits: d });
}
// 1 GB = 1000 MB
function fmtUkuran(mb) {
  return mb >= 1000 ? fmtAngka(mb / 1000) + " GB" : fmtAngka(mb, 1) + " MB";
}
function fmtDurasi(sec) {
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [];
  if (h) parts.push(h + " jam");
  if (m) parts.push(m + " menit");
  if (s || !parts.length) parts.push(s + " detik");
  return parts.join(" ");
}
function mbOf(p, sec) {
  return p.bitrate * sec / 8;
}

function buildChips() {
  $("chips").innerHTML = PRESETS.map((p, i) =>
    `<button class="chip" type="button" data-i="${i}" style="--c:${p.color}" aria-pressed="false">` +
    `<span class="dot"></span>${p.label}</button>`
  ).join("");
  $("chips").addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    selected = parseInt(btn.dataset.i, 10);
    render();
  });
}

function render() {
  const sec = seconds();
  const p = PRESETS[selected];

  document.querySelectorAll(".chip").forEach((btn, i) => {
    btn.setAttribute("aria-pressed", String(i === selected));
  });

  const hasil = $("hasil");
  if (!sec) {
    hasil.innerHTML = '<p class="meta">Masukkan durasi video untuk melihat perkiraan.</p>';
  } else {
    const mb = mbOf(p, sec);
    const maxMb = mbOf(PRESETS[PRESETS.length - 1], sec);
    const pct = Math.max(4, Math.round(mb / maxMb * 100));
    hasil.innerHTML =
      `<div class="big">${fmtUkuran(mb)}</div>` +
      `<div class="meta">${p.label} · durasi ${fmtDurasi(sec)}</div>` +
      `<div class="bar"><span style="width:${pct}%"></span></div>` +
      `<div class="meta" style="font-size:12px;margin-top:6px">Bar dibandingkan dengan 4K untuk durasi yang sama</div>`;
  }

  $("tabel").innerHTML = PRESETS.map((q, i) => {
    const mb = mbOf(q, sec);
    const perMenit = fmtUkuran(q.bitrate * 60 / 8);
    return `<tr class="${i === selected ? "active" : ""}" style="--c:${q.color}">` +
      `<td><span class="dot"></span>${q.label}</td>` +
      `<td>${sec ? fmtUkuran(mb) : "—"}</td>` +
      `<td>${perMenit}</td></tr>`;
  }).join("");
}

buildChips();
document.querySelectorAll("input").forEach(el => {
  el.addEventListener("input", render);
});
render();