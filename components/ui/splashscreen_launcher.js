/**
 * Stupid Suite — Animated Video Splash Launcher
 * Ultra-compressed lightweight asset loader & app boot gate.
 */
export function mountSplashLauncher(options = {}) {
  const {
    mp4Src = '/assets/media/splashscreen/splash_launcher.mp4',
    webmSrc = '/assets/media/splashscreen/splash_launcher.webm',
    posterSrc = '/assets/media/splashscreen/splash_poster.jpg',
    maxDurationMs = 4500,
    onReady = () => {},
  } = options;

  if (sessionStorage.getItem('stupid_suite_splash_shown') === '1') {
    onReady();
    return;
  }

  const container = document.createElement('div');
  container.id = 'stupid-suite-splash';
  container.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999999;
    background: #000000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), visibility 400ms ease;
    cursor: pointer;
  `;

  container.innerHTML = `
    <div style="width: min(880px, 92vw); aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;">
      <video
        autoplay
        muted
        playsinline
        preload="auto"
        poster="${posterSrc}"
        style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;"
      >
        <source src="${mp4Src}" type="video/mp4" />
        <source src="${webmSrc}" type="video/webm" />
      </video>
    </div>
    <div style="position: absolute; bottom: 20px; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); text-transform: uppercase;">
      Press ESC or Click to Skip
    </div>
  `;

  document.body.appendChild(container);

  const video = container.querySelector('video');

  const closeSplash = () => {
    if (container.dataset.closed) return;
    container.dataset.closed = 'true';
    sessionStorage.setItem('stupid_suite_splash_shown', '1');
    container.style.opacity = '0';
    container.style.visibility = 'hidden';
    try { video.pause(); } catch (_) {}
    setTimeout(() => {
      container.remove();
      onReady();
    }, 450);
  };

  video.addEventListener('ended', closeSplash);
  container.addEventListener('click', closeSplash);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') closeSplash();
  }, { once: true });

  setTimeout(closeSplash, maxDurationMs);
}
