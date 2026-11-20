/**
 * Brings the contact page tree to life (src/components/contact/ContactTree.astro).
 *
 * Each behaviour adds a class to a bird, and the class comes off when that
 * behaviour's own animation ends. Nothing runs for visitors who prefer
 * reduced motion.
 */
const IDLE_FOR_MS = 30_000;
const IDLE_MIN_MS = 3_000;
const IDLE_SPREAD_MS = 3_000;

type Move = 'flutter' | 'flick' | 'peek';

const MOVE_CLASS: Record<Move, string> = {
  flutter: 'is-flying',
  flick: 'is-flicking',
  peek: 'is-peeking',
};

/** The animation that ends each move (the longest part of it). */
const END_OF: Record<string, string> = {
  'tree-bird-flap': 'is-flying',
  'tree-bird-flick': 'is-flicking',
  'tree-bird-peek': 'is-peeking',
};

export function initContactTree(): void {
  const tree = document.querySelector<SVGSVGElement>('[data-contact-tree]');
  if (!tree) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const birds = [...tree.querySelectorAll<SVGGElement>('.tree-bird')];
  const nestBird = tree.querySelector<SVGGElement>('.tree-bird--nest');
  const perched = birds.filter((bird) => bird !== nestBird);

  const isBusy = (bird: SVGGElement) => Object.values(MOVE_CLASS).some((name) => bird.classList.contains(name));

  for (const bird of birds) {
    bird.addEventListener('animationend', (event) => {
      const name = END_OF[event.animationName];
      if (name) bird.classList.remove(name);
    });
  }
  tree.addEventListener('animationend', (event) => {
    if (event.animationName === 'tree-branch-dip') tree.classList.remove('dip-b0', 'dip-b1');
  });

  const act = (bird: SVGGElement, move: Move): void => {
    if (isBusy(bird)) return;
    // The nest bird's wings would be hidden by the doorway, so it peeks instead.
    const chosen: Move = bird === nestBird ? 'peek' : move;
    bird.classList.add(MOVE_CLASS[chosen]);
    // The branch gives a little as the bird lifts off.
    if (chosen === 'flutter') tree.classList.add(`dip-b${bird.dataset.bird}`);
  };
  const greet = (bird: SVGGElement) => act(bird, 'flutter');

  // Idle moves: varied, never the same bird twice running, for a short while only.
  let idleUntil = 0;
  let idleTimer: number | undefined;
  let lastBird: SVGGElement | undefined;

  // Roughly half the moves are a full flutter, the rest a tail flick on its own.
  const randomMove = (): Move => (Math.random() < 0.5 ? 'flutter' : 'flick');

  const scheduleIdle = (): void => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(
      () => {
        if (Date.now() > idleUntil) return;
        if (!document.hidden) {
          const choices = birds.filter((bird) => bird !== lastBird && !isBusy(bird));
          const bird = choices[Math.floor(Math.random() * choices.length)];
          if (bird) {
            act(bird, randomMove());
            lastBird = bird;
          }
        }
        scheduleIdle();
      },
      IDLE_MIN_MS + Math.random() * IDLE_SPREAD_MS,
    );
  };

  const stopIdle = (): void => {
    idleUntil = 0;
    window.clearTimeout(idleTimer);
  };

  // Moving pictures beside a form compete with typing, so they stop once someone starts.
  const form = document.querySelector<HTMLFormElement>('.contact-form');
  form?.addEventListener('focusin', stopIdle);

  // The welcome plays once the tree is properly in view, which on laptops is after a scroll.
  const welcome = (): void => {
    [nestBird, ...perched].forEach((bird, index) => {
      if (bird) window.setTimeout(() => greet(bird), 200 + index * 500);
    });
    if (!form?.contains(document.activeElement)) {
      idleUntil = Date.now() + IDLE_FOR_MS;
      scheduleIdle();
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          welcome();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(tree);
  } else {
    welcome();
  }

  // Touch screens fire a fake hover on tap, so hover only applies with a real pointer.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    for (const bird of birds) bird.addEventListener('mouseenter', () => greet(bird));
  }

  // When an enquiry is sent (src/scripts/forms.ts), all three birds celebrate.
  document.addEventListener('bgs:form-sent', (event) => {
    if (form && event.target !== form) return;
    birds.forEach((bird, index) => window.setTimeout(() => greet(bird), index * 120));
  });
}
