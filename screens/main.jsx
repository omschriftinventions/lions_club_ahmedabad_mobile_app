// Lions Club — Main app screens
// Home (dashboard) · Roster · Member Detail · My Profile

const T = window.LC;
const { MEMBERS, EVENTS, NEWS, CAUSES, NOTIFICATIONS } = window.LCData;

// Reusable: section header
const SectionHeader = ({ title, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 20px 12px' }}>
    <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.3 }}>{title}</div>
    {action && <div style={{ fontSize: 13, color: T.brandBlue, fontWeight: 600 }}>{action}</div>}
  </div>
);

// ──────────────────────────────────────────────────────────────
// 4. HOME / DASHBOARD
// ──────────────────────────────────────────────────────────────
const HomeScreen = () => (
  <Screen bg={T.bg} statusDark={false}>
    {/* Hero header */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep} 0%, ${T.brandBlue} 100%)`,
      paddingTop: 8, paddingBottom: 80, paddingInline: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative gold sun rays */}
      <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: 'absolute', top: -80, right: -80, opacity: 0.07 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="140" y1="140" x2="140" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*22.5} 140 140)`}/>
        ))}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="menu" size={22} color="#fff" strokeWidth={2}/>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, letterSpacing: 1.5 }}>DISTRICT 323-H</div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontDsp, marginTop: 1 }}>Ahmedabad Club</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="bell" size={22} color="#fff" strokeWidth={2}/>
            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, background: T.brandGold, boxShadow: `0 0 0 2px ${T.brandBlueDeep}` }}/>
          </div>
          <Avatar initials="RP" size={32} color={T.rolePresident}/>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>Good morning,</div>
        <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, fontFamily: T.fontDsp, letterSpacing: -0.4, marginTop: 2 }}>
          Lion Rajesh Patel
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
          background: 'rgba(255,209,0,0.18)', color: T.brandGold,
          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
          <Icon name="award" size={12} color={T.brandGold} strokeWidth={2}/> CLUB PRESIDENT · PMJF
        </div>
      </div>
    </div>

    {/* Service Impact card — pulled up over the hero */}
    <div style={{ paddingInline: 16, marginTop: -56 }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 16,
        boxShadow: '0 18px 40px rgba(10,22,40,0.10)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1 }}>OUR IMPACT · 2025–26</div>
            <div style={{ fontSize: 19, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 2 }}>₹42.6 lakh in service</div>
          </div>
          <Icon name="chevR" size={16} color={T.inkFaint}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { v: '3,420', l: 'screenings', c: T.brandBlue },
            { v: '12,800', l: 'meals', c: T.danger },
            { v: '1,180', l: 'trees', c: T.success },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Quick actions */}
    <div style={{ paddingInline: 16, marginTop: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { icon: 'roster',    label: 'Roster',    color: T.brandBlue },
          { icon: 'events',    label: 'Events',    color: T.danger },
          { icon: 'cause',     label: 'Causes',    color: T.success },
          { icon: 'qr',        label: 'ID Card',   color: T.warning },
        ].map(a => (
          <div key={a.label} style={{
            background: '#fff', borderRadius: 14, padding: '14px 6px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${a.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={a.icon} size={20} color={a.color} strokeWidth={2}/>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.inkSoft }}>{a.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Next Event card */}
    <SectionHeader title="Next Up" action="See all"/>
    <div style={{ paddingInline: 16 }}>
      <div style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(10,22,40,0.06)',
      }}>
        <div style={{ height: 100, background: `linear-gradient(135deg, ${T.brandBlue} 0%, ${T.brandBlueDeep} 100%)`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.18,
            backgroundImage: `radial-gradient(circle at 80% 30%, ${T.brandGold} 0%, transparent 40%)` }}/>
          <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '6px 10px', textAlign: 'center', minWidth: 52 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.danger, letterSpacing: 1 }}>JUN</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, lineHeight: 1 }}>14</div>
          </div>
          <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, color: T.brandGold, letterSpacing: 1, background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: 999 }}>
            ★ SIGNATURE
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, fontFamily: T.fontDsp, lineHeight: 1.3 }}>
            Charter Night 2026 — 17th Installation
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: T.inkSoft, fontSize: 12 }}>
            <Icon name="pin" size={13} color={T.inkMute}/> Hyatt Regency, Ashram Road · 7:30 PM
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
              {['#003F87','#8B1A3B','#1F5F3F'].map((c, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: 11, background: c,
                  marginLeft: i ? -6 : 0, boxShadow: '0 0 0 2px #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: '#fff', fontWeight: 700,
                }}/>
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, color: T.inkSoft }}><b>78 going</b></span>
            </div>
            <div style={{
              background: T.success + '15', color: T.success, padding: '5px 12px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="check" size={12} color={T.success} strokeWidth={3}/> Going
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Birthdays today */}
    <SectionHeader title="Today's Celebrations"/>
    <div style={{ paddingInline: 16, display: 'flex', gap: 10, overflow: 'hidden' }}>
      {[
        { name: 'Lion Vikram Mehta', sub: 'Birthday 🎂', initials: 'VM', color: T.success },
        { name: 'Lion Parul Bhatt',  sub: '8th Anniv. 💐', initials: 'PB', color: T.danger },
      ].map(b => (
        <div key={b.name} style={{
          background: '#fff', borderRadius: 14, padding: 12, flex: 1,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
        }}>
          <Avatar initials={b.initials} size={36} color={b.color}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
            <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>{b.sub}</div>
          </div>
        </div>
      ))}
    </div>

    {/* News */}
    <SectionHeader title="Club News" action="View all"/>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {NEWS.slice(0, 2).map(n => (
        <div key={n.id} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          display: 'flex', gap: 12, alignItems: 'flex-start',
          boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: `${T.brandGold}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="flag" size={22} color={T.brandBlue} strokeWidth={1.8}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.brandBlue, letterSpacing: 0.5, background: T.brandBlue + '15', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{n.tag}</span>
              <span style={{ fontSize: 11, color: T.inkFaint }}>· {n.ago} ago</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.3 }}>{n.title}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 100 }}/>
    <TabBar active="home"/>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 5. ROSTER
// Officers section + alphabetical list + sticky letter index
// ──────────────────────────────────────────────────────────────
const RosterScreen = () => {
  const officers = MEMBERS.filter(m => ['President','Secretary','Treasurer','1st Vice President','2nd Vice President'].includes(m.role));
  const sorted = [...MEMBERS].sort((a,b) => a.name.localeCompare(b.name));
  return (
    <Screen bg={T.bg}>
      {/* Header */}
      <div style={{ padding: '8px 20px 16px', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.4 }}>Roster</div>
            <div style={{ fontSize: 12, color: T.inkMute, marginTop: 2 }}><b style={{ color: T.ink }}>{MEMBERS.length}</b> active members</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 999, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="filter" size={18} color={T.ink}/>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 999, background: T.brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={20} color="#fff" strokeWidth={2}/>
            </div>
          </div>
        </div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.bg, borderRadius: 12, padding: '10px 14px' }}>
          <Icon name="search" size={18} color={T.inkMute}/>
          <input readOnly placeholder="Find by name, profession, area…" style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: T.font, fontSize: 14, color: T.ink,
          }}/>
        </div>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, overflow: 'hidden' }}>
          <Chip active>All</Chip>
          <Chip>Officers</Chip>
          <Chip>By Profession</Chip>
          <Chip>By Area</Chip>
        </div>
      </div>

      {/* Officers strip */}
      <div style={{ padding: '16px 0 4px' }}>
        <div style={{ paddingInline: 20, fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>OFFICE BEARERS</div>
        <div style={{ display: 'flex', gap: 14, paddingInline: 20, overflow: 'hidden' }}>
          {officers.slice(0,4).map(m => (
            <div key={m.id} style={{ textAlign: 'center', width: 76, flexShrink: 0 }}>
              <Avatar initials={m.initials} size={60} color={m.color} ring/>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 8, lineHeight: 1.2 }}>{m.name.replace('Lion ','').split(' ').slice(0,2).join(' ')}</div>
              <div style={{ fontSize: 9, color: T.brandBlue, fontWeight: 600, marginTop: 2, letterSpacing: 0.3 }}>{m.role.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* List header */}
      <div style={{ paddingInline: 20, paddingTop: 16, paddingBottom: 6, fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2 }}>
        ALL MEMBERS · A–Z
      </div>

      {/* Members list */}
      <div style={{ background: '#fff', marginTop: 4 }}>
        {sorted.slice(0, 7).map((m, i) => (
          <div key={m.id} style={{
            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: i < sorted.length-1 ? `1px solid ${T.line}` : 'none',
          }}>
            <Avatar initials={m.initials} size={44} color={m.color}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{m.name}</span>
                {m.designation !== '—' && (
                  <span style={{ fontSize: 9, color: T.brandGold, background: T.brandBlueDeep, padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5 }}>{m.designation}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.profession} · {m.area}
              </div>
              {['President','Secretary','Treasurer'].includes(m.role) && (
                <div style={{ marginTop: 5 }}><RoleBadge role={m.role}/></div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: T.success + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="phone" size={16} color={T.success} strokeWidth={2}/>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevR" size={16} color={T.inkMute}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky letter index */}
      <div style={{
        position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center',
        background: 'rgba(255,255,255,0.9)', padding: '6px 4px', borderRadius: 999,
      }}>
        {['A','B','C','D','H','J','K','M','N','P','R','S','T','V'].map(l => (
          <span key={l} style={{
            fontSize: 9, fontWeight: 700,
            color: l === 'A' ? T.brandBlue : T.inkFaint,
            padding: '1px 4px',
          }}>{l}</span>
        ))}
      </div>

      <div style={{ height: 100 }}/>
      <TabBar active="roster"/>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 6. MEMBER DETAIL
// ──────────────────────────────────────────────────────────────
const MemberDetailScreen = () => {
  const m = MEMBERS[1]; // Lion Anand Shah, Secretary
  return (
    <Screen bg={T.bg}>
      {/* Hero — full bleed colored top */}
      <div style={{
        background: `linear-gradient(160deg, ${T.brandBlueDeep} 0%, ${T.brandBlue} 100%)`,
        paddingBottom: 70, paddingTop: 8, position: 'relative', overflow: 'hidden',
      }}>
        {/* Top bar */}
        <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevL" size={20} color="#fff" strokeWidth={2}/>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="star" size={18} color="#fff"/>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="settings" size={18} color="#fff"/>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 14 }}>
          <Avatar initials={m.initials} size={110} color={m.color} ring/>
          <div style={{ marginTop: 14, color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, letterSpacing: -0.3 }}>{m.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.brandBlueDeep,
              background: T.brandGold, padding: '3px 10px', borderRadius: 999,
            }}>CLUB SECRETARY</span>
            <span style={{ fontSize: 11, color: T.brandGold, fontWeight: 700 }}>MJF</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 8, letterSpacing: 0.3 }}>
            Member since 2011 · 15 years of service
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ paddingInline: 16, marginTop: -42 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '14px 10px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 18px 40px rgba(10,22,40,0.10)' }}>
          {[
            { icon: 'phone', label: 'Call',     color: T.success },
            { icon: 'wapp',  label: 'WhatsApp', color: '#25D366' },
            { icon: 'mail',  label: 'Email',    color: T.brandBlue },
            { icon: 'pin',   label: 'Locate',   color: T.danger },
          ].map(a => (
            <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 999,
                background: `${a.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={a.icon} size={20} color={a.color} strokeWidth={2}/>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.inkSoft }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Details list */}
      <div style={{ paddingInline: 16, marginTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8, paddingInline: 4 }}>CONTACT</div>
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
          {[
            { icon: 'phone', label: 'Mobile',  value: m.phone, color: T.success },
            { icon: 'mail',  label: 'Email',   value: m.email, color: T.brandBlue },
            { icon: 'pin',   label: 'Area',    value: m.area + ', Ahmedabad', color: T.danger },
          ].map((row, i) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
              borderBottom: i < 2 ? `1px solid ${T.line}` : 'none',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: row.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.icon} size={17} color={row.color} strokeWidth={2}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: T.inkMute }}>{row.label}</div>
                <div style={{ fontSize: 14, color: T.ink, fontWeight: 600, marginTop: 1 }}>{row.value}</div>
              </div>
              <Icon name="chevR" size={16} color={T.inkFaint}/>
            </div>
          ))}
        </div>
      </div>

      {/* Profession */}
      <div style={{ paddingInline: 16, marginTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8, paddingInline: 4 }}>PROFESSION & BUSINESS</div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: T.brandBlue + '10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="briefcase" size={22} color={T.brandBlue} strokeWidth={1.8}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{m.business}</div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{m.profession}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 10, color: T.brandBlue, background: T.brandBlue + '12', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>Textile</span>
              <span style={{ fontSize: 10, color: T.brandBlue, background: T.brandBlue + '12', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div style={{ paddingInline: 16, marginTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8, paddingInline: 4 }}>PERSONAL</div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: T.inkMute }}>Birthday</div>
            <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 2 }}>🎂 {m.dob}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.inkMute }}>Anniversary</div>
            <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 2 }}>💐 {m.anniv}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.inkMute }}>Spouse</div>
            <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 2 }}>{m.spouse}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.inkMute }}>Joined</div>
            <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 2 }}>{m.joined}</div>
          </div>
        </div>
      </div>
      <div style={{ height: 40 }}/>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 7. MY PROFILE
// ──────────────────────────────────────────────────────────────
const ProfileScreen = () => {
  const me = MEMBERS[0]; // Rajesh Patel
  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.4 }}>My Profile</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
            <Icon name="edit" size={17} color={T.brandBlue}/>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
            <Icon name="settings" size={17} color={T.ink}/>
          </div>
        </div>
      </div>

      {/* Identity card — gold-bordered like a real member card */}
      <div style={{ paddingInline: 16, marginTop: 8 }}>
        <div style={{
          borderRadius: 18, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
          padding: '18px 18px 16px',
          boxShadow: '0 14px 28px rgba(0,63,135,0.25)',
        }}>
          {/* Gold ribbon at top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: T.brandGold }}/>
          {/* Decorative rays */}
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: 'absolute', top: -70, right: -70, opacity: 0.1 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1="100" y1="100" x2="100" y2="10" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*30} 100 100)`}/>
            ))}
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar initials={me.initials} size={68} color={T.rolePresident} ring/>
              <div>
                <div style={{ color: T.brandGold, fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>MEMBER ID · LCA-2008-014</div>
                <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, fontFamily: T.fontDsp, letterSpacing: -0.2, marginTop: 4 }}>{me.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 }}>President · PMJF · Since 2008</div>
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="qr" size={28} color={T.brandBlueDeep} strokeWidth={2}/>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>CLUB</div>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, marginTop: 2 }}>Ahmedabad</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>DISTRICT</div>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, marginTop: 2 }}>323-H</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>VALID THRU</div>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, marginTop: 2 }}>Jun 2027</div>
            </div>
          </div>
        </div>
      </div>

      {/* My stats */}
      <div style={{ paddingInline: 16, marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { v: '142', l: 'Service hrs', c: T.brandBlue },
          { v: '38',  l: 'Events',      c: T.success },
          { v: '18',  l: 'Years',       c: T.warning },
        ].map(s => (
          <div key={s.l} style={{ background: '#fff', borderRadius: 14, padding: '12px 0', textAlign: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.04)' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Menu list */}
      <div style={{ paddingInline: 16, marginTop: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
          {[
            { icon: 'edit',      label: 'Edit profile details',     sub: 'Phone, email, business info' },
            { icon: 'briefcase', label: 'My business listing',      sub: 'Patel & Associates · CA' },
            { icon: 'cause',     label: 'My service projects',      sub: '7 active · 142 hrs logged' },
            { icon: 'events',    label: 'Events attended',          sub: '38 of 52 this year' },
            { icon: 'award',     label: 'Awards & recognitions',    sub: 'PMJF · 3 District awards' },
            { icon: 'bell',      label: 'Notifications',            sub: 'Manage preferences' },
            { icon: 'settings',  label: 'App settings',             sub: 'Language, theme, privacy' },
          ].map((row, i, a) => (
            <div key={row.label} style={{
              padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.icon} size={17} color={T.brandBlue} strokeWidth={1.9}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{row.label}</div>
                <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>{row.sub}</div>
              </div>
              <Icon name="chevR" size={16} color={T.inkFaint}/>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div style={{ paddingInline: 16, marginTop: 16, marginBottom: 100 }}>
        <div style={{
          background: '#fff', borderRadius: 14, padding: '14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: T.danger + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="logout" size={17} color={T.danger} strokeWidth={1.9}/>
          </div>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.danger }}>Sign out</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, color: T.inkFaint, fontSize: 11 }}>
          Lions Club Ahmedabad · v1.0.0
        </div>
      </div>
      <TabBar active="profile"/>
    </Screen>
  );
};

Object.assign(window, { HomeScreen, RosterScreen, MemberDetailScreen, ProfileScreen });
