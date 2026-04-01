/**
 * Form Component
 *
 * Handles submission logic for the contact form.
 */

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');

    // Simulate submission
    const originalText = btn.textContent;
    btn.textContent = 'Sent ✓';
    btn.classList.add('btn--success');
    btn.disabled = true;

    // Reset button after 3 seconds
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('btn--success');
      btn.disabled = false;
      form.reset();
    }, 3000);

    // In a real app, you would send fetch() here.
  });
}
