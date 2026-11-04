export type SubmitResult = 'success' | 'error';

/** Posts the form as JSON to Formspree. Formspree answers 2xx on success. */
export async function submitContact(
  action: string,
  data: FormData,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  try {
    const response = await fetchImpl(action, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    return response.ok ? 'success' : 'error';
  } catch {
    return 'error';
  }
}

/** Progressive enhancement: without JS, the native POST still works. */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form || form.dataset.ready || !form.getAttribute('action')) return;
  form.dataset.ready = 'true';
  const status = form.querySelector<HTMLElement>('[data-contact-status]');
  const fieldset = form.querySelector('fieldset');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) status.textContent = form.dataset.sending ?? '';
    fieldset?.setAttribute('disabled', '');
    const result = await submitContact(form.action, new FormData(form));
    fieldset?.removeAttribute('disabled');
    if (result === 'success') form.reset();
    if (status)
      status.textContent = (result === 'success' ? form.dataset.success : form.dataset.error) ?? '';
  });
}
