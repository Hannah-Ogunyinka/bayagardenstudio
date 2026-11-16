/**
 * Site-wide settings. Single source of truth for names, URLs and navigation
 * so header, menu overlay, floating nav, footer and schema never drift apart.
 */
export const SITE = {
  name: 'Baya Garden Studio',
  url: 'https://bayagardenstudio.com',
  tagline: 'Focused Web Design and Tech Strategy for Creatives',
  locale: 'en_GB',
  lang: 'en-GB',
  email: 'contact@bayagardenstudio.com',
  linkedIn: 'https://www.linkedin.com/in/hannahogunyinka/',
  titleSeparator: '|',
  openingHours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
} as const;

export interface NavItem {
  label: string;
  href: string;
  children?: readonly NavItem[];
}

/** Full-screen menu (opened from the header "Menu" button). */
export const MAIN_MENU: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services/',
    children: [
      { label: 'Build', href: '/website-design-and-development/' },
      { label: 'Support', href: '/website-care-plan/' },
      { label: 'Grow', href: '/marketing-and-automation/' },
      { label: 'Brand Photography', href: '/brand-photography/' },
    ],
  },
  { label: 'Projects', href: '/projects/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

/** Floating pill navigation along the bottom of the screen (desktop only). */
export const FLOATING_NAV: readonly NavItem[] = [
  { label: 'Build', href: '/website-design-and-development/' },
  { label: 'Support', href: '/website-care-plan/' },
  { label: 'Grow', href: '/marketing-and-automation/' },
  { label: 'Photography', href: '/brand-photography/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Contact', href: '/contact/' },
];

export const FOOTER_LINKS = {
  quick: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Insights', href: '/insights/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ],
  connect: [
    { label: 'LinkedIn', href: SITE.linkedIn },
    { label: 'Mail', href: `mailto:${SITE.email}` },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Cookie Policy', href: '/cookie-policy/' },
  ],
} as const satisfies Record<string, readonly NavItem[]>;

/**
 * Cloudflare Turnstile site key (public). Set PUBLIC_TURNSTILE_SITE_KEY in the
 * build environment; without it the forms use Cloudflare's always-pass test key,
 * which only works with the matching test secret in local development.
 */
export const TURNSTILE_SITE_KEY: string = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
