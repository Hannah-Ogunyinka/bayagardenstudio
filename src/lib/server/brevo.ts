/** Adds or updates a newsletter contact in Brevo. */
import { env, required } from './env';
import { SITE } from '@config/site';

interface Subscriber {
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export async function subscribe({ email, firstName, lastName }: Subscriber): Promise<void> {
  const listId = Number(required('BREVO_LIST_ID'));
  const attributes = { FIRSTNAME: firstName ?? '', LASTNAME: lastName ?? '' };
  const doiTemplate = env.BREVO_DOI_TEMPLATE_ID;

  const [path, body] = doiTemplate
    ? [
        'contacts/doubleOptinConfirmation',
        {
          email,
          attributes,
          includeListIds: [listId],
          templateId: Number(doiTemplate),
          redirectionUrl: `${SITE.url}/thank-you/`,
        },
      ]
    : ['contacts', { email, attributes, listIds: [listId], updateEnabled: true }];

  const response = await fetch(`https://api.brevo.com/v3/${path}`, {
    method: 'POST',
    headers: {
      'api-key': required('BREVO_API_KEY'),
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  // 201 created, 204 updated. Brevo also answers 400 "duplicate_parameter" for an existing contact in DOI mode.
  if (response.ok) return;
  const detail = await response.text();
  if (response.status === 400 && detail.includes('duplicate_parameter')) return;
  throw new Error(`Brevo ${response.status}: ${detail}`);
}
