document.addEventListener('DOMContentLoaded', () => {
    const consentKey = 'cookieConsent';
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <h3>We use cookies</h3>
            <p>We use cookies to enhance your browsing experience and analyze our traffic. Please accept to continue.</p>
        </div>
        <div class="cookie-actions">
            <button id="reject-cookies" class="cookie-btn reject">Reject</button>
            <button id="accept-cookies" class="cookie-btn accept">Accept</button>
        </div>
    `;

    document.body.appendChild(banner);

    // Check status
    const status = localStorage.getItem(consentKey);

    if (status !== 'accepted') {
        // Show banner with loose delay/animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 500);
    }

    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem(consentKey, 'accepted');
        banner.classList.remove('show');
        // Optionally trigger any scripts that needed consent here
    });

    document.getElementById('reject-cookies').addEventListener('click', () => {
        localStorage.setItem(consentKey, 'rejected');
        banner.classList.remove('show');
    });
});
