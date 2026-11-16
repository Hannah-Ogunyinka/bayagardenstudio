/**
 * Brand Photography gallery: category filter buttons and a <dialog> lightbox.
 * The markup works without this script; it only enhances it.
 */
export function initGallery(root: HTMLElement): void {
  const filters = root.querySelector<HTMLElement>('[data-filters]');
  const status = root.querySelector<HTMLElement>('[data-gallery-status]');
  const items = Array.from(root.querySelectorAll<HTMLLIElement>('li[data-category]'));
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  const dialogImage = root.querySelector<HTMLImageElement>('[data-lightbox-image]');
  if (!filters || !dialog || !dialogImage) return;

  let current = 0;
  let opener: HTMLElement | null = null;

  const grid = root.querySelector<HTMLUListElement>('ul');

  // Row-by-row masonry: each tile spans as many 1px rows as its height plus the gutter.
  function layout(): void {
    if (!grid) return;
    const gutter = parseFloat(getComputedStyle(grid).columnGap) || 0;
    for (const item of items) {
      if (item.hidden) continue;
      const img = item.querySelector('img');
      const ratio = img ? Number(img.getAttribute('height')) / Number(img.getAttribute('width')) : 1;
      item.style.gridRowEnd = `span ${Math.round(item.clientWidth * ratio + gutter)}`;
    }
  }

  const visibleLinks = (): HTMLAnchorElement[] =>
    items.filter((item) => !item.hidden).map((item) => item.querySelector('a') as HTMLAnchorElement);

  function applyFilter(category: string): void {
    for (const button of filters!.querySelectorAll<HTMLButtonElement>('button')) {
      button.setAttribute('aria-pressed', String(button.dataset['filter'] === category));
    }
    for (const item of items) item.hidden = item.dataset['category'] !== category;
    layout();
    if (status) status.textContent = `Showing ${visibleLinks().length} ${category} photos`;
  }

  function show(index: number): void {
    const links = visibleLinks();
    current = (index + links.length) % links.length;
    const link = links[current]!;
    dialogImage!.src = link.href;
    dialogImage!.alt = link.querySelector('img')?.alt ?? '';
  }

  filters.hidden = false;
  grid?.classList.add('is-masonry');
  if (grid) new ResizeObserver(layout).observe(grid);
  applyFilter(root.dataset['default'] ?? '');
  if (status) status.textContent = '';

  filters.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-filter]');
    if (button) applyFilter(button.dataset['filter']!);
  });

  root.querySelector('ul')?.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-index]');
    if (!link) return;
    event.preventDefault();
    opener = link;
    show(visibleLinks().indexOf(link));
    dialog.showModal();
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const step = target.closest<HTMLElement>('[data-step]')?.dataset['step'];
    if (step) show(current + Number(step));
    else if (target.closest('[data-close]') || target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'ArrowLeft') show(current - 1);
  });

  // Return focus to the photo that opened the viewer.
  dialog.addEventListener('close', () => opener?.focus());
}
