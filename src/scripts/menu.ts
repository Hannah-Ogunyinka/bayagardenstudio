/**
 * Full-screen menu: slide down on open, rise up on close.
 * Handles focus management, focus trapping and Escape for keyboard users.
 */
const ANIMATION_MS = 400;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function initMenu(): void {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const shim = document.querySelector<HTMLElement>('[data-menu-shim]');
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closeButton = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!menu || !shim || !openButton || !closeButton) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageRegions = document.querySelectorAll<HTMLElement>('[data-inert-when-menu-open]');

  const focusables = (): HTMLElement[] => Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE));

  function open(): void {
    menu!.hidden = false;
    shim!.hidden = false;
    // Force a frame so the CSS animation starts from the hidden position.
    requestAnimationFrame(() => {
      menu!.dataset['state'] = 'open';
      shim!.dataset['state'] = 'open';
    });
    openButton!.setAttribute('aria-expanded', 'true');
    pageRegions.forEach((region) => (region.inert = true));
    document.documentElement.style.overflow = 'hidden';
    closeButton!.focus();
  }

  function close(): void {
    menu!.dataset['state'] = 'closing';
    delete shim!.dataset['state'];
    openButton!.setAttribute('aria-expanded', 'false');
    pageRegions.forEach((region) => (region.inert = false));
    document.documentElement.style.overflow = '';

    window.setTimeout(
      () => {
        menu!.hidden = true;
        shim!.hidden = true;
        delete menu!.dataset['state'];
        openButton!.focus();
      },
      reducedMotion.matches ? 0 : ANIMATION_MS,
    );
  }

  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  shim.addEventListener('click', close);

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
