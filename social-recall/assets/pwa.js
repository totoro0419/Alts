// Keep service worker registration strictly within the Social Recall path.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      if (navigator.onLine) registration.update().catch(() => {});
    } catch (error) {
      // Offline installation failure must not affect ordinary online learning.
      console.warn('Social Recall: offline support was not registered.', error);
    }
  }, { once: true });
}
