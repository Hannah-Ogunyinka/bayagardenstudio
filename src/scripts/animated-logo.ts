/**
 * Animated header logo. It flies every time the home page loads (including a
 * refresh), and once per visit on the other pages. On devices with a mouse or
 * trackpad it flies again when the logo link is hovered; keyboard focus does
 * the same everywhere. CSS turns all of it off for visitors who prefer
 * reduced motion.
 */
const FLOWN_KEY = 'baya-logo-flown';

export function initAnimatedLogo(): void {
  const logo = document.querySelector<SVGSVGElement>('[data-baya-logo]');
  if (!logo) return;

  const link = logo.closest('a');

  const fly = (): void => {
    if (logo.classList.contains('is-flying')) return;
    logo.classList.add('is-flying');
  };

  // The front wing's flight is the longest part; when it ends, the bird is at rest.
  logo.addEventListener('animationend', (event) => {
    if (event.animationName === 'baya-logo-flap') logo.classList.remove('is-flying');
  });

  const isHome = window.location.pathname === '/';
  let flown = false;
  try {
    flown = sessionStorage.getItem(FLOWN_KEY) === '1';
    sessionStorage.setItem(FLOWN_KEY, '1');
  } catch {
    // Storage can be blocked; then the bird simply flies on each page load.
  }
  if (isHome || !flown) fly();

  // Touch screens fire a fake hover on tap, so hover only applies with a real pointer.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    link?.addEventListener('mouseenter', fly);
  }
  link?.addEventListener('focus', fly);
}
