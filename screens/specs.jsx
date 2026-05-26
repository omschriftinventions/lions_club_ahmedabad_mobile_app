// Lions Club — Claude Code handoff documents
// These render as artboards on the canvas. They are spec sheets, not screens.

const T = window.LC;

// Generic spec-sheet artboard. Larger than a phone, white, structured.
const SpecSheet = ({ title, subtitle, children, eyebrow }) => (
  <div style={{
    width: '100%', height: '100%', background: '#fff', padding: 36,
    fontFamily: T.font, color: T.ink, overflow: 'auto',
    boxSizing: 'border-box',
  }}>
    {eyebrow && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: T.brandBlue, marginBottom: 8 }}>{eyebrow}</div>}
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDsp, letterSpacing: -0.6, lineHeight: 1.1 }}>{title}</div>
    {subtitle && <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 8, lineHeight: 1.5 }}>{subtitle}</div>}
    <div style={{ height: 1, background: T.line, margin: '24px 0' }}/>
    {children}
  </div>
);

const SpecH = ({ children, color }) => (
  <div style={{
    fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: color || T.brandBlue,
    marginTop: 22, marginBottom: 10, textTransform: 'uppercase',
  }}>{children}</div>
);

const Mono = ({ children, color, bg }) => (
  <span style={{
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: 12, padding: '2px 7px', borderRadius: 5,
    background: bg || '#F4F6F9', color: color || T.brandBlueDeep,
    border: `1px solid ${T.line}`,
  }}>{children}</span>
);

// ──────────────────────────────────────────────────────────────
// SPEC 1 — README / Project Brief
// ──────────────────────────────────────────────────────────────
const SpecReadme = () => (
  <SpecSheet
    eyebrow="HANDOFF · README"
    title="Lions Club Ahmedabad — Mobile App"
    subtitle="React Native (Expo) build spec. This document and the artboards on this canvas are the complete visual & UX source-of-truth. Treat every screen on the canvas as the pixel target for that route.">

    <SpecH>App at a glance</SpecH>
    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.7 }}>
      <li><b style={{ color: T.ink }}>Audience:</b> Members of Lions Club Ahmedabad, District 323-H. ~140 members.</li>
      <li><b style={{ color: T.ink }}>Purpose:</b> Member networking, club operations, service-project coordination.</li>
      <li><b style={{ color: T.ink }}>Platforms:</b> iOS first (status bar / navigation tuned for iOS 17+). Android parity required.</li>
      <li><b style={{ color: T.ink }}>Auth:</b> Email + password → 6-digit OTP (SMS to registered mobile). 24h session.</li>
      <li><b style={{ color: T.ink }}>Data source:</b> REST API. Roster seeded from club directory file (admin import). All other data is live.</li>
    </ul>

    <SpecH>Recommended stack</SpecH>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, color: T.inkSoft, lineHeight: 1.6 }}>
      <div><b style={{ color: T.ink }}>Runtime:</b> Expo SDK 51+ (managed)</div>
      <div><b style={{ color: T.ink }}>Navigation:</b> Expo Router (file-based) or React Navigation v6</div>
      <div><b style={{ color: T.ink }}>State:</b> Zustand for auth/user · TanStack Query for server cache</div>
      <div><b style={{ color: T.ink }}>Forms:</b> react-hook-form + zod</div>
      <div><b style={{ color: T.ink }}>UI:</b> react-native-reanimated 3 · gesture-handler · expo-linear-gradient · react-native-svg</div>
      <div><b style={{ color: T.ink }}>Storage:</b> expo-secure-store (token) · AsyncStorage (cache)</div>
      <div><b style={{ color: T.ink }}>Auth helpers:</b> OTP via Twilio Verify or MSG91 (India)</div>
      <div><b style={{ color: T.ink }}>Push:</b> Expo Notifications</div>
    </div>

    <SpecH>Folder structure</SpecH>
    <pre style={{
      background: '#0A1628', color: '#E5E8EC', padding: 16, borderRadius: 10,
      fontSize: 11, lineHeight: 1.6, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      margin: 0, overflow: 'auto',
    }}>{`app/
├── (auth)/
│   ├── splash.tsx
│   ├── login.tsx
│   └── otp.tsx
├── (tabs)/
│   ├── _layout.tsx        # bottom tab bar
│   ├── home.tsx
│   ├── roster.tsx
│   ├── events.tsx
│   ├── serve.tsx
│   └── profile.tsx
├── member/[id].tsx
├── event/[id].tsx
├── find-member.tsx
├── business-directory.tsx
└── notifications.tsx

src/
├── components/
│   ├── Avatar.tsx
│   ├── RoleBadge.tsx
│   ├── EventCard.tsx
│   ├── MemberRow.tsx
│   ├── SectionHeader.tsx
│   ├── Chip.tsx
│   └── icons/             # 1 file per icon, react-native-svg
├── theme/
│   ├── tokens.ts          # colors, spacing, radii, type
│   └── types.ts
├── api/
│   ├── client.ts          # fetch wrapper w/ auth header
│   ├── auth.ts
│   ├── members.ts
│   ├── events.ts
│   └── service.ts
├── store/
│   ├── auth.ts
│   └── prefs.ts
└── utils/
    ├── format.ts
    └── permissions.ts`}</pre>

    <SpecH>Screens → routes map</SpecH>
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 6, fontSize: 12, color: T.inkSoft }}>
      {[
        ['Splash',           '/ (boot redirect)'],
        ['Login',            '/(auth)/login'],
        ['OTP',              '/(auth)/otp?phone=…'],
        ['Home',             '/(tabs)/home'],
        ['Roster',           '/(tabs)/roster'],
        ['Member detail',    '/member/[id]'],
        ['Find member',      '/find-member'],
        ['Events list',      '/(tabs)/events'],
        ['Event detail',     '/event/[id]'],
        ['Causes / Serve',   '/(tabs)/serve'],
        ['My profile',       '/(tabs)/profile'],
        ['Notifications',    '/notifications'],
        ['Side menu',        'drawer overlay'],
        ['Business directory','/business-directory'],
      ].map(([k, v]) => (
        <React.Fragment key={k}>
          <div><b style={{ color: T.ink }}>{k}</b></div>
          <div><Mono>{v}</Mono></div>
        </React.Fragment>
      ))}
    </div>

    <SpecH>Build order (suggested sprints)</SpecH>
    <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.7 }}>
      <li><b style={{ color: T.ink }}>Sprint 1 — Foundation:</b> tokens, Avatar/Chip/SectionHeader, icon set, bottom tab bar, splash + login + OTP flow.</li>
      <li><b style={{ color: T.ink }}>Sprint 2 — Roster:</b> Home dashboard, Roster list, Member detail, Find Member.</li>
      <li><b style={{ color: T.ink }}>Sprint 3 — Events:</b> Events list, Event detail, RSVP, push reminders.</li>
      <li><b style={{ color: T.ink }}>Sprint 4 — Service:</b> Causes screen, project hours logging, news feed.</li>
      <li><b style={{ color: T.ink }}>Sprint 5 — Polish:</b> Profile, ID card with QR, business directory, settings, notifications.</li>
    </ol>

    <div style={{ marginTop: 28, padding: 14, background: T.brandGold + '20', borderRadius: 10, fontSize: 12, color: T.inkSoft, lineHeight: 1.5 }}>
      <b style={{ color: T.ink }}>Note for Claude Code:</b> the design tokens artboard is exhaustive. Translate token values <i>exactly</i> — do not invent new colors or sizes. When a screen here uses brand blue at 100% opacity, the RN equivalent is <Mono>T.brandBlue</Mono>, never a "close-enough" hex.
    </div>
  </SpecSheet>
);

// ──────────────────────────────────────────────────────────────
// SPEC 2 — Design tokens (RN-ready)
// ──────────────────────────────────────────────────────────────
const SpecTokens = () => {
  const swatch = (name, hex, sub) => (
    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{name}</div>
        {sub && <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>{sub}</div>}
      </div>
      <Mono>{hex}</Mono>
    </div>
  );
  return (
    <SpecSheet
      eyebrow="HANDOFF · DESIGN TOKENS"
      title="Design Tokens"
      subtitle="Drop these into src/theme/tokens.ts. Every color, radius, spacing value used in the design lives here.">

      <SpecH>Brand</SpecH>
      <div>
        {swatch('brandBlue',     '#003F87', 'Primary · Lions International Blue')}
        {swatch('brandBlueDark', '#002C5F', 'Pressed states, gradients')}
        {swatch('brandBlueDeep', '#001F45', 'Hero backgrounds')}
        {swatch('brandGold',     '#FFD100', 'Accent · CTAs on dark · Lions Gold')}
        {swatch('brandGoldDark', '#E6B800', 'Gold pressed state')}
      </div>

      <SpecH>Neutrals & semantic</SpecH>
      <div>
        {swatch('ink',     '#0A1628', 'Primary text')}
        {swatch('inkSoft', '#3D4B5C', 'Secondary text')}
        {swatch('inkMute', '#6B7785', 'Tertiary / captions')}
        {swatch('inkFaint','#9AA3AE', 'Disabled / hints')}
        {swatch('line',    '#E5E8EC', 'Hairline dividers')}
        {swatch('bg',      '#F4F6F9', 'App background (cool)')}
        {swatch('bgWarm',  '#FAF8F3', 'Alt warm bg (event detail)')}
        {swatch('success', '#1F8A5B', '')}
        {swatch('danger',  '#C8362D', '')}
        {swatch('warning', '#E08E1A', '')}
        {swatch('info',    '#2A6FDB', '')}
      </div>

      <SpecH>Radii (px)</SpecH>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {[['sm',8],['md',12],['lg',16],['xl',22],['pill',999]].map(([k,v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: T.brandBlue + '15', borderRadius: v }}/>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: T.ink }}>{k}</div>
            <div style={{ fontSize: 10, color: T.inkMute }}>{v}px</div>
          </div>
        ))}
      </div>

      <SpecH>Spacing scale (4-based)</SpecH>
      <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 6 }}>Use <Mono>s(n)</Mono> = <Mono>n * 4</Mono>. Avoid arbitrary numbers.</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {[1,2,3,4,5,6,8,10].map(n => (
          <div key={n} style={{ textAlign: 'center' }}>
            <div style={{ width: n * 4, height: 32, background: T.brandBlue, borderRadius: 2 }}/>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4 }}>s({n})</div>
            <div style={{ fontSize: 9, color: T.inkFaint }}>{n * 4}px</div>
          </div>
        ))}
      </div>

      <SpecH>Type</SpecH>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { name: 'Display XL · Hero',    size: 30, weight: 800, font: T.fontDsp, ex: 'Welcome back' },
          { name: 'Display L · Section',   size: 24, weight: 800, font: T.fontDsp, ex: 'Roster' },
          { name: 'Display M · Card',     size: 17, weight: 800, font: T.fontDsp, ex: "Today's events" },
          { name: 'Body L',               size: 15, weight: 600, font: T.font,    ex: 'Lion Anand Shah' },
          { name: 'Body M',               size: 13, weight: 500, font: T.font,    ex: 'Mobile +91 98980 23456' },
          { name: 'Caption',              size: 11, weight: 500, font: T.font,    ex: 'Navrangpura · since 2011' },
          { name: 'Overline',             size: 10, weight: 700, font: T.font,    ex: 'OFFICE BEARERS', letterSpacing: 1.2, transform: 'uppercase' },
        ].map(r => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'baseline', gap: 18, paddingBottom: 8, borderBottom: `1px solid ${T.line}` }}>
            <div style={{
              fontSize: r.size, fontWeight: r.weight, fontFamily: r.font, color: T.ink,
              letterSpacing: r.letterSpacing || (r.font === T.fontDsp ? -0.3 : 0),
              textTransform: r.transform || 'none', minWidth: 220,
            }}>{r.ex}</div>
            <div style={{ fontSize: 11, color: T.inkMute, flex: 1 }}>
              <b style={{ color: T.ink }}>{r.name}</b><br/>
              {r.size}px · weight {r.weight} · {r.font === T.fontDsp ? 'Playfair Display' : 'SF Pro / Inter'}
            </div>
          </div>
        ))}
      </div>

      <SpecH>Fonts to install</SpecH>
      <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.7 }}>
        <b style={{ color: T.ink }}>Body:</b> SF Pro (iOS default) / Inter (Android) via <Mono>expo-font</Mono><br/>
        <b style={{ color: T.ink }}>Display:</b> Playfair Display — Google Fonts. Weights 700, 800.<br/>
        Use <Mono>useFonts()</Mono> in root layout; render splash until fonts load.
      </div>

      <SpecH>Elevation / shadows</SpecH>
      <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: T.inkSoft, lineHeight: 1.7 }}>
        <b style={{ color: T.ink, fontFamily: T.font, fontSize: 12 }}>card</b> &nbsp; iOS: <Mono>{`{shadowColor:'#0A1628',shadowOffset:{w:0,h:2},shadowOpacity:0.05,shadowRadius:8}`}</Mono> · Android: <Mono>elevation:2</Mono><br/>
        <b style={{ color: T.ink, fontFamily: T.font, fontSize: 12 }}>floating</b> &nbsp; iOS: shadowOpacity 0.10, radius 18, offset y:14 · Android: elevation 6
      </div>
    </SpecSheet>
  );
};

// ──────────────────────────────────────────────────────────────
// SPEC 3 — Components & API contracts
// ──────────────────────────────────────────────────────────────
const SpecComponents = () => (
  <SpecSheet
    eyebrow="HANDOFF · COMPONENTS"
    title="Components & API"
    subtitle="Reusable RN components every screen depends on, and the API endpoints to wire them to.">

    <SpecH>Component inventory</SpecH>
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 10, fontSize: 12 }}>
      {[
        ['<Avatar>',        'initials, size, color, ring?:boolean, status?:"online"|"offline". Used in roster rows, headers, member detail.'],
        ['<RoleBadge>',     'role: string. Auto-styles by role. Leaders → brandBlue solid; Chairs → green; Member → grey.'],
        ['<MemberRow>',     'Takes member object. Avatar + name + designation pill + profession/area + call/chevron actions. Used in Roster, Find Member, Event Attendees.'],
        ['<EventCard>',     'Takes event object. Variants: hero (Home next-up), list (Events tab), past (greyed).'],
        ['<SectionHeader>', 'title + optional action. Standard 20px paddingInline, 12px paddingBottom.'],
        ['<Chip>',          'children, active?, onPress. Pill, brandBlue when active.'],
        ['<BottomTabBar>',  '5 tabs · Home · Roster · Events · Serve · Profile. Active tint = brandBlue. Inactive = inkFaint.'],
        ['<StatCard>',      'value, label, color. Used in Home (impact), Causes, Profile.'],
        ['<Icon>',          'name + size + color. Backed by react-native-svg. All icons inline (no font icons).'],
        ['<GradientHeader>',`Hero header with brandBlueDeep → brandBlue gradient, optional gold sun-ray SVG overlay (opacity 0.07). Used on Home, Profile, Causes, Member Detail.`],
      ].map(([k, v]) => (
        <React.Fragment key={k}>
          <div><Mono>{k}</Mono></div>
          <div style={{ color: T.inkSoft, lineHeight: 1.5 }}>{v}</div>
        </React.Fragment>
      ))}
    </div>

    <SpecH>API endpoints (REST)</SpecH>
    <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', lineHeight: 1.9, color: T.inkSoft }}>
      <div style={{ color: T.success }}>POST  /auth/login              {'{ email, password }'} → {'{ otpSentTo }'}</div>
      <div style={{ color: T.success }}>POST  /auth/verify-otp         {'{ otp }'} → {'{ token, user }'}</div>
      <div style={{ color: T.success }}>POST  /auth/resend-otp</div>
      <div style={{ color: T.brandBlue }}>GET   /members?q=&filter=     → Member[]</div>
      <div style={{ color: T.brandBlue }}>GET   /members/:id            → Member</div>
      <div style={{ color: T.brandBlue }}>PATCH /members/me             → Member</div>
      <div style={{ color: T.warning }}>GET   /events?scope=upcoming  → Event[]</div>
      <div style={{ color: T.warning }}>GET   /events/:id             → Event w/ attendees</div>
      <div style={{ color: T.warning }}>POST  /events/:id/rsvp        {'{ status: "yes"|"no" }'}</div>
      <div style={{ color: T.danger }}>GET   /causes                 → Cause[] w/ progress</div>
      <div style={{ color: T.danger }}>POST  /service/log            {'{ projectId, hours, note }'}</div>
      <div style={{ color: '#7A3FB8' }}>GET   /news                   → NewsItem[]</div>
      <div style={{ color: '#7A3FB8' }}>GET   /notifications          → Notification[]</div>
      <div style={{ color: '#7A3FB8' }}>GET   /businesses?category=   → BusinessListing[]</div>
    </div>

    <SpecH>Data shapes (TypeScript)</SpecH>
    <pre style={{
      background: '#0A1628', color: '#E5E8EC', padding: 14, borderRadius: 10,
      fontSize: 10.5, lineHeight: 1.55, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      margin: 0, overflow: 'auto',
    }}>{`type Role =
  | 'President' | 'Secretary' | 'Treasurer'
  | '1st Vice President' | '2nd Vice President'
  | 'Membership Chair' | 'Service Chair' | 'Tail Twister'
  | 'Member';

type Member = {
  id: string;
  memberId: string;          // LCA-2008-014
  name: string;               // "Lion Rajesh Patel"
  role: Role;
  designation: 'PMJF' | 'MJF' | '—';
  profession: string;
  business: string;
  area: string;               // Ahmedabad locality
  phone: string;              // +91 XXXXX XXXXX
  email: string;
  joined: number;             // year
  dob: string;                // 'Mar 14'
  anniv: string;
  spouse: string;
  photoUrl?: string;
  initials: string;
};

type EventType = 'Signature' | 'Service' | 'Meeting' | 'Fellowship';
type RsvpStatus = 'yes' | 'no' | 'pending';

type Event = {
  id: string;
  title: string;
  date: string;               // ISO
  venue: string;
  type: EventType;
  going: number;
  myRsvp: RsvpStatus;
  contribution?: number;
  description?: string;
  attendees?: Member[];
};

type Cause = {
  id: 'vision'|'hunger'|'environment'|'diabetes'|'cancer'|'education';
  name: string;
  units: string;
  unitLabel: string;
  progress: number;           // 0..100
  color: string;
};`}</pre>

    <SpecH>Permissions & native modules</SpecH>
    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: T.inkSoft, lineHeight: 1.7 }}>
      <li><Mono>expo-contacts</Mono> — optional, for "save to contacts" on member detail.</li>
      <li><Mono>expo-linking</Mono> — <Mono>tel:</Mono>, <Mono>mailto:</Mono>, WhatsApp <Mono>https://wa.me/91…</Mono>.</li>
      <li><Mono>expo-image</Mono> — member photos w/ blurhash placeholder.</li>
      <li><Mono>react-native-qrcode-svg</Mono> — digital ID card QR on Profile.</li>
      <li><Mono>expo-notifications</Mono> — push for event reminders, birthdays, club news.</li>
      <li><Mono>expo-secure-store</Mono> — JWT token. Never AsyncStorage for auth.</li>
    </ul>

    <SpecH>Accessibility checklist</SpecH>
    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: T.inkSoft, lineHeight: 1.7 }}>
      <li>Hit targets ≥ 44×44 (call/whatsapp icons on roster row are 32 — wrap in 44 padding).</li>
      <li><Mono>accessibilityLabel</Mono> on every icon-only button.</li>
      <li>Respect <Mono>useColorScheme()</Mono> — dark mode is a v2 feature, but tokens already accommodate.</li>
      <li>Dynamic type: use <Mono>allowFontScaling</Mono> for body, disable for hero numerals.</li>
    </ul>
  </SpecSheet>
);

Object.assign(window, { SpecReadme, SpecTokens, SpecComponents });
