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
    const status = document.getElementById('contact-form-status');
    if (!status) return;

    status.textContent =
      'Online sending is not connected yet. Please email hello@sunderandco.com to start the conversation.';
  });
}
