/**
 * Contact form endpoint (on demand). Validates the enquiry, drops bots
 * (honeypot + Turnstile) and emails it through Amazon SES with Reply-To set
 * to the sender, so a reply goes straight back to them.
 */
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { env, required } from '@lib/server/env';
import { sendEmail } from '@lib/server/ses';
import { verifyTurnstile } from '@lib/server/turnstile';
import { clientIp, formResponse } from '@lib/server/form-response';

export const prerender = false;

const Enquiry = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  services: z.array(z.string().trim().max(100)).min(1).max(10),
  message: z.string().trim().min(1).max(5000),
});

const FIELD_LABELS: Record<string, string> = {
  firstName: 'first name',
  lastName: 'last name',
  email: 'a valid email address',
  services: 'at least one service',
  message: 'a message',
};

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  // A filled honeypot means a bot: pretend it worked and send nothing.
  if (String(form.get('website') ?? '') !== '') return formResponse(request, { ok: true, message: 'Thank you.' });

  const parsed = Enquiry.safeParse({
    firstName: form.get('firstName'),
    lastName: form.get('lastName'),
    email: form.get('email'),
    services: form.getAll('services'),
    message: form.get('message'),
  });
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    const missing = fields.map((f) => FIELD_LABELS[f] ?? f).join(', ');
    return formResponse(request, { ok: false, message: `Please add ${missing}.`, fields });
  }

  if (!(await verifyTurnstile(form.get('cf-turnstile-response') as string | null, clientIp(request)))) {
    return formResponse(request, {
      ok: false,
      message: 'We could not confirm you are not a robot. Please try again, or email us directly.',
    });
  }

  const { firstName, lastName, email, services, message } = parsed.data;
  try {
    await sendEmail({
      from: required('CONTACT_FROM'),
      to: required('CONTACT_TO'),
      replyTo: email,
      subject: `New enquiry from ${firstName} ${lastName}`,
      text: [
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Help with: ${services.join(', ')}`,
        '',
        message,
        '',
        `Sent from the contact form on ${new URL(request.url).host}`,
      ].join('\n'),
    });
  } catch (error) {
    console.error(`Contact form: email not sent: ${error instanceof Error ? error.message : String(error)}`);
    return formResponse(
      request,
      { ok: false, message: `Sorry, something went wrong. Please email ${env.CONTACT_TO ?? 'us'} instead.` },
      502,
    );
  }

  return formResponse(request, { ok: true, message: "Thank you! Your message is on its way. We'll be in touch soon." });
};
