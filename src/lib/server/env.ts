/**
 * Typed access to the Worker's runtime bindings, secrets and variables.
 * Secrets are set with `npx wrangler secret put NAME` (or in the Cloudflare
 * dashboard), and locally in `.dev.vars`. See `.dev.vars.example`.
 */
import { env as workerEnv } from 'cloudflare:workers';

export interface ServerEnv {
  /** Turnstile secret key (pairs with PUBLIC_TURNSTILE_SITE_KEY). */
  TURNSTILE_SECRET_KEY?: string;

  /** Amazon SES: an IAM user allowed only `ses:SendEmail`. */
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  /** SES region, e.g. eu-west-2. */
  AWS_SES_REGION?: string;
  /** Verified SES sender, e.g. "Baya Garden Studio <contact@bayagardenstudio.com>". */
  CONTACT_FROM?: string;
  /** Where enquiries are delivered. */
  CONTACT_TO?: string;

  /** Brevo API key and the list new subscribers join. */
  BREVO_API_KEY?: string;
  BREVO_LIST_ID?: string;
  /** Optional: a Brevo double opt-in template id. When set, subscribers confirm by email first. */
  BREVO_DOI_TEMPLATE_ID?: string;

  /** JSON map of gallery slug → password hash, made by scripts/gallery-passwords.mjs. */
  GALLERY_PASSWORDS?: string;
  /** Long random string used to sign gallery access cookies. */
  GALLERY_COOKIE_SECRET?: string;
  /** R2 bucket holding the client gallery photos and zip downloads. */
  GALLERY_BUCKET?: R2Bucket;
}

export const env = workerEnv as unknown as ServerEnv;

/** Throws a clear error when a required setting is missing, so it shows in the Worker logs. */
export function required<K extends keyof ServerEnv>(key: K): NonNullable<ServerEnv[K]> {
  const value = env[key];
  if (value === undefined || value === '') throw new Error(`Missing Worker setting: ${key}`);
  return value as NonNullable<ServerEnv[K]>;
}
