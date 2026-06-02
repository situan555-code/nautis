export function initContactTracking() {
  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((link) => {
    if (link.dataset.contactTrackingBound === 'true') return;
    link.dataset.contactTrackingBound = 'true';

    link.addEventListener('click', () => {
      const isEmail = link.href.startsWith('mailto:');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: isEmail ? 'contact_email_click' : 'contact_phone_click',
        link_url: link.href,
        link_text: link.textContent.trim(),
        page_path: window.location.pathname,
      });
    });
  });
}
