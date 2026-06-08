export function Terms() {
  const updated = 'June 8, 2026';

  return (
    <div className="about-content legal-content">
      <div className="section-eyebrow" style={{ marginBottom: 12 }}>Legal</div>
      <h2 style={{ marginTop: 0 }}>Terms of Service</h2>
      <p className="legal-updated">Last updated: {updated}</p>

      <p>
        By accessing or using WALLST WATCH (the website, mobile app, and related API), you agree to these Terms of Service.
        If you do not agree, do not use the service.
      </p>

      <h2>Service Description</h2>
      <p>
        WALLST WATCH is a market intelligence platform that aggregates financial news, quotes, alerts, and research tools.
        Data is sourced from third-party providers including Finnhub and may be delayed or incomplete. We do not guarantee accuracy, timeliness, or completeness of any data.
      </p>

      <h2>Not Financial Advice</h2>
      <p>
        All content — including news headlines, price alerts, AI-generated research, and daily briefs — is for <strong>informational and educational purposes only</strong>.
        WALLST WATCH is not a registered investment adviser, broker-dealer, or financial planner. Nothing on the service constitutes a recommendation to buy, sell, or hold any security.
        You are solely responsible for your investment decisions. Past performance does not guarantee future results.
      </p>

      <h2>Accounts</h2>
      <p>
        You must provide accurate registration information and keep your password secure. You are responsible for all activity under your account.
        We may suspend or terminate accounts that violate these terms or abuse the service.
      </p>

      <h2>Subscriptions & Billing</h2>
      <p>
        Paid plans (Pro, Professional, Institutional) are billed through Stripe. Free trials convert to a free plan unless you subscribe.
        Refunds are handled on a case-by-case basis — contact hello@wallstwatch.com within 7 days of a charge if you believe billing was in error.
      </p>

      <h2>Push Notifications</h2>
      <p>
        By enabling notifications, you consent to receive breaking news and price alert messages on your device.
        Message frequency varies based on market activity and your alert settings. Standard message and data rates may apply.
        You may opt out at any time in the app or device settings.
      </p>

      <h2>Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul className="legal-list">
        <li>Scrape, reverse-engineer, or resell our data or API without written permission</li>
        <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
        <li>Use the service for any unlawful purpose</li>
        <li>Overload our infrastructure with automated requests beyond reasonable personal use</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        The WALLST WATCH name, logo, design, and original content are owned by WALLST WATCH. Market data and news headlines remain the property of their respective providers.
        You may not copy or redistribute our UI, code, or branding without permission.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WALLST WATCH AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE —
        INCLUDING TRADING LOSSES BASED ON INFORMATION DISPLAYED IN THE APP.
        OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
      </p>

      <h2>Changes</h2>
      <p>We may modify these terms at any time. Material changes will be reflected in the &quot;Last updated&quot; date. Continued use constitutes acceptance.</p>

      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of the State of New York, United States, without regard to conflict-of-law principles.</p>

      <h2>Contact</h2>
      <p>Questions: <a href="mailto:hello@wallstwatch.com">hello@wallstwatch.com</a></p>
    </div>
  );
}
