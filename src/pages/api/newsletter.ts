/** Newsletter sign-up endpoint (on demand): validates, checks Turnstile and adds the contact to Brevo. */
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { env } from '@lib/server/env';
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
    return formResponse(request, { ok: false, message: 'Sorry, something went wrong. Please try again later.' }, 502);
  }

  const message = env.BREVO_DOI_TEMPLATE_ID
    ? 'Almost done! Please check your inbox and confirm your email.'
    : "You're signed up. Thank you!";
  return formResponse(request, { ok: true, message });
};
