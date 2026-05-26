// Lions Club — Additional screens
// Meeting Minutes · Awards Wall · Charter Night Invitation · Onboarding

const T = window.LC;
const { MEMBERS } = window.LCData;

// ──────────────────────────────────────────────────────────────
// 15. ONBOARDING — first-time user walkthrough (3 slides)
// Shown as a single artboard with all 3 panels side-by-side preview
// ──────────────────────────────────────────────────────────────
const OnboardingScreen = () => {
  return (
    <Screen bg="#fff" statusDark={true} scroll={false}>
      {/* Skip */}
      <div style={{ position: 'absolute', top: 14, right: 20, zIndex: 5, fontSize: 13, color: T.inkMute, fontWeight: 600 }}>Skip</div>

      {/* Illustration */}
      <div style={{ height: 420, background: T.bg, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative gold rays */}
        <svg width="500" height="500" viewBox="0 0 500 500" style={{ position: 'absolute', top: 40, left: '50%', marginLeft: -250, opacity: 0.10 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1="250" y1="250" x2="250" y2="40" stroke={T.brandGold} strokeWidth="4" transform={`rotate(${i*20} 250 250)`}/>
          ))}
        </svg>

        {/* Stack of fanned member cards */}
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', width: 280, height: 240 }}>
          {[
            { c: '#8B1A3B', initials: 'RP', name: 'Lion Rajesh Patel',  role: 'President',  rot: -10, off: -52, z: 1, scale: 0.92 },
            { c: '#003F87', initials: 'AS', name: 'Lion Anand Shah',     role: 'Secretary',  rot: 0,   off: 0,   z: 2, scale: 1 },
            { c: '#1F5F3F', initials: 'VM', name: 'Lion Vikram Mehta',   role: 'Treasurer',  rot: 10,  off: 52,  z: 1, scale: 0.92 },
          ].map((m, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, left: '50%',
              transform: `translateX(calc(-50% + ${m.off}px)) rotate(${m.rot}deg) scale(${m.scale})`,
              zIndex: m.z,
              width: 170, padding: 14,
              background: '#fff', borderRadius: 16,
              boxShadow: '0 18px 36px rgba(10,22,40,0.16)',
              border: `1px solid ${T.line}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={m.initials} size={42} color={m.c}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: T.brandBlue, fontWeight: 700, letterSpacing: 0.3, marginTop: 2 }}>{m.role.toUpperCase()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: T.bg }}/>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: T.bg }}/>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <div style={{ flex: 1, height: 22, borderRadius: 6, background: T.success + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="phone" size={11} color={T.success} strokeWidth={2.2}/>
                </div>
                <div style={{ flex: 1, height: 22, borderRadius: 6, background: '#25D36615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="wapp" size={11} color="#25D366" strokeWidth={2.2}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copy area */}
      <div style={{ padding: '36px 28px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.brandGold, fontSize: 10, fontWeight: 800, letterSpacing: 2, background: T.brandBlueDeep, padding: '4px 12px', borderRadius: 999 }}>
          ★ WE SERVE · STEP 1 / 3
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.5, marginTop: 16, lineHeight: 1.15 }}>
          Your club, always<br/>
          <span style={{ color: T.brandBlue }}>at your fingertips</span>
        </div>
        <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 14, lineHeight: 1.55, maxWidth: 320, margin: '14px auto 0' }}>
          Connect with all 142 fellow Lions. Call, WhatsApp or email any member with a single tap.
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
        <div style={{ width: 24, height: 6, borderRadius: 3, background: T.brandBlue }}/>
        <div style={{ width: 6,  height: 6, borderRadius: 3, background: T.line }}/>
        <div style={{ width: 6,  height: 6, borderRadius: 3, background: T.line }}/>
      </div>

      {/* CTA */}
      <div style={{ position: 'absolute', bottom: 36, left: 24, right: 24, display: 'flex', gap: 12 }}>
        <button style={{
          flex: 1, background: '#fff', color: T.inkSoft, border: `1.5px solid ${T.line}`,
          borderRadius: 14, padding: '15px 0',
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
        }}>Back</button>
        <button style={{
          flex: 2, background: T.brandBlue, color: '#fff', border: 'none',
          borderRadius: 14, padding: '15px 0',
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
          boxShadow: `0 10px 22px ${T.brandBlue}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Next <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
        </button>
      </div>
    </Screen>
  );
};

// Onboarding step 2 — Events
const OnboardingEventsScreen = () => (
  <Screen bg="#fff" statusDark={true} scroll={false}>
    <div style={{ position: 'absolute', top: 14, right: 20, zIndex: 5, fontSize: 13, color: T.inkMute, fontWeight: 600 }}>Skip</div>
    <div style={{ height: 420, background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <svg width="500" height="500" viewBox="0 0 500 500" style={{ position: 'absolute', top: 40, left: '50%', marginLeft: -250, opacity: 0.10 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={i} x1="250" y1="250" x2="250" y2="40" stroke={T.brandGold} strokeWidth="4" transform={`rotate(${i*20} 250 250)`}/>
        ))}
      </svg>

      {/* Big calendar mockup */}
      <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', width: 240,
        background: '#fff', borderRadius: 18, padding: 18,
        boxShadow: '0 20px 40px rgba(10,22,40,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp }}>June 2026</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Icon name="chevL" size={14} color={T.inkMute}/>
            <Icon name="chevR" size={14} color={T.ink}/>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 9, color: T.inkMute, textAlign: 'center', marginBottom: 4 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ fontWeight: 700, padding: 2 }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 10, color: T.ink, textAlign: 'center' }}>
          {Array.from({length: 30}, (_, i) => i + 1).map(d => {
            const hot = [14, 22].includes(d);
            const active = d === 14;
            return (
              <div key={d} style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 999, fontWeight: hot ? 700 : 500,
                background: active ? T.brandBlue : 'transparent',
                color: active ? '#fff' : hot ? T.danger : T.ink,
                position: 'relative',
              }}>{d}
                {hot && !active && <div style={{ position: 'absolute', bottom: 1, width: 3, height: 3, borderRadius: 2, background: T.danger }}/>}
              </div>
            );
          })}
        </div>
        {/* event pill */}
        <div style={{ marginTop: 10, background: T.brandBlue + '10', borderRadius: 8, padding: '8px 10px', borderLeft: `3px solid ${T.brandBlue}` }}>
          <div style={{ fontSize: 10, color: T.brandBlue, fontWeight: 700 }}>JUN 14 · 7:30 PM</div>
          <div style={{ fontSize: 11, color: T.ink, fontWeight: 700, marginTop: 1 }}>Charter Night 2026</div>
        </div>
      </div>
    </div>

    <div style={{ padding: '36px 28px 0', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.brandGold, fontSize: 10, fontWeight: 800, letterSpacing: 2, background: T.brandBlueDeep, padding: '4px 12px', borderRadius: 999 }}>
        ★ WE SERVE · STEP 2 / 3
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.5, marginTop: 16, lineHeight: 1.15 }}>
        Never miss an<br/>
        <span style={{ color: T.brandBlue }}>event again</span>
      </div>
      <div style={{ fontSize: 14, color: T.inkSoft, marginTop: 14, lineHeight: 1.55, maxWidth: 320, margin: '14px auto 0' }}>
        RSVP to fellowships, meetings and service drives. Get reminders the day before — and the morning of.
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
      <div style={{ width: 6,  height: 6, borderRadius: 3, background: T.line }}/>
      <div style={{ width: 24, height: 6, borderRadius: 3, background: T.brandBlue }}/>
      <div style={{ width: 6,  height: 6, borderRadius: 3, background: T.line }}/>
    </div>

    <div style={{ position: 'absolute', bottom: 36, left: 24, right: 24, display: 'flex', gap: 12 }}>
      <button style={{
        flex: 1, background: '#fff', color: T.inkSoft, border: `1.5px solid ${T.line}`,
        borderRadius: 14, padding: '15px 0', fontFamily: T.font, fontSize: 14, fontWeight: 700,
      }}>Back</button>
      <button style={{
        flex: 2, background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 0', fontFamily: T.font, fontSize: 14, fontWeight: 700,
        boxShadow: `0 10px 22px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Next <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
      </button>
    </div>
  </Screen>
);

// Onboarding step 3 — Permissions
const OnboardingPermissionsScreen = () => (
  <Screen bg="#fff" statusDark={true} scroll={false}>
    <div style={{ height: 320, background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`, position: 'relative', overflow: 'hidden' }}>
      <svg width="500" height="500" viewBox="0 0 500 500" style={{ position: 'absolute', top: -100, left: '50%', marginLeft: -250, opacity: 0.10 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={i} x1="250" y1="250" x2="250" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*18} 250 250)`}/>
        ))}
      </svg>

      {/* Big heart icon */}
      <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
        width: 130, height: 130, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)' }}>
        <Icon name="cause" size={64} color={T.brandGold} strokeWidth={2}/>
      </div>
    </div>

    <div style={{ padding: '32px 28px 0', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.brandGold, fontSize: 10, fontWeight: 800, letterSpacing: 2, background: T.brandBlueDeep, padding: '4px 12px', borderRadius: 999 }}>
        ★ WE SERVE · STEP 3 / 3
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.4, marginTop: 16, lineHeight: 1.15 }}>
        Track your service.<br/>See your impact.
      </div>
      <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 12, lineHeight: 1.55, maxWidth: 320, margin: '12px auto 0' }}>
        Allow notifications so we can remind you about service drives and birthdays.
      </div>
    </div>

    {/* Permissions list */}
    <div style={{ paddingInline: 24, marginTop: 22 }}>
      {[
        { icon: 'bell',   label: 'Push notifications', sub: 'Events, birthdays, club news', on: true },
        { icon: 'pin',    label: 'Location',           sub: 'Find members near you',         on: false },
        { icon: 'phone',  label: 'Contacts',           sub: 'Save Lions to your phonebook',  on: false },
      ].map((row, i, a) => (
        <div key={row.label} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 0',
          borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: T.brandBlue + '12',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={row.icon} size={18} color={T.brandBlue} strokeWidth={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{row.label}</div>
            <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>{row.sub}</div>
          </div>
          {/* iOS-style toggle */}
          <div style={{
            width: 42, height: 25, borderRadius: 999,
            background: row.on ? T.success : T.line,
            padding: 2, display: 'flex',
            justifyContent: row.on ? 'flex-end' : 'flex-start',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: 21, height: 21, borderRadius: 999, background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}/>
          </div>
        </div>
      ))}
    </div>

    <div style={{ position: 'absolute', bottom: 36, left: 24, right: 24 }}>
      <button style={{
        width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '16px 0', fontFamily: T.font, fontSize: 15, fontWeight: 700,
        boxShadow: `0 10px 22px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Enter the den <Icon name="paw" size={18} color="#fff" strokeWidth={2.2}/>
      </button>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: T.inkFaint }}>
        You can change these later in Settings
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 16. MEETING MINUTES
// ──────────────────────────────────────────────────────────────
const MeetingMinutesScreen = () => (
  <Screen bg={T.bg}>
    {/* Header */}
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="chevL" size={20} color={T.ink}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 19, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.3 }}>Meeting Minutes</div>
        <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>Stated meeting · June 02, 2026</div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="filter" size={17} color={T.ink}/>
      </div>
    </div>

    {/* Featured: latest minutes — full document card */}
    <div style={{ paddingInline: 16, marginTop: 10 }}>
      <div style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(10,22,40,0.06)',
      }}>
        {/* Document header strip */}
        <div style={{
          background: `linear-gradient(135deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
          padding: '14px 16px', color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: 'absolute', top: -50, right: -50, opacity: 0.10 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={i} x1="80" y1="80" x2="80" y2="10" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*36} 80 80)`}/>
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, color: T.brandGold, fontWeight: 700, letterSpacing: 1.5 }}>STATED MEETING #12 · FY 2025–26</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDsp, marginTop: 4, letterSpacing: -0.2 }}>Monthly Board Meeting</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="events" size={11} color="#fff" strokeWidth={2}/> Jun 02, 2026
                </span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="pin" size={11} color="#fff"/> Club House
                </span>
              </div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
              background: T.brandGold, color: T.brandBlueDeep,
              padding: '3px 8px', borderRadius: 999,
            }}>RATIFIED</span>
          </div>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {/* Attendance bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex' }}>
                {['RP','AS','VM','HJ','+'].map((x, i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: 999, marginLeft: i ? -6 : 0,
                    background: x === '+' ? T.bg : ['#8B1A3B','#003F87','#1F5F3F','#003F87'][i],
                    color: x === '+' ? T.inkSoft : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700, boxShadow: '0 0 0 2px #fff',
                  }}>{x === '+' ? '+9' : x}</div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.inkSoft }}><b style={{ color: T.ink }}>13 present</b> · 4 regrets</div>
            </div>
            <Icon name="check" size={14} color={T.success} strokeWidth={3}/>
          </div>

          {/* Agenda items */}
          <div style={{ fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>AGENDA · 7 ITEMS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '01', t: 'Treasurer\'s report — May 2026',   sub: '₹3.42L closing balance · presented by Lion Vikram Mehta', tag: 'Report' },
              { n: '02', t: 'Charter Night planning update',     sub: 'Venue confirmed at Hyatt · 78 RSVPs to date', tag: 'Action' },
              { n: '03', t: 'Vision First — Phase III budget',   sub: 'Approved ₹2.5L for next quarter of cataract surgeries', tag: 'Decision' },
              { n: '04', t: 'New member induction — 4 candidates',sub: 'Sponsored by Lions Kirit Amin, Meera Trivedi', tag: 'Decision' },
            ].map(item => (
              <div key={item.n} style={{
                display: 'flex', gap: 12, padding: '10px 0',
                borderTop: `1px solid ${T.line}`,
              }}>
                <div style={{
                  fontFamily: T.fontDsp, fontSize: 14, fontWeight: 800, color: T.brandBlue,
                  width: 28, textAlign: 'center', letterSpacing: -0.3,
                }}>{item.n}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, lineHeight: 1.3 }}>{item.t}</div>
                  <div style={{ fontSize: 10, color: T.inkMute, marginTop: 2, lineHeight: 1.4 }}>{item.sub}</div>
                </div>
                <div>
                  <span style={{
                    fontSize: 8, fontWeight: 800, letterSpacing: 0.6,
                    background: item.tag === 'Decision' ? T.success + '15' : item.tag === 'Action' ? T.warning + '15' : T.brandBlue + '12',
                    color:      item.tag === 'Decision' ? T.success         : item.tag === 'Action' ? T.warning         : T.brandBlue,
                    padding: '3px 6px', borderRadius: 4, textTransform: 'uppercase',
                  }}>{item.tag}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action footer */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button style={{
              flex: 1, background: T.brandBlue, color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 0',
              fontFamily: T.font, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <Icon name="book" size={13} color="#fff" strokeWidth={2}/> Read full
            </button>
            <button style={{
              background: '#fff', border: `1.5px solid ${T.line}`, color: T.ink,
              borderRadius: 10, padding: '10px 14px',
              fontFamily: T.font, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon name="arrow" size={13} color={T.ink} strokeWidth={2}/> PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Previous minutes list */}
    <div style={{ paddingInline: 20, paddingTop: 20, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.2 }}>Earlier this year</div>
      <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 600 }}>View all</div>
    </div>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { num: '#11', title: 'May 2026 stated meeting',         date: 'May 05, 2026', items: 6, status: 'ratified' },
        { num: '#10', title: 'April 2026 stated meeting',       date: 'Apr 07, 2026', items: 8, status: 'ratified' },
        { num: '—',   title: 'Special meeting — Charter night', date: 'Mar 18, 2026', items: 3, status: 'ratified' },
      ].map(m => (
        <div key={m.title} style={{
          background: '#fff', borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: T.brandBlue + '10',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="book" size={18} color={T.brandBlue} strokeWidth={1.8}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{m.title}</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 2 }}>{m.date} · {m.items} agenda items</div>
          </div>
          <Icon name="chevR" size={14} color={T.inkFaint}/>
        </div>
      ))}
    </div>
    <div style={{ height: 40 }}/>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 17. AWARDS WALL
// ──────────────────────────────────────────────────────────────
const AwardsWallScreen = () => (
  <Screen bg={T.bgWarm}>
    {/* Header hero */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
      paddingTop: 8, paddingBottom: 60, paddingInline: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <svg width="320" height="320" viewBox="0 0 320 320" style={{ position: 'absolute', top: -80, right: -100, opacity: 0.10 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={i} x1="160" y1="160" x2="160" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*20} 160 160)`}/>
        ))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="chevL" size={22} color="#fff" strokeWidth={2}/>
        <div style={{ flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>HALL OF HONOUR</div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 76, height: 76, borderRadius: 999,
          background: `radial-gradient(circle at 30% 30%, ${T.brandGold}, ${shade(T.brandGold, -30)})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 12px 24px ${T.brandGold}50`,
        }}>
          <Icon name="award" size={42} color={T.brandBlueDeep} strokeWidth={1.8} fill={T.brandBlueDeep}/>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp, letterSpacing: -0.4 }}>Awards & Honours</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Recognising service · 2025–26</div>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div style={{ paddingInline: 16, marginTop: -36 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 4, display: 'flex', gap: 4, boxShadow: '0 4px 14px rgba(10,22,40,0.08)' }}>
        {[
          { id: 'club', label: 'Club', active: true },
          { id: 'mem',  label: 'Members' },
          { id: 'dist', label: 'District' },
        ].map(t => (
          <div key={t.id} style={{
            flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 8,
            background: t.active ? T.brandBlue : 'transparent',
            color: t.active ? '#fff' : T.inkSoft,
            fontSize: 12, fontWeight: 700,
          }}>{t.label}</div>
        ))}
      </div>
    </div>

    {/* Featured club award — hero card */}
    <div style={{ paddingInline: 16, marginTop: 18 }}>
      <div style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(10,22,40,0.07)',
        border: `1.5px solid ${T.brandGold}`,
      }}>
        <div style={{
          padding: '16px 16px 14px', position: 'relative',
          background: `radial-gradient(circle at 100% 0%, ${T.brandGold}15 0%, transparent 50%)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 60, height: 60, flexShrink: 0,
              background: `linear-gradient(145deg, ${T.brandGold}, ${shade(T.brandGold, -25)})`,
              clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 16px ${T.brandGold}40`,
            }}>
              <div style={{ fontSize: 22, fontFamily: T.fontDsp, fontWeight: 800, color: T.brandBlueDeep, marginTop: -4 }}>★</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: T.danger, fontWeight: 800, letterSpacing: 1.2 }}>HIGHEST HONOUR · 2025–26</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, marginTop: 4, lineHeight: 1.2, letterSpacing: -0.2 }}>
                Presidential Medal of Excellence
              </div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
                Awarded by International President for outstanding service contribution exceeding ₹40 lakh across six causes.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${T.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="events" size={12} color={T.inkMute}/>
              <div style={{ fontSize: 11, color: T.inkMute }}>Presented Mar 14, 2026</div>
            </div>
            <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 700 }}>See certificate →</div>
          </div>
        </div>
      </div>
    </div>

    {/* Honour roll — member recognitions grid */}
    <div style={{ padding: '22px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.2 }}>This year's honourees</div>
      <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 600 }}>{`6 of 12 →`}</div>
    </div>

    <div style={{ paddingInline: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { m: MEMBERS[0], award: 'Progressive Melvin Jones', sub: 'PMJF · 3rd time',  color: T.brandGold,  icon: '★' },
        { m: MEMBERS[1], award: 'Lion of the Year',          sub: 'Club nomination',   color: T.brandBlue,  icon: '🏆' },
        { m: MEMBERS[3], award: 'Excellence in Service',     sub: 'Vision project',    color: T.success,    icon: '🎗' },
        { m: MEMBERS[6], award: 'Service Chair Award',       sub: '1,200+ hours',      color: T.danger,     icon: '⭐' },
      ].map((a, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 14, padding: 14, textAlign: 'center',
          boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* gold corner ribbon */}
          <div style={{
            position: 'absolute', top: 8, right: -22, transform: 'rotate(40deg)',
            background: a.color, padding: '2px 24px', fontSize: 8, color: '#fff',
            fontWeight: 800, letterSpacing: 1,
          }}>WIN</div>

          <div style={{
            width: 56, height: 56, margin: '4px auto 0',
            background: `radial-gradient(circle at 30% 30%, ${a.color}, ${shade(a.color, -25)})`,
            borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 24,
            boxShadow: `0 6px 14px ${a.color}40`,
          }}>{a.icon}</div>

          <div style={{ marginTop: 12 }}>
            <Avatar initials={a.m.initials} size={32} color={a.m.color}/>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 6, lineHeight: 1.2 }}>
            {a.m.name.replace('Lion ','').replace('Dr. ','Dr ')}
          </div>
          <div style={{ fontSize: 10, color: a.color, fontWeight: 700, marginTop: 4, lineHeight: 1.3, padding: '0 4px' }}>
            {a.award}
          </div>
          <div style={{ fontSize: 9, color: T.inkMute, marginTop: 2 }}>{a.sub}</div>
        </div>
      ))}
    </div>

    {/* Club achievements / banner awards */}
    <div style={{ padding: '22px 20px 12px', fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.2 }}>Banner awards</div>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 30 }}>
      {[
        { y: '2025', t: 'Cabinet Banner — Highest membership growth' },
        { y: '2024', t: 'District Recognition — Vision First Phase II' },
        { y: '2023', t: 'Centennial Service Banner' },
      ].map((b, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
        }}>
          <div style={{
            width: 44, height: 50,
            background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ color: T.brandGold, fontSize: 18, fontFamily: T.fontDsp, fontWeight: 800, marginTop: -4 }}>★</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.brandBlue, letterSpacing: 1 }}>{b.y}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginTop: 2, lineHeight: 1.3 }}>{b.t}</div>
          </div>
          <Icon name="chevR" size={14} color={T.inkFaint}/>
        </div>
      ))}
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 18. CHARTER NIGHT INVITATION (premium / digital invite)
// ──────────────────────────────────────────────────────────────
const CharterInviteScreen = () => (
  <Screen bg="#0A1628" statusDark={true}>
    {/* Full immersive dark invite */}
    <div style={{
      minHeight: '100%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(ellipse at 50% 0%, ${T.brandBlue} 0%, ${T.brandBlueDeep} 40%, #0A1628 90%)`,
    }}>
      {/* Decorative sun-rays at top */}
      <svg width="600" height="600" viewBox="0 0 600 600" style={{ position: 'absolute', top: -200, left: '50%', marginLeft: -300, opacity: 0.18, pointerEvents: 'none' }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <line key={i} x1="300" y1="300" x2="300" y2="20" stroke={T.brandGold} strokeWidth="2" transform={`rotate(${i*12.85} 300 300)`}/>
        ))}
      </svg>

      {/* Top bar (close + share) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px', position: 'relative', zIndex: 5 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <Icon name="close" size={18} color="#fff" strokeWidth={2}/>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <Icon name="arrow" size={16} color="#fff" strokeWidth={2}/>
        </div>
      </div>

      {/* Top emblem */}
      <div style={{ textAlign: 'center', marginTop: 28, position: 'relative' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 4px rgba(255,209,0,0.3), 0 12px 30px rgba(0,63,135,0.4)`,
        }}>
          <img src="assets/LionsClubLogo.png" width="60" height="60" style={{ objectFit: 'contain' }}/>
        </div>
      </div>

      {/* Curlicue divider */}
      <div style={{ textAlign: 'center', marginTop: 18, color: T.brandGold, fontSize: 18, letterSpacing: 10 }}>· · ·</div>

      <div style={{ textAlign: 'center', paddingInline: 28, marginTop: 14 }}>
        <div style={{ fontSize: 10, color: T.brandGold, fontWeight: 700, letterSpacing: 4 }}>YOU ARE CORDIALLY INVITED</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontFamily: T.fontDsp, marginTop: 10 }}>
          To celebrate
        </div>
        <div style={{
          fontSize: 42, color: '#fff', fontFamily: T.fontDsp, fontWeight: 800,
          lineHeight: 1, letterSpacing: -1.5, marginTop: 6,
        }}>
          Charter<br/>Night
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 12,
          color: T.brandGold,
        }}>
          <div style={{ width: 24, height: 1, background: T.brandGold }}/>
          <div style={{ fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>17<sup style={{ fontSize: 7 }}>TH</sup> INSTALLATION</div>
          <div style={{ width: 24, height: 1, background: T.brandGold }}/>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 14, fontStyle: 'italic' }}>
          of Lions Club Ahmedabad, District 323-H
        </div>
      </div>

      {/* Date / time tiles */}
      <div style={{ marginTop: 28, paddingInline: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'rgba(255,209,0,0.25)', borderRadius: 14, overflow: 'hidden' }}>
        {[
          { l: 'SATURDAY',  v: 'JUN 14',  s: '2026' },
          { l: 'EVENING',   v: '7:30',    s: 'PM IST' },
          { l: 'BLACK TIE', v: 'Hyatt',    s: 'Regency' },
        ].map((c, i) => (
          <div key={i} style={{
            background: '#0A1628',
            padding: '14px 6px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 8, color: T.brandGold, fontWeight: 700, letterSpacing: 1.5 }}>{c.l}</div>
            <div style={{ fontSize: 18, color: '#fff', fontFamily: T.fontDsp, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>{c.v}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 2, letterSpacing: 0.8 }}>{c.s}</div>
          </div>
        ))}
      </div>

      {/* Programme outline */}
      <div style={{ paddingInline: 28, marginTop: 28 }}>
        <div style={{ textAlign: 'center', fontSize: 9, color: T.brandGold, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>· PROGRAMME ·</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { t: '7:30 PM', e: 'Cocktails & Fellowship' },
            { t: '8:30 PM', e: 'Lions Pledge & Installation' },
            { t: '9:00 PM', e: 'Awards & Service Highlights' },
            { t: '9:45 PM', e: 'Dinner & Cultural Evening' },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 14, padding: '6px 0',
              borderBottom: i < 3 ? '1px dashed rgba(255,255,255,0.10)' : 'none',
            }}>
              <div style={{ fontFamily: T.fontDsp, fontSize: 13, color: T.brandGold, fontWeight: 700, minWidth: 60 }}>{p.t}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', fontFamily: T.fontDsp }}>{p.e}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Host signature */}
      <div style={{ textAlign: 'center', marginTop: 28, paddingInline: 28 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>With warm regards,</div>
        <div style={{ fontSize: 17, fontFamily: T.fontDsp, color: T.brandGold, fontWeight: 700, fontStyle: 'italic', marginTop: 6, letterSpacing: 0.3 }}>
          Lion Rajesh Patel
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginTop: 2 }}>PRESIDENT · 2025–26</div>
      </div>

      {/* RSVP card */}
      <div style={{ paddingInline: 20, marginTop: 30 }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,209,0,0.20)',
          borderRadius: 16, padding: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: T.brandGold, fontWeight: 700, letterSpacing: 1.5 }}>YOUR INVITATION</div>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, fontFamily: T.fontDsp, marginTop: 2 }}>Lion Rajesh & Mrs. Anita Patel</div>
            </div>
            <div style={{ fontSize: 9, color: '#fff', background: T.success, padding: '3px 8px', borderRadius: 4, fontWeight: 800, letterSpacing: 0.8 }}>RSVP'D</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, background: T.brandGold, color: T.brandBlueDeep, border: 'none',
              borderRadius: 10, padding: '11px 0',
              fontFamily: T.font, fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="qr" size={14} color={T.brandBlueDeep} strokeWidth={2}/> Show Pass
            </button>
            <button style={{
              flex: 1, background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '11px 0',
              fontFamily: T.font, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="events" size={13} color="#fff" strokeWidth={2}/> Add to Cal
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0 24px', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 }}>
        · WE SERVE ·
      </div>
    </div>
  </Screen>
);

Object.assign(window, {
  OnboardingScreen, OnboardingEventsScreen, OnboardingPermissionsScreen,
  MeetingMinutesScreen, AwardsWallScreen, CharterInviteScreen,
});
