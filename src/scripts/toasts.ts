const DURATION = 4500;

/**
 * Announces a message in the persistent #toasts live region (aria-live="polite").
 * Visual entrance is CSS (disabled under reduced motion); the text is what matters.
 */
export function showToast(title: string, body: string): void {
  const region = document.getElementById('toasts');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  const heading = document.createElement('p');
  heading.className = 'toast-title';
  heading.textContent = title;
  const text = document.createElement('p');
  text.textContent = body;
  toast.append(heading, text);
  region.append(toast);
  window.setTimeout(() => toast.remove(), DURATION);
}
