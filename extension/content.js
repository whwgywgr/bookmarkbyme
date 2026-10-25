// Intercept klik kiri pada link target="_blank" dalam BookmarkByME
// dan minta background script bukanya sebagai tab belakang.
// Ctrl+klik / klik-tengah dibiarkan pada kelakau browser asal.
document.addEventListener('click', (e) => {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[target="_blank"][href]');
  if (!a) return;
  e.preventDefault();
  e.stopPropagation();
  try {
    chrome.runtime.sendMessage({ type: 'openBackground', url: a.href }, () => {
      void chrome.runtime.lastError; // extension dimuat semula: biar senyap
    });
  } catch (_) {
    // Extension context hilang - fallback kepada kelakau asal
    window.open(a.href, '_blank', 'noopener');
  }
}, true);
