/**
 * Animated header logo: flies once on the first page of a visit, and again
 * when the logo link is hovered or focused. CSS turns all of it off for
 * visitors who prefer reduced motion.
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

  let flown = false;
  try {
    flown = sessionStorage.getItem(FLOWN_KEY) === '1';
    sessionStorage.setItem(FLOWN_KEY, '1');
  } catch {
    // Storage can be blocked; then the bird simply flies on each page load.
  }
  if (!flown) fly();

  link?.addEventListener('mouseenter', fly);
  link?.addEventListener('focus', fly);
}
