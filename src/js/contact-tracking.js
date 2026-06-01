export function initContactTracking() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="mailto:"], a[href^="tel:"]');
    if (!link) return;

    const isEmail = link.href.startsWith('mailto:');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: isEmail ? 'contact_email_click' : 'contact_phone_click',
      link_url: link.getAttribute('href'),
      link_text: link.textContent.trim(),
      page_path: window.location.pathname,
    });
  });
}
