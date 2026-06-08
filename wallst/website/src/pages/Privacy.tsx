export function Privacy() {
  const updated = 'June 8, 2026';

  return (
    <div className="about-content legal-content">
      <div className="section-eyebrow" style={{ marginBottom: 12 }}>Legal</div>
      <h2 style={{ marginTop: 0 }}>Privacy Policy</h2>
      <p className="legal-updated">Last updated: {updated}</p>

      <p>
        WALLST WATCH (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the WALLST WATCH mobile app and website at
        wallst-watch.vercel.app. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
      </p>

      <h2>Information We Collect</h2>
      <p><strong>Account information.</strong> When you create an account, we collect your name, email address, and password (stored as a secure hash). We use this to authenticate you across the web terminal and mobile app.</p>
      <p><strong>Usage data.</strong> We may record which app sections you visit (e.g. Dashboard, News) to improve the product. This data is tied to your account when you are signed in.</p>
      <p><strong>Watchlist and alerts.</strong> Symbols, price alert rules, and notification preferences you configure are stored on our servers so they sync between devices.</p>
      <p><strong>Push notification tokens.</strong> If you enable notifications on the mobile app, we store a device token provided by Apple or Google (via Expo) so we can deliver breaking news and price alerts to your device. You can disable notifications at any time in Profile → Notifications.</p>
      <p><strong>Payment information.</strong> Subscriptions are processed by Stripe. We do not store your full card number; Stripe handles payment data under their own privacy policy.</p>

      <h2>How We Use Your Information</h2>
      <ul className="legal-list">
        <li>Provide and sync your account, watchlist, alerts, and portfolio across web and mobile</li>
        <li>Send price alert emails, Slack webhooks, and push notifications you have opted into</li>
        <li>Deliver breaking market news and watchlist-related headlines via push notifications</li>
        <li>Process subscription upgrades and trial periods</li>
        <li>Improve reliability and fix bugs</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>We use the following third parties to operate WALLST WATCH:</p>
      <ul className="legal-list">
        <li><strong>Finnhub</strong> — market data, news, and quotes</li>
        <li><strong>Expo / Apple Push Notification service</strong> — mobile push delivery</li>
        <li><strong>Stripe</strong> — subscription billing</li>
        <li><strong>Railway</strong> — API hosting</li>
        <li><strong>Vercel</strong> — website hosting</li>
        <li><strong>Anthropic</strong> — AI research features on the web terminal (when used)</li>
      </ul>
      <p>These providers process data only as needed to deliver their services. We do not sell your personal information.</p>

      <h2>Data Retention</h2>
      <p>We retain your account data while your account is active. You may request account deletion by emailing hello@wallstwatch.com. Push tokens are removed when you sign out or uninstall the app.</p>

      <h2>Security</h2>
      <p>Passwords are hashed with bcrypt. API communication uses HTTPS. JWT tokens expire after 30 days. No system is 100% secure; use a strong, unique password.</p>

      <h2>Your Choices</h2>
      <ul className="legal-list">
        <li>Disable push notifications in the app Profile screen or iOS/Android system settings</li>
        <li>Turn off price or news alerts individually in Profile → Notifications</li>
        <li>Unsubscribe from daily brief emails via the link in any brief email</li>
        <li>Delete your account by contacting hello@wallstwatch.com</li>
      </ul>

      <h2>Children</h2>
      <p>WALLST WATCH is not directed at children under 13. We do not knowingly collect data from children.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The &quot;Last updated&quot; date at the top will change when we do. Continued use after changes constitutes acceptance.</p>

      <h2>Contact</h2>
      <p>Questions about this policy: <a href="mailto:hello@wallstwatch.com">hello@wallstwatch.com</a></p>

      <p className="legal-disclaimer">
        WALLST WATCH provides market data and news for informational purposes only. Nothing on this service constitutes financial, investment, or legal advice.
      </p>
    </div>
  );
}
