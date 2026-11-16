/**
 * Floating bottom navigation: shown on wide screens once the visitor has
 * scrolled past the top, hidden again as the footer approaches.
 * Matches the thresholds used by the WordPress theme.
 */
const MIN_WIDTH = 960;
const TOP_THRESHOLD = 50;
const BOTTOM_THRESHOLD = 1200;

export function initFloatingNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-floating-nav]');
  if (!nav) return;

  let ticking = false;

  const update = (): void => {
    ticking = false;
    const scrolled = window.scrollY;
    const distanceToBottom = document.documentElement.scrollHeight - (scrolled + window.innerHeight);
    const visible = window.innerWidth >= MIN_WIDTH && scrolled >= TOP_THRESHOLD && distanceToBottom > BOTTOM_THRESHOLD;

    nav.dataset['visible'] = String(visible);
    // Keep hidden links out of the tab order and the accessibility tree.
    nav.inert = !visible;
  };

  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
