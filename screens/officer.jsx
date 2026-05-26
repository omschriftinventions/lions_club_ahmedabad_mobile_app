// Lions Club — Officer / admin screens
// Add Member · Create Event · Attendance · Broadcast · Roster Admin

const T = window.LC;
const { MEMBERS } = window.LCData;

// Shared form field for officer screens
const FormField = ({ label, value, icon, required, multiline, dropdown, focus }) => (
  <div style={{ paddingBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.4, marginBottom: 6 }}>
      {label}{required && <span style={{ color: T.danger, marginLeft: 3 }}>*</span>}
    </div>
    <div style={{
      background: '#fff', borderRadius: 10,
      border: `1.5px solid ${focus ? T.brandBlue : T.line}`,
      padding: multiline ? '10px 12px' : '11px 12px',
      display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 10,
      minHeight: multiline ? 64 : 'auto',
    }}>
      {icon && <Icon name={icon} size={16} color={focus ? T.brandBlue : T.inkMute}/>}
      <input readOnly value={value} style={{
        flex: 1, border: 'none', outline: 'none', background: 'transparent',
        fontFamily: T.font, fontSize: 14, color: T.ink, fontWeight: 500,
      }}/>
      {dropdown && <Icon name="chevD" size={15} color={T.inkMute}/>}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// 31. ADD / INDUCT NEW MEMBER (officer)
// ──────────────────────────────────────────────────────────────
const AddMemberScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="close" size={22} color={T.ink}/>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDsp, color: T.ink }}>Induct New Lion</div>
          <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>Step 2 of 3 · Member details</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: T.brandBlue, fontWeight: 700 }}>Next</div>
    </div>

    {/* Progress */}
    <div style={{ padding: '14px 16px 6px', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1,2,3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: s <= 2 ? T.brandBlue : T.line,
          }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: T.inkMute }}>
        <span style={{ color: T.success, fontWeight: 700 }}>✓ Sponsor</span>
        <span style={{ color: T.brandBlue, fontWeight: 700 }}>Details</span>
        <span>Induction</span>
      </div>
    </div>

    {/* Photo */}
    <div style={{ background: '#fff', padding: '18px 0', textAlign: 'center', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'inline-block', position: 'relative' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 999,
          background: T.bg, border: `2px dashed ${T.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="profile" size={36} color={T.inkFaint} strokeWidth={1.5}/>
        </div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 28, height: 28, borderRadius: 999,
          background: T.brandBlue, border: '3px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="plus" size={13} color="#fff" strokeWidth={2.5}/>
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 600, marginTop: 10 }}>Add member photo</div>
    </div>

    <div style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>PERSONAL</div>
      <FormField label="FULL NAME" value="Lion Pratik Joshi" focus required icon="profile"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <FormField label="DATE OF BIRTH" value="Apr 22, 1978" icon="cake"/>
        <FormField label="ANNIVERSARY" value="Dec 14, 2005" icon="star"/>
      </div>
      <FormField label="SPOUSE" value="Mrs. Hetal Joshi"/>

      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, margin: '6px 0 10px' }}>CONTACT</div>
      <FormField label="MOBILE" value="+91 98253 67410" icon="phone" required/>
      <FormField label="EMAIL"  value="pratik.joshi@example.com" icon="mail" required/>

      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, margin: '6px 0 10px' }}>PROFESSIONAL</div>
      <FormField label="PROFESSION" value="Dentist" icon="briefcase" dropdown/>
      <FormField label="BUSINESS"   value="Joshi Dental Care"/>
      <FormField label="AREA"       value="Bopal" icon="pin" dropdown/>

      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, margin: '6px 0 10px' }}>CLUB</div>
      <FormField label="PROPOSED ROLE" value="Member" dropdown/>
      <FormField label="MEMBER ID"      value="LCA-2026-143 (auto)" sub="Auto-generated"/>

      <div style={{
        marginTop: 4, padding: 14, borderRadius: 12,
        background: T.brandGold + '15', border: `1px solid ${T.brandGold}40`,
        display: 'flex', gap: 10,
      }}>
        <Icon name="handshake" size={18} color={T.warning} strokeWidth={1.8}/>
        <div style={{ flex: 1, fontSize: 11, color: T.inkSoft, lineHeight: 1.5 }}>
          <b style={{ color: T.ink }}>Sponsor:</b> Lion Kirit Amin (Membership Chair) · Inducting at the next stated meeting on <b>Jul 02, 2026</b>.
        </div>
      </div>

      <button style={{
        width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 0', marginTop: 16, marginBottom: 24,
        fontFamily: T.font, fontSize: 14, fontWeight: 700,
        boxShadow: `0 10px 20px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Continue to induction <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
      </button>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 32. CREATE EVENT (officer)
// ──────────────────────────────────────────────────────────────
const CreateEventScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="close" size={22} color={T.ink}/>
        <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDsp, color: T.ink }}>New Event</div>
      </div>
      <div style={{ fontSize: 13, color: T.brandBlue, fontWeight: 700 }}>Publish</div>
    </div>

    {/* Cover image */}
    <div style={{ padding: 16 }}>
      <div style={{
        height: 130, borderRadius: 14, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px dashed ${T.brandBlue}`, color: '#fff',
      }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: 'absolute', top: -40, right: -40, opacity: 0.12 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1="100" y1="100" x2="100" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*25.7} 100 100)`}/>
          ))}
        </svg>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <Icon name="plus" size={26} color="#fff" strokeWidth={2}/>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>Add cover image</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Recommended 16:9</div>
        </div>
      </div>
    </div>

    {/* Event type */}
    <div style={{ paddingInline: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>EVENT TYPE</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { l: 'Signature', icon: '★', active: false, color: T.brandGold },
          { l: 'Service',   icon: '🌳', active: true,  color: T.success },
          { l: 'Meeting',   icon: '📋', active: false, color: T.brandBlue },
          { l: 'Fellowship',icon: '🎉', active: false, color: T.warning },
        ].map(t => (
          <div key={t.l} style={{
            padding: '7px 12px', borderRadius: 999,
            background: t.active ? t.color : '#fff',
            color: t.active ? '#fff' : T.inkSoft,
            border: t.active ? 'none' : `1px solid ${T.line}`,
            fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>{t.l}
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '16px 16px' }}>
      <FormField label="EVENT TITLE" value="Eye Camp — Free Cataract Screening" focus required/>
      <FormField label="DESCRIPTION" value="Free cataract screening in partnership with C.H. Nagri Eye Hospital. All members welcome to volunteer." multiline/>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <FormField label="DATE" value="Jun 22, 2026" icon="events" required/>
        <FormField label="TIME" value="9:00 AM"     icon="cake" required/>
      </div>

      <FormField label="VENUE" value="Civil Hospital, Asarwa" icon="pin" required/>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <FormField label="CAPACITY" value="40 Lions" icon="roster"/>
        <FormField label="CONTRIBUTION" value="₹0 (free)" icon="handshake"/>
      </div>

      {/* Toggle options */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '4px 14px' }}>
        {[
          { label: 'RSVP required', sub: 'Members must confirm attendance', on: true },
          { label: 'Spouses welcome', sub: 'Show "+1" option',  on: true },
          { label: 'Send push notification', sub: 'To all members on publish', on: true },
          { label: 'Pin to home screen', sub: 'Until event date', on: false },
        ].map((row, i, a) => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{row.label}</div>
              <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>{row.sub}</div>
            </div>
            <div style={{
              width: 42, height: 25, borderRadius: 999,
              background: row.on ? T.success : T.line,
              padding: 2, display: 'flex',
              justifyContent: row.on ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ width: 21, height: 21, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 18, marginBottom: 24 }}>
        <button style={{
          flex: 1, background: '#fff', color: T.inkSoft, border: `1.5px solid ${T.line}`,
          borderRadius: 14, padding: '14px 0',
          fontFamily: T.font, fontSize: 13, fontWeight: 700,
        }}>Save draft</button>
        <button style={{
          flex: 2, background: T.brandBlue, color: '#fff', border: 'none',
          borderRadius: 14, padding: '14px 0',
          fontFamily: T.font, fontSize: 13, fontWeight: 700,
          boxShadow: `0 10px 20px ${T.brandBlue}40`,
        }}>Publish & notify</button>
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 33. ATTENDANCE MARKING (officer)
// ──────────────────────────────────────────────────────────────
const AttendanceScreen = () => {
  const states = ['present','present','present','regret','present','present','absent','present','present','present','regret','present'];
  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderBottom: `1px solid ${T.line}` }}>
        <Icon name="chevL" size={20} color={T.ink} strokeWidth={2}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: T.fontDsp, color: T.ink }}>Attendance</div>
          <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>Stated meeting #13 · Jul 02, 2026</div>
        </div>
        <div style={{ fontSize: 13, color: T.brandBlue, fontWeight: 700 }}>Save</div>
      </div>

      {/* Summary */}
      <div style={{ background: '#fff', padding: '14px 16px', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { v: 142, l: 'Total',    c: T.ink },
            { v: 9,   l: 'Present',  c: T.success },
            { v: 2,   l: 'Regrets',  c: T.warning },
            { v: 1,   l: 'Absent',   c: T.danger },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '6px 0', background: T.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.inkMute, marginTop: 3, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* progress */}
        <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: T.bg, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: '75%', background: T.success }}/>
          <div style={{ width: '17%', background: T.warning }}/>
          <div style={{ width: '8%',  background: T.danger }}/>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, overflow: 'hidden' }}>
        <Chip active>All · 142</Chip>
        <Chip>To mark · 130</Chip>
        <Chip>Officers</Chip>
      </div>

      {/* List */}
      <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MEMBERS.map((m, i) => {
          const status = states[i % states.length];
          const statusColor = status === 'present' ? T.success : status === 'regret' ? T.warning : status === 'absent' ? T.danger : T.inkFaint;
          return (
            <div key={m.id} style={{
              background: '#fff', borderRadius: 12, padding: 10,
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
            }}>
              <Avatar initials={m.initials} size={36} color={m.color}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name.replace('Lion ','')}</div>
                {m.designation !== '—' ? (
                  <div style={{ fontSize: 9, color: T.brandBlue, fontWeight: 600, marginTop: 1 }}>{m.role}</div>
                ) : (
                  <div style={{ fontSize: 9, color: T.inkMute, marginTop: 1 }}>{m.profession}</div>
                )}
              </div>
              {/* 3-state pills */}
              <div style={{ display: 'flex', gap: 4 }}>
                {['present','regret','absent'].map(opt => {
                  const active = status === opt;
                  const c = opt === 'present' ? T.success : opt === 'regret' ? T.warning : T.danger;
                  const labels = { present: 'P', regret: 'R', absent: 'A' };
                  return (
                    <div key={opt} style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: active ? c : T.bg,
                      color: active ? '#fff' : T.inkMute,
                      fontSize: 11, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{labels[opt]}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 30 }}/>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 34. BROADCAST MESSAGE (officer pushes notification)
// ──────────────────────────────────────────────────────────────
const BroadcastScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="close" size={22} color={T.ink}/>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDsp, color: T.ink }}>New Broadcast</div>
          <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>President · Officer only</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: T.inkFaint, fontWeight: 700 }}>Send</div>
    </div>

    {/* Audience */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>SEND TO</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: 'roster',    label: 'All club members',        sub: '142 Lions',  active: true,  count: 142 },
          { icon: 'star',      label: 'Officers & chairs',        sub: '8 Lions',     count: 8 },
          { icon: 'cause',     label: 'Service project teams',    sub: '34 Lions',    count: 34 },
          { icon: 'briefcase', label: 'Custom segment…',          sub: 'Choose members' },
        ].map(opt => (
          <div key={opt.label} style={{
            background: '#fff', borderRadius: 12, padding: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            border: opt.active ? `1.5px solid ${T.brandBlue}` : `1.5px solid transparent`,
            boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: opt.active ? T.brandBlue : T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={opt.icon} size={17} color={opt.active ? '#fff' : T.inkSoft} strokeWidth={1.9}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>{opt.sub}</div>
            </div>
            <div style={{
              width: 20, height: 20, borderRadius: 999,
              border: `2px solid ${opt.active ? T.brandBlue : T.line}`,
              background: opt.active ? T.brandBlue : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {opt.active && <Icon name="check" size={11} color="#fff" strokeWidth={3.5}/>}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Message */}
    <div style={{ padding: '20px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>MESSAGE</div>
        <div style={{ fontSize: 10, color: T.inkMute }}>168 / 300</div>
      </div>
      <div style={{
        background: '#fff', borderRadius: 12,
        border: `1.5px solid ${T.brandBlue}`,
        padding: '12px 14px', minHeight: 110,
      }}>
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 600, lineHeight: 1.5 }}>
          🦁 Friends, our Charter Night is just 2 weeks away! RSVP deadline is Sunday. Black-tie, with spouses. The President & I look forward to seeing all of you.<span style={{ color: T.brandBlue }}>|</span>
        </div>
      </div>
    </div>

    {/* Channels */}
    <div style={{ padding: '20px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>SEND VIA</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '4px 14px' }}>
        {[
          { icon: 'bell',  label: 'Push notification',  on: true,  c: T.brandBlue },
          { icon: 'mail',  label: 'Email',               on: true,  c: T.danger },
          { icon: 'wapp',  label: 'WhatsApp',            on: false, c: '#25D366' },
          { icon: 'phone', label: 'SMS · ₹0.18/member',  on: false, c: T.warning },
        ].map((row, i, a) => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
          }}>
            <Icon name={row.icon} size={18} color={row.c} strokeWidth={1.9}/>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.ink }}>{row.label}</div>
            <div style={{
              width: 42, height: 25, borderRadius: 999,
              background: row.on ? row.c : T.line,
              padding: 2, display: 'flex',
              justifyContent: row.on ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ width: 21, height: 21, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Preview */}
    <div style={{ padding: '20px 16px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>PREVIEW (PUSH)</div>
      <div style={{
        background: T.ink, color: '#fff', borderRadius: 14, padding: 12,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="assets/LionsClubLogo.png" width="22" height="22"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>LIONS CLUB AHMEDABAD</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>now</div>
          </div>
          <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
            🦁 Friends, our Charter Night is just 2 weeks away! RSVP deadline is Sunday…
          </div>
        </div>
      </div>
    </div>

    <div style={{ padding: '20px 16px 28px' }}>
      <button style={{
        width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 0',
        fontFamily: T.font, fontSize: 14, fontWeight: 700,
        boxShadow: `0 10px 20px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Send to 142 Lions <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
      </button>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 35. ROSTER ADMIN (officer · bulk import / manage)
// ──────────────────────────────────────────────────────────────
const RosterAdminScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="chevL" size={20} color={T.ink}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.3 }}>Roster Admin</div>
        <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>Officer · Secretary view</div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: T.brandGold + '20', color: T.warning,
        padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      }}>
        <Icon name="award" size={11} color={T.warning} strokeWidth={2}/> OFFICER
      </div>
    </div>

    {/* Stats grid */}
    <div style={{ paddingInline: 16, paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      {[
        { v: '142', l: 'Active',     c: T.brandBlue },
        { v: '4',   l: 'Pending',    c: T.warning },
        { v: '2',   l: 'Inactive',   c: T.inkMute },
      ].map(s => (
        <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: '14px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, lineHeight: 1 }}>{s.v}</div>
          <div style={{ fontSize: 10, color: T.inkMute, marginTop: 5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* Quick actions */}
    <div style={{ padding: '18px 16px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>QUICK ACTIONS</div>
    <div style={{ paddingInline: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { icon: 'plus',      label: 'Induct new member', sub: 'Step-by-step',     c: T.brandBlue },
        { icon: 'book',      label: 'Import directory',  sub: '.xlsx or .csv',    c: T.success },
        { icon: 'arrow',     label: 'Export roster',     sub: 'PDF / Excel',      c: T.warning },
        { icon: 'star',      label: 'Update officers',   sub: 'For next term',    c: T.danger },
      ].map(a => (
        <div key={a.label} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: a.c + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={a.icon} size={18} color={a.c} strokeWidth={2}/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginTop: 10 }}>{a.label}</div>
          <div style={{ fontSize: 10, color: T.inkMute, marginTop: 2 }}>{a.sub}</div>
        </div>
      ))}
    </div>

    {/* Pending approvals */}
    <div style={{ padding: '20px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: T.fontDsp, letterSpacing: -0.2 }}>Pending approvals</div>
      <div style={{
        background: T.warning, color: '#fff', fontSize: 10, fontWeight: 800,
        padding: '2px 8px', borderRadius: 999, letterSpacing: 0.5,
      }}>4 NEW</div>
    </div>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { name: 'Lion Pratik Joshi',  type: 'New induction',    by: 'Sponsored by Kirit Amin',     icon: 'plus', c: T.brandBlue },
        { name: 'Lion Vikram Mehta',  type: 'Profile update',   by: '+91 99090 34999 (new phone)', icon: 'phone', c: T.success },
        { name: 'Lion Parul Bhatt',   type: 'Service hours',     by: '5.5 hrs · Vision First',       icon: 'cause', c: T.warning },
        { name: 'Lion Tejas Patel',   type: 'Business listing', by: 'Patel Jewels — update photos',icon: 'briefcase', c: T.danger },
      ].map((p, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 12, padding: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: p.c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={p.icon} size={17} color={p.c} strokeWidth={1.9}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{p.type}</div>
            <div style={{ fontSize: 11, color: T.brandBlue, fontWeight: 600, marginTop: 1 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>{p.by}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={14} color="#fff" strokeWidth={3}/>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={13} color={T.danger}/>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 30 }}/>
  </Screen>
);

Object.assign(window, {
  AddMemberScreen, CreateEventScreen, AttendanceScreen, BroadcastScreen, RosterAdminScreen,
});
