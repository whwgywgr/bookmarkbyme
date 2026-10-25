// Buka link dalam tab baharu yang TIDAK aktif (belakang)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'openBackground' && msg.url) {
    chrome.tabs.create({ url: msg.url, active: false });
    sendResponse({ ok: true });
  }
});
