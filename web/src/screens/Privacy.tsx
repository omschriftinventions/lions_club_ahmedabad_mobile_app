/**
 * Public privacy policy page — reachable WITHOUT login (required by both
 * Apple App Store and Google Play review). Rendered before the auth gate
 * in App.tsx; also mirrored as a static file at web/public/privacy/index.html.
 */
export default function Privacy() {
  return (
    <div style={{ background: '#F4F6F9', minHeight: '100vh', color: '#0A1628', fontFamily: "'Segoe UI', -apple-system, Arial, sans-serif", lineHeight: 1.65 }}>
      <header style={{ background: 'linear-gradient(135deg, #001F45, #003F87)', color: '#fff', padding: '44px 20px 36px', textAlign: 'center' }}>
        <div style={{ color: '#FFD100', fontSize: 12, letterSpacing: 3, fontWeight: 700 }}>
          LIONS CLUB OF AHMEDABAD HOST (MAIN) · DISTRICT 3232 B1
        </div>
        <h1 style={{ margin: '8px 0 4px', fontSize: 30, letterSpacing: -0.5 }}>Privacy Policy</h1>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 14 }}>Effective date: 9 July 2026 · Last updated: 9 July 2026</div>
      </header>

      <main style={{ maxWidth: 780, margin: '-18px auto 40px', background: '#fff', borderRadius: 12, padding: '34px 38px 40px', boxShadow: '0 8px 30px rgba(10,22,40,.08)' }}>
        <p>
          This Privacy Policy describes how <strong>Lions Club of Ahmedabad host (Main)</strong> (&ldquo;the Club&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and protects your information when you use the{' '}
          <strong>Lions Club Ahmedabad Host</strong> mobile application (iOS and Android) and the website at{' '}
          <a href="https://lionsclubofahmedabadhost.com">lionsclubofahmedabadhost.com</a> (together, the
          &ldquo;Service&rdquo;). The Service is a private, members-only application for Club members and officers.
        </p>

        <H>1. Information We Collect</H>
        <table style={tbl}>
          <thead><tr><th style={th}>Category</th><th style={th}>Examples</th><th style={th}>Source</th></tr></thead>
          <tbody>
            <tr><td style={td}>Identity &amp; contact</td><td style={td}>Name, phone number, email address</td><td style={td}>Provided by you or the Club&rsquo;s membership directory</td></tr>
            <tr><td style={td}>Profile details</td><td style={td}>Profession, business name, locality, joining year, birthday (day &amp; month), anniversary, spouse name, profile photo</td><td style={td}>Provided by you or Club officers</td></tr>
            <tr><td style={td}>Club activity</td><td style={td}>Event RSVPs, attendance, chat messages, referrals, photos you upload</td><td style={td}>Generated when you use the Service</td></tr>
            <tr><td style={td}>Meeting recordings</td><td style={td}>Audio recordings of Club meetings, transcripts, and AI-generated summaries</td><td style={td}>Recorded by Club officers with the microphone, only when a recording is deliberately started</td></tr>
            <tr><td style={td}>Device &amp; technical</td><td style={td}>Push-notification token, device platform (iOS/Android), authentication session data</td><td style={td}>Collected automatically when you sign in</td></tr>
          </tbody>
        </table>
        <p style={muted}>
          We do not collect precise location, contacts, browsing history, or advertising identifiers. We do not use the
          microphone or camera except when you (or an authorised officer) explicitly start a recording or choose a photo.
        </p>

        <H>2. How We Use Your Information</H>
        <ul>
          <li>Operate the members-only directory, events, RSVPs, news, chats, and notifications.</li>
          <li>Authenticate you (phone number + password, or one-time codes where enabled).</li>
          <li>Transcribe and summarise Club meeting recordings using AI services (see Section 4).</li>
          <li>Send push notifications about Club events, announcements, and messages. You can disable these in your device settings at any time.</li>
          <li>Maintain security, prevent misuse, and keep an audit trail of administrative actions.</li>
        </ul>
        <p>We do <strong>not</strong> sell, rent, or trade your personal information. We do not use your data for advertising or tracking.</p>

        <H>3. Legal Basis</H>
        <p>
          We process your information on the basis of your membership relationship with the Club (legitimate interest
          and, where applicable, consent — e.g., for meeting recordings and photo uploads). You may withdraw consent at
          any time by contacting the Club Secretary.
        </p>

        <H>4. Third-Party Services</H>
        <table style={tbl}>
          <thead><tr><th style={th}>Service</th><th style={th}>Purpose</th><th style={th}>Data shared</th></tr></thead>
          <tbody>
            <tr><td style={td}>AI providers (via OpenRouter or an equivalent OpenAI-compatible service)</td><td style={td}>Generating meeting transcripts and summaries</td><td style={td}>Meeting audio transcripts (text). Not used by us to train models.</td></tr>
            <tr><td style={td}>Speech-to-text provider (e.g., Groq Whisper)</td><td style={td}>Transcribing meeting audio</td><td style={td}>Meeting audio recordings</td></tr>
            <tr><td style={td}>Expo Push Notification Service</td><td style={td}>Delivering push notifications</td><td style={td}>Device push token, notification content</td></tr>
            <tr><td style={td}>SMS / WhatsApp gateway (when OTP login is enabled)</td><td style={td}>Delivering one-time login codes</td><td style={td}>Phone number, one-time code</td></tr>
          </tbody>
        </table>
        <p style={muted}>Each provider processes data under its own privacy policy. We share only the minimum data needed for the feature to work.</p>

        <H>5. Data Storage &amp; Security</H>
        <ul>
          <li>Data is stored on secure servers managed by the Club with access restricted to authorised administrators.</li>
          <li>All traffic between the app/website and our servers is encrypted with HTTPS/TLS.</li>
          <li>Passwords are stored as salted hashes; API keys and sessions are stored securely.</li>
          <li>Meeting recordings and transcripts are accessible only to authorised Club members.</li>
        </ul>

        <H>6. Data Retention</H>
        <ul>
          <li>Membership and profile data is kept while you remain a Club member.</li>
          <li>If you leave the Club, your profile is deactivated and can be deleted on request.</li>
          <li>Meeting recordings, transcripts, and summaries are kept as part of Club records unless deletion is requested and approved by the Club board.</li>
          <li>Chat messages remain until deleted by an administrator.</li>
        </ul>

        <H>7. Your Rights</H>
        <p>You may, at any time, request to:</p>
        <ul>
          <li>Access a copy of the personal data we hold about you;</li>
          <li>Correct inaccurate data (much of your profile is editable in the app);</li>
          <li>Delete your data (subject to the Club&rsquo;s record-keeping obligations);</li>
          <li>Object to or restrict specific processing, including AI summarisation of meetings you attend;</li>
          <li>Withdraw consent for photos or recordings featuring you.</li>
        </ul>
        <p>To exercise any of these rights, contact the Club Secretary using the details below. We respond within 30 days.</p>

        <H>8. Children&rsquo;s Privacy</H>
        <p>
          The Service is intended for adult Club members (18+). We do not knowingly collect information from children.
          If you believe a child&rsquo;s data has been collected, contact us and we will delete it promptly.
        </p>

        <H>9. Account Deletion</H>
        <p>
          You may request deletion of your account and associated personal data by emailing{' '}
          <a href="mailto:support@omsinv.com">support@omsinv.com</a> or contacting the Club Secretary. Upon verification,
          your account and personal data will be removed within 30 days, except where retention is required for the
          Club&rsquo;s statutory records.
        </p>

        <H>10. Changes to This Policy</H>
        <p>
          We may update this policy from time to time. Material changes will be announced in the app. The
          &ldquo;Last updated&rdquo; date at the top reflects the latest revision.
        </p>

        <H>11. Contact Us</H>
        <p>
          <strong>Lions Club of Ahmedabad host (Main)</strong><br />
          Lions Clubs International — District 3232 B1, Ahmedabad, Gujarat, India<br />
          Email: <a href="mailto:secretary@lionsclubahmedabad.org">secretary@lionsclubahmedabad.org</a>
        </p>
        <p style={muted}>
          Technical operator: Omschrift Inventions, 1107, A. Shridhar Athens, Shivranjani Cross Rd, Satellite,
          Ahmedabad, Gujarat 380015 · <a href="mailto:support@omsinv.com">support@omsinv.com</a>
        </p>
      </main>

      <footer style={{ textAlign: 'center', color: '#6B7785', fontSize: 12.5, padding: '0 16px 42px' }}>
        &copy; 2026 Lions Club of Ahmedabad host (Main) · &ldquo;We Serve&rdquo;
      </footer>
    </div>
  );
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: 17, color: '#003F87', margin: '30px 0 8px', paddingBottom: 6, borderBottom: '1px solid #E5E8EC' }}>{children}</h2>
);
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', margin: '10px 0', fontSize: 14 };
const th: React.CSSProperties = { border: '1px solid #E5E8EC', padding: '8px 10px', textAlign: 'left', background: '#F4F6F9', fontSize: 12.5 };
const td: React.CSSProperties = { border: '1px solid #E5E8EC', padding: '8px 10px', textAlign: 'left', verticalAlign: 'top' };
const muted: React.CSSProperties = { color: '#6B7785', fontSize: 13.5 };
