/**
 * SEO helpers: page titles and the JSON-LD graph.
 * Reproduces what Rank Math outputs today (Organization, WebSite, WebPage,
 * and Article on posts and projects) so search results don't change.
 */
import { SITE } from '@config/site';

export interface SeoInput {
  /** Page title without the site name, e.g. "Contact". Omit on the homepage. */
  title?: string | undefined;
  /** Exact <title> override, used where the live site differs from the pattern. */
  fullTitle?: string | undefined;
  description?: string | undefined;
  /** Absolute or root-relative image for social cards. */
  image?: string | undefined;
  noindex?: boolean | undefined;
  article?:
    | {
        type?: 'Article' | 'BlogPosting' | undefined;
        published: Date;
        modified?: Date | undefined;
        section?: string | undefined;
      }
    | undefined;
}

export function buildTitle({ title, fullTitle }: Pick<SeoInput, 'title' | 'fullTitle'>): string {
  if (fullTitle) return fullTitle;
  if (!title) return `${SITE.name} ${SITE.titleSeparator} ${SITE.tagline}`;
  return `${title} ${SITE.titleSeparator} ${SITE.name}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function buildJsonLd(input: SeoInput & { url: string; pageTitle: string }): Record<string, unknown> {
  const pageUrl = absoluteUrl(input.url);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      sameAs: [SITE.linkedIn],
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/brand/logo.svg'),
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SITE.openingHours.days,
        opens: SITE.openingHours.opens,
        closes: SITE.openingHours.closes,
      },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE.url,
      name: SITE.name,
      publisher: { '@id': ORG_ID },
      inLanguage: SITE.lang,
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: input.pageTitle,
      ...(input.description && { description: input.description }),
      isPartOf: { '@id': WEBSITE_ID },
      inLanguage: SITE.lang,
    },
  ];

  if (input.article) {
    graph.push({
      '@type': input.article.type ?? 'Article',
      headline: input.title,
      ...(input.description && { description: input.description }),
      datePublished: input.article.published.toISOString(),
      dateModified: (input.article.modified ?? input.article.published).toISOString(),
      ...(input.article.section && { articleSection: input.article.section }),
      ...(input.image && { image: absoluteUrl(input.image) }),
      author:
        input.article.type === 'BlogPosting'
          ? { '@type': 'Person', name: 'Hannah Ogunyinka', url: absoluteUrl('/about/') }
          : { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      inLanguage: SITE.lang,
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
