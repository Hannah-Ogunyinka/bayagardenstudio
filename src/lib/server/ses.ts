/**
 * Sends a plain-text email through the Amazon SES v2 API, signed with AWS
 * Signature V4 by aws4fetch (a few KB, built on Web Crypto, so no AWS SDK).
 */
import { AwsClient } from 'aws4fetch';
import { env, required } from './env';

interface Email {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export async function sendEmail(email: Email): Promise<void> {
  const region = env.AWS_SES_REGION || 'eu-west-2';
  const aws = new AwsClient({
    accessKeyId: required('AWS_ACCESS_KEY_ID'),
    secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
    service: 'ses',
    region,
  });

  const response = await aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      FromEmailAddress: email.from,
      Destination: { ToAddresses: [email.to] },
      ReplyToAddresses: email.replyTo ? [email.replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: email.subject, Charset: 'UTF-8' },
          Body: { Text: { Data: email.text, Charset: 'UTF-8' } },
        },
      },
    }),
  });

  if (!response.ok) throw new Error(`SES ${response.status}: ${await response.text()}`);
}
