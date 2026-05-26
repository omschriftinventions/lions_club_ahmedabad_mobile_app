// Lions Club — Info & community screens
// About / Mission · Help & FAQ · Refer-a-Lion · District News

const T = window.LC;
const { MEMBERS } = window.LCData;

// ──────────────────────────────────────────────────────────────
// 36. ABOUT / MISSION
// ──────────────────────────────────────────────────────────────
const AboutScreen = () => (
  <Screen bg={T.bgWarm}>
    {/* Hero */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
      paddingBottom: 60, paddingTop: 8, paddingInline: 16, position: 'relative', overflow: 'hidden',
    }}>
      <svg width="400" height="400" viewBox="0 0 400 400" style={{ position: 'absolute', top: -80, right: -80, opacity: 0.10 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="200" y1="200" x2="200" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*15} 200 200)`}/>
        ))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="chevL" size={22} color="#fff" strokeWidth={2}/>
        <div style={{ flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>ABOUT THE CLUB</div>
      </div>
      <div style={{ marginTop: 26, textAlign: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', background: '#fff', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 14px 26px rgba(0,0,0,0.3)',
        }}>
          <img src="assets/LionsClubLogo.png" width="72" height="72" style={{ objectFit: 'contain' }}/>
        </div>
        <div style={{
          fontSize: 11, color: T.brandGold, fontWeight: 800, letterSpacing: 3, marginTop: 18,
        }}>· EST. 2009 ·</div>
        <div style={{
          fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp,
          marginTop: 8, letterSpacing: -0.4, lineHeight: 1.1,
        }}>
          Lions Club<br/>Ahmedabad
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8, fontStyle: 'italic', fontFamily: T.fontDsp }}>
          District 323-H · Multiple District 323 · India
        </div>
      </div>
    </div>

    {/* Motto card */}
    <div style={{ paddingInline: 16, marginTop: -40 }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 22,
        textAlign: 'center', boxShadow: '0 14px 30px rgba(10,22,40,0.10)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: T.brandGold, color: T.brandBlueDeep,
          padding: '6px 16px', borderRadius: 999,
          fontSize: 10, fontWeight: 800, letterSpacing: 2,
        }}>OUR MOTTO</div>
        <div style={{
          fontSize: 38, fontWeight: 800, fontFamily: T.fontDsp,
          color: T.brandBlue, letterSpacing: -1, marginTop: 6,
        }}>"We Serve."</div>
        <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          Two words that have guided over <b style={{ color: T.ink }}>1.4 million Lions</b> in 200+ countries since 1917.
        </div>
      </div>
    </div>

    {/* Stats */}
    <div style={{ paddingInline: 16, marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {[
        { v: '17',   l: 'years strong',  c: T.brandBlue },
        { v: '142',  l: 'active Lions',  c: T.danger },
        { v: '₹3Cr+',l: 'total impact',  c: T.success },
      ].map(s => (
        <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: '14px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: T.fontDsp, lineHeight: 1, letterSpacing: -0.5 }}>{s.v}</div>
          <div style={{ fontSize: 10, color: T.inkMute, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* Mission */}
    <div style={{ paddingInline: 20, marginTop: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>OUR MISSION</div>
      <div style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.6 }}>
        To empower volunteers to serve their communities, meet humanitarian needs, encourage peace, and promote international understanding through Lions clubs.
      </div>
    </div>

    {/* Pledge */}
    <div style={{ paddingInline: 16, marginTop: 22 }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 18,
        border: `1.5px solid ${T.brandGold}40`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 12, right: 14, opacity: 0.10 }}>
          <Icon name="paw" size={64} color={T.brandBlue}/>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.brandBlue, letterSpacing: 2 }}>· THE LIONS PLEDGE ·</div>
        <div style={{ fontSize: 14, color: T.ink, marginTop: 12, fontFamily: T.fontDsp, fontStyle: 'italic', lineHeight: 1.55, fontWeight: 600 }}>
          "Liberty, Intelligence, Our Nation's Safety"
        </div>
        <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
          A pledge to serve our community, our country and humanity — adopted at the founding convention in 1917.
        </div>
      </div>
    </div>

    {/* Code of Ethics — list */}
    <div style={{ paddingInline: 20, marginTop: 22, paddingBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>CODE OF ETHICS</div>
    </div>
    <div style={{ paddingInline: 16, paddingBottom: 30 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '4px 16px' }}>
        {[
          'To show my faith in the worthiness of my vocation',
          'To seek success and to demand all fair remuneration',
          'To remember that in building up my business it is not necessary to tear down another\'s',
          'To always bear in mind my obligations as a citizen',
          'To aid others by giving sympathy and friendship',
        ].map((line, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '12px 0',
            borderBottom: i < 4 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 999,
              background: T.brandBlue, color: '#fff',
              fontSize: 11, fontWeight: 800, fontFamily: T.fontDsp,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{i+1}</div>
            <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.5, paddingTop: 2 }}>{line}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Office bearers */}
    <div style={{ paddingInline: 20, fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 8 }}>2025–26 BOARD</div>
    <div style={{ paddingInline: 16, paddingBottom: 30 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '4px 14px' }}>
        {MEMBERS.slice(0, 5).map((m, i, a) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: i < a.length-1 ? `1px solid ${T.line}` : 'none',
          }}>
            <Avatar initials={m.initials} size={36} color={m.color}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{m.name.replace('Lion ','')}</div>
              <div style={{ fontSize: 10, color: T.brandBlue, fontWeight: 700, marginTop: 1, letterSpacing: 0.4, textTransform: 'uppercase' }}>{m.role}</div>
            </div>
            <Icon name="chevR" size={14} color={T.inkFaint}/>
          </div>
        ))}
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 37. HELP & FAQ
// ──────────────────────────────────────────────────────────────
const HelpFAQScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="chevL" size={20} color={T.ink}/>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.3 }}>Help</div>
    </div>

    {/* Hero search */}
    <div style={{ paddingInline: 16, paddingTop: 8 }}>
      <div style={{
        background: `linear-gradient(135deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
        borderRadius: 16, padding: '20px 18px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', top: -40, right: -40, opacity: 0.10 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1="110" y1="110" x2="110" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*25.7} 110 110)`}/>
          ))}
        </svg>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: T.fontDsp, letterSpacing: -0.3 }}>How can we help, Lion?</div>
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '11px 14px', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="search" size={17} color={T.brandBlue}/>
          <input readOnly placeholder="Search help articles…" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: T.font, fontSize: 13, color: T.ink,
          }}/>
        </div>
      </div>
    </div>

    {/* Topic grid */}
    <div style={{ padding: '20px 16px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>BROWSE TOPICS</div>
    <div style={{ paddingInline: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { icon: 'profile',   l: 'Account & login',     n: 8,  c: T.brandBlue },
        { icon: 'roster',    l: 'Roster & members',    n: 12, c: T.success },
        { icon: 'events',    l: 'Events & RSVPs',      n: 9,  c: T.warning },
        { icon: 'cause',     l: 'Service hours',        n: 6,  c: T.danger },
        { icon: 'qr',        l: 'Member ID & card',     n: 4,  c: '#7A3FB8' },
        { icon: 'settings',  l: 'App settings',         n: 7,  c: T.inkSoft },
      ].map(t => (
        <div key={t.l} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: t.c + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={t.icon} size={18} color={t.c} strokeWidth={1.9}/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginTop: 10 }}>{t.l}</div>
          <div style={{ fontSize: 10, color: T.inkMute, marginTop: 2 }}>{t.n} articles</div>
        </div>
      ))}
    </div>

    {/* Popular questions accordion */}
    <div style={{ padding: '22px 20px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>POPULAR QUESTIONS</div>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { q: 'How do I log service hours?',         open: true,
          a: 'Tap the Serve tab, choose a project, then "Log my hours". Hours over 6 need officer approval.' },
        { q: 'How do I update my profile photo?' },
        { q: 'Why didn\'t I get the OTP?' },
        { q: 'Can I add my spouse to my profile?' },
        { q: 'How do I RSVP for an event?' },
      ].map((f, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 12,
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
          border: f.open ? `1.5px solid ${T.brandBlue}` : `1.5px solid transparent`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: f.open ? 700 : 600, color: T.ink }}>{f.q}</div>
            <div style={{
              width: 26, height: 26, borderRadius: 999,
              background: f.open ? T.brandBlue : T.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={f.open ? 'close' : 'plus'} size={13} color={f.open ? '#fff' : T.inkSoft} strokeWidth={2.5}/>
            </div>
          </div>
          {f.open && f.a && (
            <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.55, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
              {f.a}
              <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: T.inkMute }}>Was this helpful?</span>
                <span style={{ fontSize: 12, color: T.success }}>👍</span>
                <span style={{ fontSize: 12, color: T.inkMute }}>👎</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Contact card */}
    <div style={{ padding: '22px 16px 30px' }}>
      <div style={{
        background: T.brandGold + '15', border: `1px solid ${T.brandGold}40`,
        borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Avatar initials="AS" size={48} color={T.brandBlue}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: T.warning, fontWeight: 700, letterSpacing: 0.5 }}>STILL STUCK?</div>
          <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 2 }}>Contact your Secretary</div>
          <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 1 }}>Lion Anand Shah · +91 98980 23456</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="wapp" size={17} color="#fff" strokeWidth={2}/>
        </div>
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 38. REFER A LION
// ──────────────────────────────────────────────────────────────
const ReferLionScreen = () => (
  <Screen bg={T.bgWarm}>
    {/* Hero */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue} 70%)`,
      paddingTop: 8, paddingBottom: 80, paddingInline: 20, position: 'relative', overflow: 'hidden',
    }}>
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', top: -60, right: -60, opacity: 0.10 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="150" y1="150" x2="150" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*22.5} 150 150)`}/>
        ))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="chevL" size={22} color="#fff" strokeWidth={2}/>
        <div style={{ flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>GROW THE PRIDE</div>
      </div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 11, color: T.brandGold, fontWeight: 800, letterSpacing: 2 }}>REFER A LION</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp, marginTop: 8, letterSpacing: -0.5, lineHeight: 1.1 }}>
          Know someone who'd<br/>love to serve?
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 10, lineHeight: 1.55 }}>
          Recommend them for membership. Sponsors who bring 3+ new Lions earn the <b style={{ color: T.brandGold }}>Membership Key</b> award.
        </div>
      </div>
    </div>

    {/* Your stats card */}
    <div style={{ paddingInline: 16, marginTop: -50 }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 16,
        boxShadow: '0 14px 30px rgba(10,22,40,0.10)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 700, letterSpacing: 1 }}>YOUR SPONSORSHIP</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 2 }}>2 of 3 referred</div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: `radial-gradient(circle, ${T.brandGold}, ${shade(T.brandGold, -25)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, color: T.brandBlueDeep }}>🔑</span>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: T.bg, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '67%', background: `linear-gradient(90deg, ${T.brandBlue}, ${T.brandGold})`, borderRadius: 4 }}/>
        </div>
        <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 8 }}>
          One more referral until you earn the <b style={{ color: T.warning }}>Membership Key</b>
        </div>
      </div>
    </div>

    {/* Form */}
    <div style={{ paddingInline: 16, marginTop: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>WHO ARE YOU REFERRING?</div>
      <FormField label="FULL NAME"   value="Mr. Karan Suri"        focus icon="profile"/>
      <FormField label="MOBILE"      value="+91 98255 11234"        icon="phone"/>
      <FormField label="EMAIL"       value="karan.suri@example.com" icon="mail"/>
      <FormField label="PROFESSION"  value="Investment Advisor"     icon="briefcase" dropdown/>

      <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, margin: '6px 0 8px' }}>YOUR RELATIONSHIP</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {['Family','Friend','Colleague','Neighbour','Business','Other'].map((r, i) => (
          <div key={r} style={{
            padding: '7px 12px', borderRadius: 999,
            background: i === 2 ? T.brandBlue : '#fff',
            color: i === 2 ? '#fff' : T.inkSoft,
            border: i === 2 ? 'none' : `1px solid ${T.line}`,
            fontSize: 12, fontWeight: 600,
          }}>{r}</div>
        ))}
      </div>

      <FormField label="WHY THEY'D BE A GREAT LION" value="Karan has been volunteering with my eye camps for 2 years. Deeply committed to service." multiline/>
    </div>

    {/* Share invite block */}
    <div style={{ paddingInline: 16, marginTop: 8 }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 14,
        boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, fontFamily: T.fontDsp }}>Send them an invite</div>
        <div style={{ fontSize: 11, color: T.inkMute, marginTop: 4 }}>Pre-filled message they can review before applying.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[
            { icon: 'wapp',  l: 'WhatsApp', c: '#25D366' },
            { icon: 'mail',  l: 'Email',    c: T.danger },
            { icon: 'phone', l: 'SMS',      c: T.brandBlue },
            { icon: 'arrow', l: 'Copy link',c: T.inkSoft },
          ].map(s => (
            <div key={s.l} style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              background: s.c + '12',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            }}>
              <Icon name={s.icon} size={17} color={s.c} strokeWidth={2}/>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.c }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Submit */}
    <div style={{ paddingInline: 16, marginTop: 16, paddingBottom: 28 }}>
      <button style={{
        width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 0',
        fontFamily: T.font, fontSize: 14, fontWeight: 700,
        boxShadow: `0 10px 20px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Submit referral <Icon name="paw" size={16} color="#fff" strokeWidth={2.2}/>
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, color: T.inkFaint, marginTop: 12 }}>
        Membership Chair will reach out within 48 hours
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 39. DISTRICT NEWS FEED
// ──────────────────────────────────────────────────────────────
const DistrictNewsScreen = () => (
  <Screen bg={T.bg}>
    {/* Header */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
      paddingTop: 8, paddingBottom: 30, paddingInline: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: 'absolute', top: -60, right: -60, opacity: 0.10 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1="120" y1="120" x2="120" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i*25.7} 120 120)`}/>
        ))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="chevL" size={22} color="#fff" strokeWidth={2}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: T.fontDsp, letterSpacing: -0.3 }}>District News</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>District 323-H · Gujarat</div>
        </div>
        <Icon name="bell" size={22} color="#fff"/>
      </div>
    </div>

    {/* Tabs */}
    <div style={{ paddingInline: 16, marginTop: -16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 4, display: 'flex', gap: 4, boxShadow: '0 4px 14px rgba(10,22,40,0.08)' }}>
        {[
          { id: 'all', l: 'All',         active: true },
          { id: 'dg',  l: 'DG Updates' },
          { id: 'mul', l: 'Multi District' },
          { id: 'intl',l: 'International' },
        ].map(t => (
          <div key={t.id} style={{
            flex: 1, padding: '8px 0', textAlign: 'center', borderRadius: 8,
            background: t.active ? T.brandBlue : 'transparent',
            color: t.active ? '#fff' : T.inkSoft,
            fontSize: 11, fontWeight: 700,
          }}>{t.l}</div>
        ))}
      </div>
    </div>

    {/* Featured story */}
    <div style={{ paddingInline: 16, marginTop: 16 }}>
      <div style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(10,22,40,0.06)',
      }}>
        <div style={{
          height: 140, position: 'relative',
          background: `linear-gradient(135deg, ${T.brandBlueDeep}, ${T.brandBlue})`,
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.20, fontSize: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
          <span style={{
            position: 'absolute', top: 12, left: 12,
            fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
            background: T.brandGold, color: T.brandBlueDeep,
            padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase',
          }}>★ FEATURED</span>
          <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>3 min read</div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.brandBlue, background: T.brandBlue + '15', padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>DG Update</span>
            <span style={{ fontSize: 11, color: T.inkFaint }}>· 2h ago</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, lineHeight: 1.3, letterSpacing: -0.2 }}>
            DG Pradeep Mehta's vision for 2026–27: One Million Trees Across Gujarat
          </div>
          <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
            The District Governor announced a multi-club initiative spanning all 78 clubs in District 323-H to plant 1 million trees over the coming year…
          </div>
        </div>
      </div>
    </div>

    {/* News list */}
    <div style={{ padding: '20px 20px 8px', fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>LATEST</div>
    <div style={{ paddingInline: 16, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 30 }}>
      {[
        { tag: 'Service',  c: T.success, title: 'Lions Clubs of Gujarat sponsor 8,200 cataract surgeries this quarter', ago: '5h', read: 4 },
        { tag: 'Award',    c: T.brandGold, title: 'Lions Club Vadodara wins International President\'s Medal',       ago: '1d', read: 2 },
        { tag: 'Convention', c: T.brandBlue, title: 'District Convention 2026 — Registrations open Aug 1',              ago: '2d', read: 5 },
        { tag: 'Service',  c: T.success, title: 'Multiple District 323 commits ₹50 crore to flood relief in Surat', ago: '3d', read: 6 },
        { tag: 'Membership', c: T.danger, title: 'Gujarat sees record 8.2% growth in Lions membership this year',     ago: '4d', read: 3 },
      ].map((n, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 14, padding: 14,
          display: 'flex', gap: 12, alignItems: 'flex-start',
          boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 11,
            background: n.c + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name={n.tag === 'Service' ? 'cause' : n.tag === 'Award' ? 'award' : n.tag === 'Convention' ? 'events' : 'flag'} size={20} color={n.c} strokeWidth={1.8}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, color: n.c, background: n.c + '15',
                padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>{n.tag}</span>
              <span style={{ fontSize: 10, color: T.inkFaint }}>· {n.ago} · {n.read} min</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.35 }}>{n.title}</div>
          </div>
        </div>
      ))}
    </div>
  </Screen>
);

// We use FormField from officer.jsx — but to be safe, define local stub if not loaded.
const FormField = window.FormField || (({ label, value, icon, focus, multiline, dropdown }) => (
  <div style={{ paddingBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
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
));

Object.assign(window, {
  AboutScreen, HelpFAQScreen, ReferLionScreen, DistrictNewsScreen,
});
