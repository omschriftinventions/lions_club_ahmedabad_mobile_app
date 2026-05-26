// Lions Club — Events & Service screens
// Events list · Event Detail · Causes / Service Impact

const T = window.LC;
const { EVENTS, CAUSES } = window.LCData;

// Type color mapping
const eventTypeColor = (type) => ({
  'Signature':  T.brandGold,
  'Service':    T.success,
  'Meeting':    T.brandBlue,
  'Fellowship': T.warning,
}[type] || T.inkMute);

// ──────────────────────────────────────────────────────────────
// 8. EVENTS LIST
// Tabbed: Upcoming / Past / My RSVPs
// ──────────────────────────────────────────────────────────────
const EventsScreen = () => (
  <Screen bg={T.bg}>
    {/* Header */}
    <div style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.4 }}>Events</div>
        <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}>{EVENTS.length} upcoming · 12 past</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
          <Icon name="events" size={17} color={T.ink}/>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: T.brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2}/>
        </div>
      </div>
    </div>

    {/* Segmented control */}
    <div style={{ paddingInline: 20, paddingTop: 14 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 4, display: 'flex', gap: 4, boxShadow: '0 2px 6px rgba(10,22,40,0.04)' }}>
        {[
          { id: 'up',  label: 'Upcoming', active: true },
          { id: 'rsvp', label: 'My RSVPs' },
          { id: 'past', label: 'Past' },
        ].map(t => (
          <div key={t.id} style={{
            flex: 1, padding: '8px 0', textAlign: 'center', borderRadius: 8,
            background: t.active ? T.brandBlue : 'transparent',
            color: t.active ? '#fff' : T.inkSoft,
            fontSize: 12, fontWeight: 700, letterSpacing: 0.2,
          }}>{t.label}</div>
        ))}
      </div>
    </div>

    {/* Calendar strip */}
    <div style={{ padding: '14px 20px 8px', display: 'flex', gap: 8, overflow: 'hidden' }}>
      {[
        { d: 'SUN', n: '14', has: true,  active: true },
        { d: 'MON', n: '15' },
        { d: 'TUE', n: '16' },
        { d: 'WED', n: '17', has: true },
        { d: 'THU', n: '18' },
        { d: 'FRI', n: '19' },
        { d: 'SAT', n: '20' },
      ].map(d => (
        <div key={d.n} style={{
          flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 12,
          background: d.active ? T.brandBlue : '#fff',
          color: d.active ? '#fff' : T.ink,
          boxShadow: d.active ? `0 6px 14px ${T.brandBlue}30` : '0 2px 4px rgba(10,22,40,0.04)',
          position: 'relative',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: d.active ? 0.8 : 0.5, letterSpacing: 0.6 }}>{d.d}</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2, fontFamily: T.fontDsp }}>{d.n}</div>
          {d.has && !d.active && <div style={{ width: 5, height: 5, borderRadius: 3, background: T.brandGold, margin: '4px auto 0' }}/>}
          {d.has && d.active && <div style={{ width: 5, height: 5, borderRadius: 3, background: T.brandGold, margin: '4px auto 0' }}/>}
        </div>
      ))}
    </div>

    {/* Event cards */}
    <div style={{ paddingInline: 16, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {EVENTS.slice(0, 4).map(e => (
        <div key={e.id} style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          display: 'flex', boxShadow: '0 2px 10px rgba(10,22,40,0.05)',
        }}>
          {/* Date strip */}
          <div style={{
            width: 76, background: e.type === 'Signature'
              ? `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`
              : T.bg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '14px 4px',
            color: e.type === 'Signature' ? '#fff' : T.ink,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: e.type === 'Signature' ? T.brandGold : T.danger }}>{e.month}</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDsp, lineHeight: 1, marginTop: 3 }}>{e.day}</div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{e.time}</div>
          </div>
          <div style={{ flex: 1, padding: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                color: e.type === 'Signature' ? T.brandBlueDeep : '#fff',
                background: eventTypeColor(e.type),
                padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase',
              }}>{e.type}</span>
              {e.status === 'rsvp-yes' && (
                <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.success + '15', padding: '2px 7px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, textTransform: 'uppercase' }}>
                  <Icon name="check" size={9} color={T.success} strokeWidth={3}/> Going
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: T.fontDsp, lineHeight: 1.3 }}>{e.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: T.inkMute }}>
              <Icon name="pin" size={11} color={T.inkMute}/>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.venue}</span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: T.inkSoft }}><b style={{ color: T.ink }}>{e.going}</b> going</div>
              <Icon name="chevR" size={14} color={T.inkFaint}/>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 100 }}/>
    <TabBar active="events"/>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 9. EVENT DETAIL
// ──────────────────────────────────────────────────────────────
const EventDetailScreen = () => {
  const e = EVENTS[0]; // Charter Night
  return (
    <Screen bg={T.bgWarm}>
      {/* Hero image area */}
      <div style={{
        height: 240, background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <svg width="320" height="320" viewBox="0 0 320 320" style={{ position: 'absolute', top: -80, right: -80, opacity: 0.12 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1="160" y1="160" x2="160" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*18} 160 160)`}/>
          ))}
        </svg>
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 40, background: T.bgWarm, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}/>

        {/* Top bar */}
        <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevL" size={20} color="#fff" strokeWidth={2}/>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="star" size={18} color="#fff"/>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow" size={16} color="#fff" strokeWidth={2}/>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 56, left: 20, right: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: T.brandGold, color: T.brandBlueDeep,
            padding: '4px 10px', borderRadius: 999,
            fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
          }}>★ SIGNATURE EVENT</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, lineHeight: 1.15, marginTop: 10, letterSpacing: -0.3 }}>
            Charter Night 2026<br/>17th Installation Ceremony
          </div>
        </div>
      </div>

      {/* Date / venue card */}
      <div style={{ paddingInline: 16, marginTop: 14 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 2px 8px rgba(10,22,40,0.05)' }}>
          <div style={{ background: T.brandBlue + '10', borderRadius: 10, padding: '8px 10px', textAlign: 'center', minWidth: 50 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: T.danger, letterSpacing: 1 }}>JUN</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, lineHeight: 1 }}>14</div>
            <div style={{ fontSize: 9, color: T.inkMute, marginTop: 2 }}>SUN</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Saturday, 14 June 2026</div>
            <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>7:30 PM — 11:00 PM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: T.inkMute }}>
              <Icon name="pin" size={11} color={T.danger}/> Hyatt Regency, Ashram Road
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.brandBlue + '10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pin" size={18} color={T.brandBlue}/>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ paddingInline: 16, marginTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>ABOUT</div>
        <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>
          Join us for the <b style={{ color: T.ink }}>17th Installation Ceremony</b> of Lions Club Ahmedabad. An evening of fellowship, recognition of service, and the official handover to the incoming board. Black-tie. Spouses welcome.
        </div>
      </div>

      {/* Attending preview */}
      <div style={{ paddingInline: 16, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2 }}>WHO'S GOING · 78</div>
          <div style={{ fontSize: 12, color: T.brandBlue, fontWeight: 600 }}>See all</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 6px rgba(10,22,40,0.04)' }}>
          <div style={{ display: 'flex' }}>
            {['RP','AS','VM','HJ','BD','+'].map((x, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: 999,
                marginLeft: i ? -8 : 0,
                background: x === '+' ? T.bg : ['#8B1A3B','#003F87','#1F5F3F','#003F87','#003F87'][i],
                color: x === '+' ? T.inkSoft : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, boxShadow: '0 0 0 2px #fff',
              }}>{x === '+' ? '+73' : x}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky RSVP CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 16px 28px',
        background: 'linear-gradient(to top, #fff 70%, rgba(255,255,255,0))',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.inkMute }}>Contribution</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp }}>₹2,500 / couple</div>
        </div>
        <button style={{
          background: T.brandBlue, color: '#fff', border: 'none',
          borderRadius: 14, padding: '14px 24px',
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
          boxShadow: `0 10px 22px ${T.brandBlue}40`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          RSVP Yes <Icon name="check" size={16} color="#fff" strokeWidth={3}/>
        </button>
      </div>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 10. CAUSES / SERVICE IMPACT
// ──────────────────────────────────────────────────────────────
const CausesScreen = () => (
  <Screen bg={T.bg}>
    {/* Header */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
      paddingTop: 8, paddingBottom: 70, paddingInline: 20, position: 'relative', overflow: 'hidden',
    }}>
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: 'absolute', top: -60, right: -60, opacity: 0.07 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1="120" y1="120" x2="120" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*25.7} 120 120)`}/>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icon name="chevL" size={22} color="#fff" strokeWidth={2}/>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, letterSpacing: 1.5 }}>WE SERVE</div>
        <Icon name="settings" size={20} color="#fff"/>
      </div>
      <div style={{ marginTop: 22 }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Total impact this year</div>
        <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, fontFamily: T.fontDsp, letterSpacing: -1, marginTop: 4 }}>
          ₹42.6L
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
          <span style={{ color: T.brandGold, fontSize: 11, fontWeight: 700 }}>↑ 28% vs last year</span>
        </div>
      </div>
    </div>

    {/* Causes grid */}
    <div style={{ paddingInline: 16, marginTop: -50 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {CAUSES.map(c => (
          <div key={c.id} style={{
            background: '#fff', borderRadius: 14, padding: 14,
            boxShadow: '0 4px 14px rgba(10,22,40,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: c.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>{c.icon}</div>
            <div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 600, marginTop: 10 }}>{c.name}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color, fontFamily: T.fontDsp, marginTop: 2, lineHeight: 1 }}>{c.units}</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 3 }}>{c.unitLabel}</div>
            {/* Progress bar */}
            <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: T.bg, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '72%', background: c.color, borderRadius: 2 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Upcoming service projects */}
    <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.3 }}>Active Projects</div>
      <div style={{ fontSize: 12, color: T.brandBlue, fontWeight: 600 }}>See all</div>
    </div>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { title: 'Vision First — Cataract Surgeries', partner: 'C.H. Nagri Eye Hospital', progress: 67, target: '500 surgeries', icon: '👁', color: T.brandBlue },
        { title: 'Sabarmati Green Belt', partner: 'AMC + Riverfront Authority', progress: 45, target: '2,000 saplings', icon: '🌳', color: T.success },
      ].map(p => (
        <div key={p.title} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: p.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>{p.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: T.fontDsp, lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>with {p.partner}</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
              <span style={{ color: T.inkSoft }}><b style={{ color: T.ink }}>{p.progress}%</b> · target {p.target}</span>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: T.bg, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: p.progress + '%', background: `linear-gradient(90deg, ${p.color}, ${shade(p.color, 18)})`, borderRadius: 3 }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex' }}>
                {['RP','AS','VM','+'].map((x, i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: 999,
                    marginLeft: i ? -6 : 0,
                    background: x === '+' ? T.bg : ['#8B1A3B','#003F87','#1F5F3F'][i],
                    color: x === '+' ? T.inkSoft : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700, boxShadow: '0 0 0 2px #fff',
                  }}>{x === '+' ? '+8' : x}</div>
                ))}
              </div>
              <button style={{
                background: 'transparent', color: p.color, border: `1.5px solid ${p.color}50`,
                borderRadius: 999, padding: '5px 12px',
                fontSize: 11, fontWeight: 700, fontFamily: T.font,
              }}>Log hours</button>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 100 }}/>
    <TabBar active="serve"/>
  </Screen>
);

Object.assign(window, { EventsScreen, EventDetailScreen, CausesScreen });
