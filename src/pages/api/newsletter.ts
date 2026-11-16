/**
 * Newsletter sign-up endpoint (on demand): validates, checks Turnstile and adds
 * the contact to Brevo. If Brevo refuses, the site owner gets an email alert.
 */
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { env } from '@lib/server/env';
import { sendEmail } from '@lib/server/ses';
import { subscribe } from '@lib/server/brevo';
import { verifyTurnstile } from '@lib/server/turnstile';
import { clientIp, formResponse } from '@lib/server/form-response';

export const prerender = false;

const Signup = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(254),
});

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const parsed = Signup.safeParse({
    firstName: form.get('firstName') ?? undefined,
    lastName: form.get('lastName') ?? undefined,
    email: form.get('email'),
  });
  if (!parsed.success) {
    return formResponse(request, { ok: false, message: 'Please enter a valid email address.', fields: ['email'] });
  }

  if (!(await verifyTurnstile(form.get('cf-turnstile-response') as string | null, clientIp(request)))) {
    return formResponse(request, { ok: false, message: 'We could not confirm you are not a robot. Please try again.' });
  }

  try {
    await subscribe(parsed.data);
  } catch (error) {
    console.error('Newsletter: sign-up failed', error);
    // Tell Hannah, so an expired Brevo key (keys lapse after 90 days unused) never goes unnoticed.
    if (env.CONTACT_TO && env.CONTACT_FROM) {
      await sendEmail({
        from: env.CONTACT_FROM,
        to: env.CONTACT_TO,
        subject: 'Website: a newsletter sign-up failed',
        text: [
          `${parsed.data.email} tried to join the newsletter, but Brevo refused it:`,
          '',
          String(error),
          '',
          'If this says 401 or "key not found", the Brevo API key has expired. Create a new one',
          '(Contacts: All) and replace the BREVO_API_KEY secret in Cloudflare. Then add this person by hand.',
        ].join('\n'),
      }).catch((alertError) => console.error('Newsletter: alert email failed', alertError));
    }
    return formResponse(request, { ok: false, message: 'Sorry, something went wrong. Please try again later.' }, 502);
  }

  const message = env.BREVO_DOI_TEMPLATE_ID
    ? 'Almost done! Please check your inbox and confirm your email.'
    : "You're signed up. Thank you!";
  return formResponse(request, { ok: true, message });
};
