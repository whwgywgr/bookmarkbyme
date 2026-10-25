# BookmarkByME

Pengurus link peribadi — simpan semua link anda di satu tempat, tersusun ikut kategori.

**Cuba sekarang:** https://whwgywgr.github.io/bookmarkbyme/

Dibina dengan **Next.js + shadcn/ui** (Tailwind CSS v4, tema preset shadcn).

## Ciri-ciri

- Simpan link dengan kategori — taip nama kategori terus dalam borang
- Sidebar kategori (boleh dilipat, drawer pada mobile) dengan kiraan
- Kad ringkas: favicon auto + nama penuh (URL dalam tooltip hover)
- Klik link buka tab baharu; halaman BookmarkByME kekal terbuka
- Carian masa nyata (nama / URL / kategori)
- Edit & buang link (Dialog + AlertDialog shadcn)
- **Backup JSON** — simpan/pulih semua data
- **Export/Import bookmarks HTML** — serasi dengan Chrome, Edge & Firefox (kategori = folder browser)
- Tema gelap/terang mengikut sistem

## Teknologi

- Next.js 16 (App Router, static export untuk GitHub Pages)
- shadcn/ui v4 (Base UI) — sidebar, dialog, dropdown, alert, sonner
- Tailwind CSS v4
- Data: `localStorage` (kunci `bookmarkbyme_v1`, auto-migrate dari `linkhub_v1`)

## Develop

```bash
cd bookmarkbyme
npm install
npm run dev
```

Build statik (output ke `bookmarkbyme/out/`):

```bash
npm run build
```

Deploy: automatik melalui GitHub Actions (`.github/workflows/deploy.yml`) setiap push ke `main`.

## Buka link di tab belakang

Browser menghalang laman web daripada memaksa tab terbuka di belakang (anti pop-under). Ada 3 cara:

1. **Extension (Chrome/Edge)** — folder `extension/` dalam repo ini:
   - Muat turun repo, buka `chrome://extensions` (atau `edge://extensions`)
   - Aktifkan *Developer mode* → *Load unpacked* → pilih folder `extension/`
   - Selepas itu, klik biasa pada mana-mana link membuka tab **di belakang** — anda kekal di BookmarkByME
2. **Ctrl+klik / klik-tengah** — tanpa apa-apa pemasangan, terus berfungsi di semua browser
3. **Firefox** — `about:config` → `browser.tabs.loadDivertedInBackground` = `true`

## Versi lama (satu fail)

Versi satu fail HTML yang asal disimpan dalam sejarah git (commit sebelum `db2fa4b`) — masih berfungsi secara berdikari jika diperlukan.
