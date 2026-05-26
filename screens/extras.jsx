// Lions Club — Extra screens
// Notifications · Side Menu · Find Member (advanced search) · Business Directory

const T = window.LC;
const { MEMBERS, NOTIFICATIONS } = window.LCData;

// ──────────────────────────────────────────────────────────────
// 11. NOTIFICATIONS
// ──────────────────────────────────────────────────────────────
const NotificationsScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
          <Icon name="chevL" size={20} color={T.ink}/>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.3 }}>Notifications</div>
      </div>
      <div style={{ fontSize: 12, color: T.brandBlue, fontWeight: 600 }}>Mark all read</div>
    </div>

    {/* Tabs */}
    <div style={{ paddingInline: 20, paddingTop: 8, display: 'flex', gap: 6 }}>
      {['All','Events','Service','Messages'].map((t, i) => (
        <div key={t} style={{
          padding: '6px 12px', borderRadius: 999,
          background: i === 0 ? T.brandBlue : '#fff',
          color: i === 0 ? '#fff' : T.inkSoft,
          fontSize: 12, fontWeight: 600,
          boxShadow: i === 0 ? 'none' : '0 1px 3px rgba(10,22,40,0.04)',
        }}>{t}</div>
      ))}
    </div>

    {/* Today */}
    <div style={{ paddingInline: 20, paddingTop: 18, paddingBottom: 6, fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2 }}>TODAY</div>
    <div style={{ background: '#fff', marginInline: 16, borderRadius: 14, overflow: 'hidden' }}>
      {NOTIFICATIONS.slice(0, 2).map((n, i, a) => (
        <div key={n.id} style={{
          padding: '14px', display: 'flex', gap: 12, alignItems: 'flex-start',
          borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
          background: n.unread ? T.brandBlue + '06' : '#fff',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: n.type === 'birthday' ? T.danger + '15' : T.brandBlue + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            flexShrink: 0,
          }}>{n.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: T.ink, fontWeight: n.unread ? 700 : 500, lineHeight: 1.4 }}>{n.title}</div>
            <div style={{ fontSize: 11, color: T.inkMute, marginTop: 3 }}>{n.ago} ago</div>
          </div>
          {n.unread && <div style={{ width: 8, height: 8, borderRadius: 4, background: T.brandBlue, marginTop: 8 }}/>}
        </div>
      ))}
    </div>

    {/* Earlier */}
    <div style={{ paddingInline: 20, paddingTop: 22, paddingBottom: 6, fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2 }}>EARLIER THIS WEEK</div>
    <div style={{ background: '#fff', marginInline: 16, borderRadius: 14, overflow: 'hidden' }}>
      {NOTIFICATIONS.slice(2).map((n, i, a) => (
        <div key={n.id} style={{
          padding: '14px', display: 'flex', gap: 12, alignItems: 'flex-start',
          borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: T.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            flexShrink: 0,
          }}>{n.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: T.ink, fontWeight: 500, lineHeight: 1.4 }}>{n.title}</div>
            <div style={{ fontSize: 11, color: T.inkMute, marginTop: 3 }}>{n.ago} ago</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 40 }}/>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 12. SIDE MENU (drawer)
// Shown overlaying the home screen
// ──────────────────────────────────────────────────────────────
const MenuScreen = () => {
  const me = MEMBERS[0];
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
      {/* Dimmed background hint */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}/>

      {/* Drawer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 304,
        background: '#fff',
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        <MiniStatus/>
        {/* Header */}
        <div style={{
          background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
          padding: '12px 18px 22px', color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', top: -40, right: -40, opacity: 0.08 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1="90" y1="90" x2="90" y2="10" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*30} 90 90)`}/>
            ))}
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar initials={me.initials} size={56} color={T.rolePresident} ring/>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: T.fontDsp, letterSpacing: -0.2 }}>{me.name}</div>
              <div style={{ fontSize: 10, color: T.brandGold, fontWeight: 700, letterSpacing: 0.8, marginTop: 2 }}>CLUB PRESIDENT · PMJF</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>LCA-2008-014 · 18 yrs</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button style={{
              flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10, color: '#fff', padding: '8px 0',
              fontSize: 11, fontWeight: 600, fontFamily: T.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <Icon name="qr" size={14} color="#fff"/> ID Card
            </button>
            <button style={{
              flex: 1, background: T.brandGold, border: 'none',
              borderRadius: 10, color: T.brandBlueDeep, padding: '8px 0',
              fontSize: 11, fontWeight: 700, fontFamily: T.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <Icon name="edit" size={14} color={T.brandBlueDeep}/> Edit
            </button>
          </div>
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 8px' }}>
          {[
            { icon: 'home',     label: 'Home',                 active: true },
            { icon: 'roster',   label: 'Member Roster',        count: 142 },
            { icon: 'search',   label: 'Find Member' },
            { icon: 'events',   label: 'Events',               count: 6 },
            { icon: 'cause',    label: 'Causes & Service' },
            { icon: 'briefcase',label: 'Business Directory' },
            { icon: 'book',     label: 'Meeting Minutes' },
            { icon: 'award',    label: 'Awards & Recognitions' },
            { icon: 'flag',     label: 'District News' },
            { icon: 'handshake',label: 'Refer a Lion' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10,
              background: row.active ? T.brandBlue + '10' : 'transparent',
              marginBottom: 2,
            }}>
              <Icon name={row.icon} size={18}
                color={row.active ? T.brandBlue : T.inkSoft}
                strokeWidth={row.active ? 2 : 1.7}/>
              <span style={{
                fontSize: 13, fontWeight: row.active ? 700 : 500,
                color: row.active ? T.brandBlue : T.ink, flex: 1,
              }}>{row.label}</span>
              {row.count && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: T.brandBlue + '15', color: T.brandBlue,
                  padding: '2px 7px', borderRadius: 999,
                }}>{row.count}</span>
              )}
            </div>
          ))}
          <div style={{ height: 1, background: T.line, margin: '14px 14px' }}/>
          {[
            { icon: 'settings', label: 'Settings' },
            { icon: 'mail',     label: 'Help & Support' },
            { icon: 'logout',   label: 'Sign out', danger: true },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10, marginBottom: 2,
            }}>
              <Icon name={row.icon} size={18} color={row.danger ? T.danger : T.inkSoft}/>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: row.danger ? T.danger : T.ink,
              }}>{row.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: T.inkMute, letterSpacing: 0.6, fontWeight: 600 }}>WE SERVE</div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>District 323-H · v1.0.0</div>
            </div>
            <LionsLogo size={32}/>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// 13. FIND MEMBER — advanced search with filters
// ──────────────────────────────────────────────────────────────
const FindMemberScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="chevL" size={20} color={T.ink}/>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="search" size={18} color={T.brandBlue} strokeWidth={2}/>
        <input readOnly value="cardio" style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontFamily: T.font, fontSize: 14, color: T.ink, fontWeight: 600,
        }}/>
        <Icon name="close" size={16} color={T.inkMute}/>
      </div>
    </div>

    {/* Filter chips */}
    <div style={{ paddingInline: 16, paddingTop: 10, display: 'flex', gap: 8, overflow: 'hidden' }}>
      <Chip active>Profession</Chip>
      <Chip>Area</Chip>
      <Chip>Year joined</Chip>
      <Chip>Role</Chip>
    </div>

    {/* Active filter pills */}
    <div style={{ paddingInline: 16, paddingTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <div style={{
        background: T.brandBlue, color: '#fff', padding: '5px 10px', borderRadius: 999,
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
      }}>
        Doctor <Icon name="close" size={11} color="#fff" strokeWidth={2.5}/>
      </div>
      <div style={{
        background: T.brandBlue, color: '#fff', padding: '5px 10px', borderRadius: 999,
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
      }}>
        Ahmedabad West <Icon name="close" size={11} color="#fff" strokeWidth={2.5}/>
      </div>
    </div>

    {/* Results header */}
    <div style={{ paddingInline: 20, paddingTop: 18, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 12, color: T.inkSoft }}><b style={{ color: T.ink }}>4 members</b> match your search</div>
      <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 600 }}>Sort: A–Z</div>
    </div>

    {/* Results */}
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {MEMBERS.filter(m => m.profession.toLowerCase().includes('doctor') || m.profession.toLowerCase().includes('phys') || m.profession.toLowerCase().includes('pedia') || m.profession.toLowerCase().includes('surge')).slice(0, 4).map(m => (
        <div key={m.id} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
        }}>
          <Avatar initials={m.initials} size={48} color={m.color}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{m.name}</span>
              {m.designation !== '—' && (
                <span style={{ fontSize: 9, color: T.brandGold, background: T.brandBlueDeep, padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5 }}>{m.designation}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: T.brandBlue, fontWeight: 600, marginTop: 2 }}>{m.profession}</div>
            <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={10} color={T.inkMute}/> {m.area}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: T.success + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="phone" size={15} color={T.success} strokeWidth={2}/>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: '#25D36612', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="wapp" size={15} color="#25D366" strokeWidth={2}/>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 40 }}/>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 14. BUSINESS DIRECTORY
// ──────────────────────────────────────────────────────────────
const BusinessDirectoryScreen = () => {
  const cats = [
    { icon: '⚕', name: 'Medical',      count: 18, color: T.danger },
    { icon: '⚖', name: 'Legal & CA',   count: 12, color: T.brandBlue },
    { icon: '🏗', name: 'Real Estate',  count: 9,  color: T.warning },
    { icon: '🎓', name: 'Education',    count: 7,  color: T.success },
    { icon: '💎', name: 'Retail',       count: 22, color: '#7A3FB8' },
    { icon: '🔧', name: 'Manufacturing',count: 15, color: T.inkSoft },
  ];
  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
            <Icon name="chevL" size={20} color={T.ink}/>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.3 }}>Business</div>
            <div style={{ fontSize: 11, color: T.inkMute, marginTop: 0 }}>Support fellow Lions</div>
          </div>
        </div>
        <Icon name="filter" size={20} color={T.ink}/>
      </div>

      {/* Banner */}
      <div style={{ paddingInline: 16, marginTop: 14 }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
          borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 999, background: 'rgba(255,209,0,0.08)' }}/>
          <div style={{ color: T.brandGold, fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>SHOP WITH LIONS</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: T.fontDsp, marginTop: 4, lineHeight: 1.3 }}>
            83 businesses run by<br/>fellow club members
          </div>
          <button style={{
            marginTop: 12, background: T.brandGold, border: 'none',
            color: T.brandBlueDeep, padding: '6px 14px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, fontFamily: T.font,
          }}>Browse all →</button>
        </div>
      </div>

      {/* Categories grid */}
      <div style={{ padding: '20px 20px 12px', fontSize: 11, fontWeight: 700, color: T.inkMute, letterSpacing: 1.2 }}>CATEGORIES</div>
      <div style={{ paddingInline: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {cats.map(c => (
          <div key={c.name} style={{
            background: '#fff', borderRadius: 14, padding: '14px 8px',
            textAlign: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.04)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, margin: '0 auto',
              background: c.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{c.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 8 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 2 }}>{c.count} businesses</div>
          </div>
        ))}
      </div>

      {/* Featured listings */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.3 }}>Featured</div>
        <div style={{ fontSize: 12, color: T.brandBlue, fontWeight: 600 }}>See all</div>
      </div>
      <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MEMBERS.slice(0, 3).map(m => (
          <div key={m.id} style={{
            background: '#fff', borderRadius: 14, padding: 14,
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 6px rgba(10,22,40,0.04)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="briefcase" size={22} color={m.color} strokeWidth={1.8}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{m.business}</div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>{m.profession} · {m.area}</div>
              <div style={{ fontSize: 10, color: T.brandBlue, marginTop: 4, fontWeight: 600 }}>by {m.name.replace('Lion ','')}</div>
            </div>
            <Icon name="chevR" size={16} color={T.inkFaint}/>
          </div>
        ))}
      </div>
      <div style={{ height: 40 }}/>
    </Screen>
  );
};

Object.assign(window, { NotificationsScreen, MenuScreen, FindMemberScreen, BusinessDirectoryScreen });
