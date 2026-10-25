# BookmarkByME

Pengurus link peribadi (bookmark manager) dalam satu fail HTML — simpan semua link anda di satu tempat, tersusun ikut kategori.

**Cuba sekarang:** https://whwgywgr.github.io/bookmarkbyme/

## Ciri-ciri

- Simpan link dengan kategori — taip nama kategori terus dalam borang
- Kad ringkas: favicon auto + nama + link (tiada upload gambar)
- Klik link buka tab baharu; halaman BookmarkByME kekal terbuka
- Penapis kategori (chip dengan kiraan) + carian masa nyata
- Edit & buang link
- **Backup JSON** — simpan/pulih semua data
- **Export/Import bookmarks HTML** — serasi dengan Chrome, Edge & Firefox (kategori = folder browser)

## Cara guna

Semua data disimpan secara peribadi dalam `localStorage` pelayar anda — tiada server, tiada akaun. Guna butang eksport untuk backup atau pindah ke browser/peranti lain.

## Buka link di tab belakang

Browser menghalang laman web daripada memaksa tab terbuka di belakang (anti pop-under). Ada 3 cara:

1. **Extension (Chrome/Edge)** — folder `extension/` dalam repo ini:
   - Muat turun repo, buka `chrome://extensions` (atau `edge://extensions`)
   - Aktifkan *Developer mode* → *Load unpacked* → pilih folder `extension/`
   - Selepas itu, klik biasa pada mana-mana link membuka tab **di belakang** — anda kekal di BookmarkByME
2. **Ctrl+klik / klik-tengah** — tanpa apa-apa pemasangan, terus berfungsi di semua browser
3. **Firefox** — `about:config` → `browser.tabs.loadDivertedInBackground` = `true`

## Bina daripada fail ini

Hanya satu fail `index.html` — buka terus dalam pelayar, atau host di mana-mana static hosting (GitHub Pages, Netlify, dsb.).

Dibina dengan [Tailwind CSS](https://tailwindcss.com/) (CDN).
