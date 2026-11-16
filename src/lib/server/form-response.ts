/**
 * Shared replies for the form endpoints.
 * - The page script sends `Accept: application/json` and shows the message in place.
 * - A plain HTML post (no JavaScript) goes to the thank-you page on success,
 *   or gets a short page that explains the problem and links back.
 */
export interface FormResult {
  ok: boolean;
  message: string;
  /** Field names that need fixing, so the script can mark them aria-invalid. */
  fields?: string[];
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function formResponse(request: Request, result: FormResult, status = result.ok ? 200 : 400): Response {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  if (wantsJson) return Response.json(result, { status, headers: { 'cache-control': 'no-store' } });

  if (result.ok) return new Response(null, { status: 303, headers: { location: '/thank-you/' } });

  const back = new URL(request.headers.get('referer') ?? '/', request.url);
  const backPath = back.origin === new URL(request.url).origin ? back.pathname : '/';
  const html = `<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Form not sent | Baya Garden Studio</title><main style="font-family:system-ui,sans-serif;max-width:40em;margin:4em auto;padding:0 1em;line-height:1.5"><h1>Your form was not sent</h1><p>${escapeHtml(result.message)}</p><p><a href="${escapeHtml(backPath)}">Go back and try again</a></p></main></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export const clientIp = (request: Request) => request.headers.get('cf-connecting-ip');
