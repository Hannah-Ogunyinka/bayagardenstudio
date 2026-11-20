/**
 * Progressive enhancement for the contact and newsletter forms.
 *
 * - Turnstile loads only when someone first focuses a form, so pages stay fast
 *   (the newsletter form is on every page). It runs in "interaction-only" mode:
 *   most people never see a challenge.
 * - The form submits in place with fetch and the result is announced through
 *   the form's live status region. Fields the server rejects get aria-invalid.
 */
declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, options: Record<string, unknown>): string;
      reset(id: string): void;
    };
    onBgsTurnstileLoad?: () => void;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onBgsTurnstileLoad';
const TOKEN_TIMEOUT_MS = 20_000;
let apiLoading: Promise<NonNullable<Window['turnstile']>> | undefined;

function loadTurnstile() {
  apiLoading ??= new Promise((resolve, reject) => {
    window.onBgsTurnstileLoad = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile')));
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onerror = () => {
      apiLoading = undefined;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.append(script);
  });
  return apiLoading;
}

interface FormState {
  widgetId?: string;
  token: Promise<string>;
  resolveToken: (token: string) => void;
}

function freshToken(state: Partial<FormState>): void {
  state.token = new Promise((resolve) => (state.resolveToken = resolve));
}

function enhance(form: HTMLFormElement): void {
  if (form.dataset.enhanced) return;
  form.dataset.enhanced = 'true';
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const container = form.querySelector<HTMLElement>('[data-turnstile]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const siteKey = form.dataset.sitekey;
  if (!status || !container || !siteKey) return;

  const state: Partial<FormState> = {};
  freshToken(state);

  const prepare = async () => {
    if (state.widgetId !== undefined) return;
    state.widgetId = '';
    try {
      const turnstile = await loadTurnstile();
      state.widgetId = turnstile.render(container, {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (token: string) => state.resolveToken?.(token),
        'expired-callback': () => freshToken(state),
      });
    } catch {
      state.widgetId = undefined;
    }
  };

  form.addEventListener('focusin', prepare, { once: true });

  const say = (message: string) => {
    status.textContent = message;
  };

  const markInvalid = (names: string[]) => {
    for (const field of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type="checkbox"]), textarea',
    )) {
      if (names.includes(field.name)) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
    const fieldset = form.querySelector('fieldset');
    if (fieldset) {
      if (names.includes('services')) fieldset.setAttribute('aria-invalid', 'true');
      else fieldset.removeAttribute('aria-invalid');
    }
  };

  /** Browser-side check of required fields, including "at least one" checkbox groups. */
  const missingFields = (): string[] => {
    const missing = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')]
      .filter((field) => !field.checkValidity())
      .map((field) => field.name);
    const group = form.querySelector<HTMLElement>('[data-require-one]');
    if (group && !group.querySelector('input:checked')) missing.push(group.dataset.requireOne ?? '');
    return missing;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button?.disabled) return;

    const missing = missingFields();
    markInvalid(missing);
    if (missing.length) {
      say(form.dataset.invalidMessage ?? 'Please fill in the required fields.');
      form.querySelector<HTMLElement>('[aria-invalid="true"] input, [aria-invalid="true"]')?.focus();
      return;
    }

    if (button) button.disabled = true;
    say('Sending…');
    try {
      await prepare();
      const token = await Promise.race([
        state.token!,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), TOKEN_TIMEOUT_MS)),
      ]);
      const body = new FormData(form);
      body.set('cf-turnstile-response', token);

      const response = await fetch(form.action, { method: 'POST', body, headers: { accept: 'application/json' } });
      const result = (await response.json()) as { ok: boolean; message: string; fields?: string[] };
      say(result.message);
      markInvalid(result.fields ?? []);
      if (result.ok) {
        form.reset();
        // Lets the page celebrate (the contact page tree's birds flutter).
        form.dispatchEvent(new CustomEvent('bgs:form-sent', { bubbles: true }));
      }
    } catch {
      say('Sorry, the form could not be sent. Please check your connection and try again.');
    } finally {
      // A Turnstile token works once, so get a new one for any next submission.
      if (state.widgetId && window.turnstile) {
        freshToken(state);
        window.turnstile.reset(state.widgetId);
      }
      if (button) button.disabled = false;
    }
  });
}

export function initForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-enhanced-form]').forEach(enhance);
}
