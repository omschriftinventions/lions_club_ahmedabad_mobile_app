// Lions Club — Shared UI Primitives
// Icons (inline SVG, no deps), avatar, role badge, bottom tab bar.

const T = window.LC;

// ─── Icons ────────────────────────────────────────────────────
// Minimal stroked icons matching Lions visual weight (1.6 stroke, rounded).
const Icon = ({ name, size = 22, color = T.ink, fill = 'none', strokeWidth = 1.7 }) => {
  const paths = {
    home:      <><path d="M3 11l9-7 9 7"/><path d="M5 9v11h14V9"/></>,
    roster:    <><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="8" r="2.6"/><path d="M3 19c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5"/><path d="M15 19c0-2.5 1.5-4.5 4-4.5s3 1.5 3 3.5"/></>,
    events:    <><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/></>,
    bell:      <><path d="M6 9a6 6 0 0112 0v4l1.5 3h-15L6 13V9z"/><path d="M10 19a2 2 0 004 0"/></>,
    profile:   <><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/></>,
    menu:      <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    search:    <><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></>,
    chevR:     <><path d="M9 5l7 7-7 7"/></>,
    chevL:     <><path d="M15 5l-7 7 7 7"/></>,
    chevD:     <><path d="M5 9l7 7 7-7"/></>,
    phone:     <><path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A14 14 0 013 6a2 2 0 012-2z"/></>,
    wapp:      <><path d="M4 20l1.5-4A8 8 0 1112 20a8 8 0 01-3.5-.8L4 20z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2-1.5 1z" fill={color} stroke="none"/></>,
    mail:      <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></>,
    pin:       <><path d="M12 21s-7-6-7-12a7 7 0 1114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
    cake:      <><path d="M5 13h14v7H5z"/><path d="M5 13v-2a2 2 0 012-2h10a2 2 0 012 2v2"/><path d="M9 9V6M12 9V6M15 9V6"/></>,
    star:      <><path d="M12 3l2.6 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.7 19.6l1-6L3.4 9.4l6-.9L12 3z"/></>,
    award:     <><circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/></>,
    edit:      <><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></>,
    logout:    <><path d="M14 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7a2 2 0 002-2v-3"/><path d="M21 12H10M17 8l4 4-4 4"/></>,
    qr:        <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 14h3M14 18h3M14 21h3M18 18v3M21 18v3"/></>,
    handshake: <><path d="M3 13l4-4 3 3 4-4 4 4-3 3-2-2-3 3-3-3-4 0z"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    check:     <><path d="M4 12l5 5L20 6"/></>,
    close:     <><path d="M6 6l12 12M18 6L6 18"/></>,
    filter:    <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    cause:     <><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 10-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/></>,
    book:      <><path d="M4 5a2 2 0 012-2h11v18H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h11"/></>,
    paw:       <><circle cx="6" cy="9" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="9" r="2"/><path d="M8 17a4 4 0 018 0c0 2-1.5 3-4 3s-4-1-4-3z"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/><path d="M3 13h18"/></>,
    flag:      <><path d="M5 21V4M5 4h13l-2 4 2 4H5"/></>,
    eye:       <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    arrow:     <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    sun:       <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ─── Lions logo (inline, simplified, uses brand colors) ─────
const LionsLogo = ({ size = 64 }) => (
  <img src="assets/LionsClubLogo.png" width={size} height={size} style={{ objectFit: 'contain' }} alt="Lions Club International"/>
);

// ─── Avatar with initials (placeholder for member photo) ────
const Avatar = ({ initials, size = 44, color = T.brandBlue, ring = false, status }) => (
  <div style={{
    width: size, height: size, borderRadius: 999,
    background: `linear-gradient(140deg, ${color}, ${shade(color, -18)})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: size * 0.38, letterSpacing: 0.5,
    fontFamily: T.font, flexShrink: 0, position: 'relative',
    boxShadow: ring ? `0 0 0 3px ${T.brandGold}, 0 0 0 4px ${T.surface}` : 'none',
  }}>
    {initials}
    {status && (
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: size*0.28, height: size*0.28, borderRadius: 999,
        background: status === 'online' ? T.success : T.inkFaint,
        boxShadow: `0 0 0 2px ${T.surface}`,
      }}/>
    )}
  </div>
);

// Helpers to darken / lighten a hex color
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const adj = (c) => Math.max(0, Math.min(255, Math.round(c + (pct/100)*255)));
  return '#' + [adj(r), adj(g), adj(b)].map(c => c.toString(16).padStart(2,'0')).join('');
}

// ─── Role badge ─────────────────────────────────────────────
const RoleBadge = ({ role, size = 'sm' }) => {
  const isLeader = ['President','Secretary','Treasurer','1st Vice President','2nd Vice President'].includes(role);
  const isChair = role && role.includes('Chair');
  const bg = isLeader ? T.brandBlue : isChair ? '#1F5F3F' : '#E5E8EC';
  const fg = isLeader || isChair ? '#fff' : T.inkSoft;
  const fz = size === 'sm' ? 10 : 11;
  return (
    <span style={{
      fontSize: fz, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
      background: bg, color: fg,
      padding: '3px 7px', borderRadius: 4, fontFamily: T.font,
      whiteSpace: 'nowrap',
    }}>{role}</span>
  );
};

// ─── Pill / chip ────────────────────────────────────────────
const Chip = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{
    border: 'none', padding: '7px 14px', borderRadius: 999,
    background: active ? T.brandBlue : '#fff',
    color: active ? '#fff' : T.inkSoft,
    fontFamily: T.font, fontSize: 13, fontWeight: 600,
    boxShadow: active ? 'none' : `inset 0 0 0 1px ${T.line}`,
    cursor: 'pointer', whiteSpace: 'nowrap',
  }}>{children}</button>
);

// ─── Bottom tab bar (5 tabs) ────────────────────────────────
const TabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home',    label: 'Home',    icon: 'home' },
    { id: 'roster',  label: 'Roster',  icon: 'roster' },
    { id: 'events',  label: 'Events',  icon: 'events' },
    { id: 'serve',   label: 'Serve',   icon: 'cause' },
    { id: 'profile', label: 'Profile', icon: 'profile' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 10, paddingInline: 6,
      background: '#fff',
      borderTop: `1px solid ${T.line}`,
      display: 'flex', justifyContent: 'space-around',
      zIndex: 10,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            flex: 1, padding: '4px 0',
          }}>
            <Icon name={t.icon} size={24} color={isActive ? T.brandBlue : T.inkFaint} strokeWidth={isActive ? 2 : 1.7}/>
            <div style={{
              fontFamily: T.font, fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? T.brandBlue : T.inkFaint, letterSpacing: 0.2,
            }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Mini iOS-style status bar (in-screen, not the device frame's) ──
const MiniStatus = ({ dark = false, time = '9:41' }) => {
  const c = dark ? '#fff' : '#0A1628';
  return (
    <div style={{
      height: 44, paddingInline: 22, paddingTop: 14,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      fontFamily: T.font, fontSize: 14, fontWeight: 700, color: c,
      position: 'relative', zIndex: 5,
    }}>
      <span style={{ minWidth: 56 }}>{time}</span>
      <span style={{ width: 100 }}/>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center', minWidth: 56, justifyContent: 'flex-end' }}>
        <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="6.5" width="2.6" height="4" rx="0.6" fill={c}/><rect x="3.8" y="4" width="2.6" height="6.5" rx="0.6" fill={c}/><rect x="7.6" y="2" width="2.6" height="8.5" rx="0.6" fill={c}/><rect x="11.4" y="0" width="2.6" height="10.5" rx="0.6" fill={c}/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="3" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="16" height="7" rx="1.5" fill={c}/></svg>
      </span>
    </div>
  );
};

// ─── Screen container (mimics phone canvas) ─────────────────
// Use this as the inner content. Outer wrap is IOSDevice in artboards.
const Screen = ({ children, bg = T.bg, statusDark = false, statusTime, showStatus = true, scroll = true }) => (
  <div style={{
    width: '100%', height: '100%', background: bg, position: 'relative',
    fontFamily: T.font, overflow: scroll ? 'auto' : 'hidden', color: T.ink,
  }}>
    {showStatus && <MiniStatus dark={statusDark} time={statusTime}/>}
    {children}
  </div>
);

Object.assign(window, { Icon, LionsLogo, Avatar, RoleBadge, Chip, TabBar, MiniStatus, Screen, shade });
