export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form || form.dataset.contactFormBound === 'true') return;

  form.dataset.contactFormBound = 'true';

  const status = form.querySelector('[data-contact-form-status]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const valueFor = (name) => (formData.get(name) || '').toString().trim();
    const email = form.getAttribute('action')?.replace(/^mailto:/, '') || 'hello@sunderandco.com';
    const name = [valueFor('First name'), valueFor('Last name')].filter(Boolean).join(' ');
    const company = valueFor('Company');
    const subjectName = company || name || 'New project inquiry';

    const lines = [
      `Name: ${name || 'Not provided'}`,
      `Email: ${valueFor('Email') || 'Not provided'}`,
      `Phone: ${valueFor('Phone') || 'Not provided'}`,
      `Company: ${company || 'Not provided'}`,
      `Website: ${valueFor('Website') || 'Not provided'}`,
      `Focus: ${valueFor('What should we look at?') || 'Not provided'}`,
      '',
      'Message / project notes:',
      valueFor('Message / project notes') || 'Not provided',
    ];

    if (status) {
      status.textContent = 'Opening your email app...';
    }

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Sunder project inquiry - ${subjectName}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
}
