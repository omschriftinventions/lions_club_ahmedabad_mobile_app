// Lions Club — Service & content screens
// Service Hours Log · Project Detail · Photo Gallery · Past Event Recap

const T = window.LC;
const { MEMBERS } = window.LCData;

// ──────────────────────────────────────────────────────────────
// 23. SERVICE HOURS LOG
// ──────────────────────────────────────────────────────────────
const ServiceLogScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="close" size={22} color={T.ink}/>
        <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDsp, color: T.ink }}>Log Service Hours</div>
      </div>
      <div style={{ fontSize: 13, color: T.inkFaint, fontWeight: 700 }}>Submit</div>
    </div>

    {/* Project selector */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>PROJECT</div>
      <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: `1.5px solid ${T.brandBlue}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: T.brandBlue + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👁</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: T.fontDsp }}>Vision First — Cataract Surgeries</div>
          <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>C.H. Nagri Eye Hospital</div>
        </div>
        <Icon name="chevD" size={16} color={T.brandBlue}/>
      </div>
    </div>

    {/* Date + Hours */}
    <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>DATE</div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '13px 12px', border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="events" size={16} color={T.inkSoft}/>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>Jun 12, 2026</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>HOURS</div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '13px 12px', border: `1.5px solid ${T.brandBlue}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 26, height: 26, borderRadius: 999, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: T.inkSoft }}>−</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDsp, color: T.brandBlue }}>4.5</div>
          <div style={{ width: 26, height: 26, borderRadius: 999, background: T.brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff' }}>+</div>
        </div>
      </div>
    </div>

    {/* Type of contribution chips */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>YOUR CONTRIBUTION</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Volunteer time','Coordinated','Funded','Mentored','Logistics','Photography'].map((c, i) => (
          <div key={c} style={{
            padding: '7px 12px', borderRadius: 999,
            background: i === 0 || i === 2 ? T.brandBlue : '#fff',
            color: i === 0 || i === 2 ? '#fff' : T.inkSoft,
            fontSize: 12, fontWeight: 600,
            border: i === 0 || i === 2 ? 'none' : `1px solid ${T.line}`,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {(i === 0 || i === 2) && <Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
            {c}
          </div>
        ))}
      </div>
    </div>

    {/* Beneficiaries */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>PEOPLE SERVED (OPTIONAL)</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '13px 14px', border: `1px solid ${T.line}` }}>
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>18</div>
        <div style={{ fontSize: 10, color: T.inkMute, marginTop: 2 }}>Cataract screenings completed</div>
      </div>
    </div>

    {/* Note */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>NOTES (OPTIONAL)</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '13px 14px', border: `1px solid ${T.line}`, minHeight: 70 }}>
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 500, lineHeight: 1.5 }}>
          Coordinated with Dr. Patel's team for free OPD screening. 4 referred for surgery.
        </div>
      </div>
    </div>

    {/* Photo upload */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>PHOTOS (UP TO 4)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[1,2,0,0].map((has, i) => (
          <div key={i} style={{
            aspectRatio: '1', borderRadius: 10,
            background: has ? `linear-gradient(135deg, ${T.brandBlue}40, ${T.brandGold}30)` : T.bg,
            border: has ? 'none' : `1.5px dashed ${T.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.inkMute,
          }}>
            {has ? null : <Icon name="plus" size={20} color={T.inkMute} strokeWidth={1.8}/>}
          </div>
        ))}
      </div>
    </div>

    {/* Summary card */}
    <div style={{ padding: '20px 16px 16px' }}>
      <div style={{
        background: T.success + '12', border: `1px solid ${T.success}30`,
        borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="cause" size={20} color="#fff" strokeWidth={2}/>
        </div>
        <div style={{ flex: 1, fontSize: 12, color: T.inkSoft, lineHeight: 1.4 }}>
          You'll have <b style={{ color: T.ink }}>146.5 total hours</b> this year. Officer must approve hours over 6.
        </div>
      </div>

      <button style={{
        width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 0', marginTop: 14,
        fontFamily: T.font, fontSize: 14, fontWeight: 700,
        boxShadow: `0 10px 20px ${T.brandBlue}40`,
      }}>Submit for approval</button>
    </div>
    <div style={{ height: 30 }}/>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 24. PROJECT DETAIL
// ──────────────────────────────────────────────────────────────
const ProjectDetailScreen = () => (
  <Screen bg={T.bgWarm}>
    {/* Hero */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
      paddingTop: 8, paddingBottom: 60, paddingInline: 16, position: 'relative', overflow: 'hidden',
    }}>
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', top: -60, right: -60, opacity: 0.10 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={i} x1="150" y1="150" x2="150" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*20} 150 150)`}/>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevL" size={20} color="#fff"/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={17} color="#fff"/>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow" size={15} color="#fff" strokeWidth={2}/>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(255,209,0,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          border: '1px solid rgba(255,209,0,0.35)',
        }}>👁</div>
        <div>
          <div style={{ fontSize: 10, color: T.brandGold, fontWeight: 800, letterSpacing: 1.5 }}>VISION · ACTIVE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp, marginTop: 4, letterSpacing: -0.3, lineHeight: 1.15 }}>Vision First</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Phase III · Cataract surgeries</div>
        </div>
      </div>
    </div>

    {/* Progress card pulled over hero */}
    <div style={{ paddingInline: 16, marginTop: -40 }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 16,
        boxShadow: '0 14px 30px rgba(10,22,40,0.10)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 700, letterSpacing: 1 }}>PROGRESS</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 2 }}>335 of 500 surgeries</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.brandBlue, fontFamily: T.fontDsp, letterSpacing: -0.6 }}>67%</div>
        </div>
        <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: T.bg, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '67%', background: `linear-gradient(90deg, ${T.brandBlue}, ${T.brandGold})`, borderRadius: 4 }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
          {[
            { v: '₹16.8L', l: 'raised', c: T.brandBlue },
            { v: '24',     l: 'Lions',  c: T.success },
            { v: '1,142',  l: 'hours',  c: T.warning },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.inkMute, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* About */}
    <div style={{ paddingInline: 20, marginTop: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>ABOUT THE PROJECT</div>
      <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>
        Partnership with <b style={{ color: T.ink }}>C.H. Nagri Eye Hospital</b> to sponsor 500 free cataract surgeries for economically weaker patients across Ahmedabad and surrounding districts.
      </div>
    </div>

    {/* Lead lion + Partner */}
    <div style={{ paddingInline: 16, marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LEAD LION</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar initials={MEMBERS[3].initials} size={36} color={MEMBERS[3].color}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{MEMBERS[3].name.replace('Lion ','')}</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>Service Chair</div>
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PARTNER</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: T.danger + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>C.H. Nagri</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>Eye Hospital</div>
          </div>
        </div>
      </div>
    </div>

    {/* Timeline */}
    <div style={{ paddingInline: 20, marginTop: 22, paddingBottom: 8, fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp }}>Recent activity</div>
    <div style={{ paddingInline: 16 }}>
      {[
        { d: 'Jun 12', n: 'Lion Rajesh Patel logged 4.5 hrs',  ev: 'screening camp', c: T.brandBlue },
        { d: 'Jun 08', n: '18 new screenings completed',        ev: 'milestone',      c: T.success },
        { d: 'Jun 03', n: 'Lion Dr. Hiral Joshi sponsored 5 surgeries', ev: 'donation', c: T.warning },
        { d: 'May 28', n: 'Phase III kickoff meeting',           ev: 'meeting',         c: T.inkMute },
      ].map((t, i, a) => (
        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: t.c, boxShadow: `0 0 0 3px ${t.c}25` }}/>
            {i < a.length - 1 && <div style={{ width: 2, flex: 1, background: T.line, marginTop: 4 }}/>}
          </div>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 700, letterSpacing: 0.5 }}>{t.d}</div>
            <div style={{ fontSize: 12, color: T.ink, marginTop: 2, fontWeight: 500 }}>{t.n}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Sticky CTA */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '14px 16px 28px', background: 'linear-gradient(to top, #FAF8F3 60%, rgba(250,248,243,0))',
      display: 'flex', gap: 8,
    }}>
      <button style={{
        flex: 1, background: '#fff', color: T.brandBlue, border: `1.5px solid ${T.brandBlue}30`,
        borderRadius: 14, padding: '14px 0',
        fontFamily: T.font, fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Icon name="handshake" size={15} color={T.brandBlue}/> Donate
      </button>
      <button style={{
        flex: 2, background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '14px 0',
        fontFamily: T.font, fontSize: 13, fontWeight: 700,
        boxShadow: `0 10px 20px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Icon name="cause" size={15} color="#fff"/> Log my hours
      </button>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 25. PHOTO GALLERY (event memories)
// ──────────────────────────────────────────────────────────────
const PhotoGalleryScreen = () => {
  // Mosaic of placeholder colored "photos" suggesting club events
  const photos = [
    { h: 220, c: T.brandBlue,     icon: '🌳', tag: 'Tree drive' },
    { h: 140, c: T.danger,        icon: '🩺', tag: 'Eye camp' },
    { h: 100, c: T.brandGold,     icon: '🏆', tag: 'Awards' },
    { h: 160, c: T.success,       icon: '👨\u200d👩\u200d👧', tag: 'Family' },
    { h: 180, c: '#7A3FB8',       icon: '🎂', tag: 'Birthday' },
    { h: 130, c: T.warning,       icon: '🍱', tag: 'Food drive' },
  ];
  return (
    <Screen bg={T.ink}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevL" size={20} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: T.fontDsp, color: '#fff', letterSpacing: -0.3 }}>Memories</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1, letterSpacing: 0.4 }}>248 photos · 12 albums</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="search" size={17} color="#fff"/>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: T.brandGold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={17} color={T.brandBlueDeep} strokeWidth={2.5}/>
          </div>
        </div>
      </div>

      {/* Featured album banner */}
      <div style={{ paddingInline: 16, marginTop: 8 }}>
        <div style={{
          borderRadius: 16, overflow: 'hidden', position: 'relative',
          height: 160,
          background: `linear-gradient(135deg, ${T.brandBlueDeep} 0%, ${T.brandBlue} 50%, ${T.brandGold} 130%)`,
        }}>
          <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', top: -50, right: -50, opacity: 0.20 }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={i} x1="150" y1="150" x2="150" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*20} 150 150)`}/>
            ))}
          </svg>
          <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
            <div style={{ fontSize: 10, color: T.brandGold, fontWeight: 700, letterSpacing: 2 }}>FEATURED ALBUM</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp, marginTop: 4, letterSpacing: -0.3 }}>Charter Night 2025 — 16th Installation</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>62 photos · 124 reactions</div>
              <Icon name="chevR" size={16} color="#fff"/>
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ paddingInline: 16, paddingTop: 16, display: 'flex', gap: 8, overflow: 'hidden' }}>
        {[
          { l: 'All', active: true },
          { l: 'Recent' },
          { l: 'Service' },
          { l: 'Fellowship' },
          { l: 'Family' },
        ].map(c => (
          <div key={c.l} style={{
            padding: '6px 14px', borderRadius: 999,
            background: c.active ? T.brandGold : 'rgba(255,255,255,0.08)',
            color: c.active ? T.brandBlueDeep : 'rgba(255,255,255,0.9)',
            fontSize: 12, fontWeight: 700,
            border: c.active ? 'none' : '1px solid rgba(255,255,255,0.10)',
          }}>{c.l}</div>
        ))}
      </div>

      {/* Mosaic */}
      <div style={{ paddingInline: 16, paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            height: p.h, borderRadius: 12, overflow: 'hidden',
            background: `linear-gradient(135deg, ${p.c}, ${shade(p.c, -25)})`,
            position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 10,
          }}>
            <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 22, opacity: 0.5 }}>{p.icon}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: 0.5 }}>{p.tag}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 30 }}/>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 26. PAST EVENT RECAP
// ──────────────────────────────────────────────────────────────
const PastEventRecapScreen = () => (
  <Screen bg={T.bg}>
    {/* Image header */}
    <div style={{
      height: 220, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, ${T.success} 0%, #0E4D32 100%)`,
    }}>
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 100, opacity: 0.20 }}>🌳</div>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevL" size={20} color="#fff"/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow" size={15} color="#fff" strokeWidth={2}/>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.2, background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
          ✓ Completed · Service
        </span>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp, marginTop: 8, letterSpacing: -0.3, lineHeight: 1.2 }}>
          Sabarmati Green Drive 2026
        </div>
      </div>
    </div>

    {/* Meta strip */}
    <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.line}` }}>
      <div>
        <div style={{ fontSize: 10, color: T.inkMute, letterSpacing: 0.8 }}>DATE</div>
        <div style={{ fontSize: 12, color: T.ink, fontWeight: 700, marginTop: 2 }}>Apr 22, 2026</div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: T.inkMute, letterSpacing: 0.8 }}>DURATION</div>
        <div style={{ fontSize: 12, color: T.ink, fontWeight: 700, marginTop: 2 }}>4 hours</div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: T.inkMute, letterSpacing: 0.8 }}>VENUE</div>
        <div style={{ fontSize: 12, color: T.ink, fontWeight: 700, marginTop: 2 }}>Riverfront W.</div>
      </div>
    </div>

    {/* Impact summary */}
    <div style={{ padding: '18px 20px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>IMPACT</div>
    <div style={{ paddingInline: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { v: '420',   l: 'saplings planted', c: T.success, icon: '🌱' },
        { v: '38',    l: 'Lions joined',     c: T.brandBlue, icon: '🦁' },
        { v: '8',     l: 'partner orgs',     c: T.warning, icon: '🤝' },
        { v: '1.2km', l: 'riverfront covered',c: T.danger,  icon: '📍' },
      ].map(s => (
        <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: 14, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 22, opacity: 0.4 }}>{s.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, letterSpacing: -0.4 }}>{s.v}</div>
          <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 4, fontWeight: 500 }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* Press / coverage */}
    <div style={{ padding: '20px 20px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>RECOGNITION</div>
    <div style={{ paddingInline: 16 }}>
      <div style={{ background: T.brandGold + '15', border: `1px solid ${T.brandGold}40`, borderRadius: 14, padding: 14, display: 'flex', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.brandGold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📰</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.warning, fontWeight: 700, letterSpacing: 0.5 }}>PRESS COVERAGE</div>
          <div style={{ fontSize: 12, color: T.ink, fontWeight: 700, marginTop: 2, lineHeight: 1.4 }}>
            Featured in Times of India Ahmedabad, Apr 24, 2026
          </div>
        </div>
        <Icon name="chevR" size={15} color={T.warning}/>
      </div>
    </div>

    {/* Photo strip */}
    <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>PHOTOS · 47</div>
      <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 600 }}>See all</div>
    </div>
    <div style={{ paddingInline: 16, display: 'flex', gap: 8, overflow: 'hidden' }}>
      {[T.success, T.brandBlue, T.warning, '#7A3FB8'].map((c, i) => (
        <div key={i} style={{
          width: 90, height: 90, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${c}, ${shade(c, -25)})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, opacity: 0.85,
        }}>{['🌳','📷','🤝','🌱'][i]}</div>
      ))}
    </div>

    {/* Attendees */}
    <div style={{ padding: '20px 20px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>WHO PARTICIPATED · 38</div>
    <div style={{ paddingInline: 16, marginBottom: 30 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex' }}>
          {['RP','AS','VM','HJ','BD','MT'].map((x, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: 999,
              marginLeft: i ? -8 : 0,
              background: ['#8B1A3B','#003F87','#1F5F3F','#003F87','#003F87','#6B7785'][i],
              color: '#fff', boxShadow: '0 0 0 2px #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>{x}</div>
          ))}
        </div>
        <div style={{ flex: 1, fontSize: 12, color: T.inkSoft, marginLeft: 6 }}>
          <b style={{ color: T.ink }}>and 32 more</b>
        </div>
        <Icon name="chevR" size={15} color={T.inkFaint}/>
      </div>
    </div>
  </Screen>
);

Object.assign(window, {
  ServiceLogScreen, ProjectDetailScreen, PhotoGalleryScreen, PastEventRecapScreen,
});
