// Lions Club — Communication & system states
// Chat list · Chat thread · Empty states · Error states

const T = window.LC;
const { MEMBERS } = window.LCData;

// ──────────────────────────────────────────────────────────────
// 27. CHAT LIST (DMs + broadcast channels)
// ──────────────────────────────────────────────────────────────
const ChatListScreen = () => {
  const chats = [
    { who: MEMBERS[1], lastMsg: "Thanks Rajesh, I'll bring the documents tomorrow", time: '11:42 AM', unread: 2, channel: false },
    { who: MEMBERS[3], lastMsg: "Sure, see you at the eye camp on Sunday 🙏", time: '10:15 AM', unread: 0, channel: false },
    { name: '#charter-night-2026', sub: '24 members · Lion Vikram: Hyatt confirmed!', time: 'Yesterday', unread: 5, channel: true, color: T.brandGold },
    { name: '#vision-first-team',  sub: 'Dr. Joshi: 8 referrals from today\'s camp', time: 'Yesterday', unread: 0, channel: true, color: T.brandBlue },
    { who: MEMBERS[6], lastMsg: "School visit scheduled for next Tuesday at 10 AM", time: 'Mon', unread: 0, channel: false },
    { name: '#board-officers',     sub: 'Secretary: Minutes uploaded',                 time: 'Sun', unread: 0, channel: true, color: T.success },
    { who: MEMBERS[8], lastMsg: "Beautiful event 🌟 forwarding pics to you",          time: 'Sun', unread: 0, channel: false },
  ];
  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.4 }}>Messages</div>
          <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>7 conversations · 3 channels</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
            <Icon name="search" size={17} color={T.ink}/>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: T.brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="edit" size={16} color="#fff" strokeWidth={2}/>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ paddingInline: 16, paddingTop: 10, display: 'flex', gap: 8, overflow: 'hidden' }}>
        <Chip active>All</Chip>
        <Chip>Direct</Chip>
        <Chip>Channels</Chip>
        <Chip>Unread</Chip>
      </div>

      <div style={{ paddingInline: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chats.map((c, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
          }}>
            {c.channel ? (
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: `linear-gradient(135deg, ${c.color}, ${shade(c.color, -25)})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 20,
              }}>#</div>
            ) : (
              <Avatar initials={c.who.initials} size={46} color={c.who.color}/>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: c.unread ? 800 : 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.channel ? c.name : c.who.name.replace('Lion ','')}
                </div>
                <div style={{ fontSize: 10, color: c.unread ? T.brandBlue : T.inkFaint, fontWeight: c.unread ? 700 : 500, flexShrink: 0 }}>{c.time}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 6 }}>
                <div style={{ fontSize: 11, color: c.unread ? T.ink : T.inkMute, fontWeight: c.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {c.channel ? c.sub : c.lastMsg}
                </div>
                {c.unread > 0 && (
                  <div style={{
                    background: T.brandBlue, color: '#fff', fontSize: 10, fontWeight: 700,
                    minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{c.unread}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 100 }}/>
      <TabBar/>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 28. CHAT THREAD (1:1 DM)
// ──────────────────────────────────────────────────────────────
const ChatThreadScreen = () => {
  const them = MEMBERS[1]; // Lion Anand Shah
  const Bubble = ({ side, text, time, status, special }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: side === 'me' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{
        maxWidth: '78%', padding: '9px 13px',
        background: side === 'me' ? T.brandBlue : '#fff',
        color: side === 'me' ? '#fff' : T.ink,
        borderRadius: 16,
        borderBottomRightRadius: side === 'me' ? 4 : 16,
        borderBottomLeftRadius:  side === 'me' ? 16 : 4,
        fontSize: 13, lineHeight: 1.4, fontWeight: 500,
        boxShadow: side === 'me' ? 'none' : '0 1px 3px rgba(10,22,40,0.05)',
      }}>{text}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, paddingInline: 6 }}>
        <span style={{ fontSize: 10, color: T.inkFaint }}>{time}</span>
        {side === 'me' && (
          <Icon name="check" size={11} color={status === 'read' ? T.brandBlue : T.inkFaint} strokeWidth={3}/>
        )}
      </div>
    </div>
  );
  return (
    <Screen bg={T.bg}>
      {/* Header */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderBottom: `1px solid ${T.line}` }}>
        <Icon name="chevL" size={20} color={T.ink} strokeWidth={2}/>
        <Avatar initials={them.initials} size={40} color={them.color} status="online"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{them.name.replace('Lion ','')}</span>
            <span style={{ fontSize: 9, color: T.brandGold, background: T.brandBlueDeep, padding: '1px 5px', borderRadius: 3, fontWeight: 700, letterSpacing: 0.5 }}>{them.designation}</span>
          </div>
          <div style={{ fontSize: 11, color: T.success, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: T.success }}/>
            Active now · Secretary
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: T.success + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="phone" size={16} color={T.success} strokeWidth={2}/>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="menu" size={16} color={T.ink}/>
          </div>
        </div>
      </div>

      {/* Date pill */}
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <span style={{ fontSize: 10, color: T.inkMute, background: '#fff', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>TODAY</span>
      </div>

      {/* Messages */}
      <div style={{ paddingInline: 14 }}>
        <Bubble side="them" text="Hi Rajesh, are you joining the Charter Night planning call at 8 PM?" time="11:02 AM"/>
        <Bubble side="me"   text="Yes, definitely. Anita will join too." time="11:05 AM" status="read"/>
        <Bubble side="them" text="Perfect 🙏 I also need the venue confirmation letter signed before Friday." time="11:08 AM"/>

        {/* Document attachment */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <div style={{
            maxWidth: '78%', padding: 10, background: '#fff', borderRadius: 16, borderBottomLeftRadius: 4,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 1px 3px rgba(10,22,40,0.05)',
          }}>
            <div style={{ width: 36, height: 44, borderRadius: 6, background: T.danger + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="book" size={18} color={T.danger}/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>Hyatt_Venue_Letter.pdf</div>
              <div style={{ fontSize: 10, color: T.inkMute, marginTop: 1 }}>240 KB · Tap to view</div>
            </div>
          </div>
        </div>

        <Bubble side="me"   text="Got it. I'll review and sign it tonight." time="11:38 AM" status="read"/>
        <Bubble side="them" text="Thanks Rajesh, I'll bring the documents tomorrow" time="11:42 AM"/>

        {/* Typing indicator */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <div style={{
            padding: '12px 16px', background: '#fff', borderRadius: 16, borderBottomLeftRadius: 4,
            display: 'flex', alignItems: 'center', gap: 4,
            boxShadow: '0 1px 3px rgba(10,22,40,0.05)',
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: 3, background: T.inkMute,
                opacity: 0.6,
                animation: `blink 1.4s ${i*0.2}s infinite`,
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 12px 26px', background: '#fff', borderTop: `1px solid ${T.line}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={20} color={T.inkSoft}/>
        </div>
        <div style={{
          flex: 1, background: T.bg, borderRadius: 20,
          padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <input readOnly placeholder="Message Lion Anand…" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: T.font, fontSize: 13, color: T.ink,
          }}/>
          <Icon name="cake" size={18} color={T.inkMute}/>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 999,
          background: T.brandBlue, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="arrow" size={17} color="#fff" strokeWidth={2.2}/>
        </div>
      </div>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 29. EMPTY STATE (no search results / first-time)
// ──────────────────────────────────────────────────────────────
const EmptyStateScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="chevL" size={20} color={T.ink}/>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '10px 14px', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="search" size={18} color={T.inkMute}/>
        <input readOnly value="dentist mahatma nagar" style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontFamily: T.font, fontSize: 14, color: T.ink, fontWeight: 600,
        }}/>
        <Icon name="close" size={16} color={T.inkMute}/>
      </div>
    </div>

    {/* Empty illustration */}
    <div style={{ paddingTop: 56, textAlign: 'center', paddingInline: 32 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity: 0.10 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={i} x1="100" y1="100" x2="100" y2="20" stroke={T.brandBlue} strokeWidth="3" transform={`rotate(${i*22.5} 100 100)`}/>
          ))}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{
            width: 96, height: 96, borderRadius: 999, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(10,22,40,0.12)',
          }}>
            <Icon name="search" size={44} color={T.inkFaint} strokeWidth={1.8}/>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 32, letterSpacing: -0.3 }}>
        No Lions found
      </div>
      <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 8, lineHeight: 1.55 }}>
        We couldn't find any member matching "<b style={{ color: T.ink }}>dentist mahatma nagar</b>". Try a broader search.
      </div>

      {/* Suggestions */}
      <div style={{ marginTop: 28, textAlign: 'left' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>TRY THESE INSTEAD</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: 'briefcase', label: 'Browse by profession', sub: '12 categories' },
            { icon: 'pin',       label: 'Browse by area',       sub: '8 zones in Ahmedabad' },
            { icon: 'roster',    label: 'See all members',      sub: '142 active Lions' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 12, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 1px 4px rgba(10,22,40,0.04)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.brandBlue + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={17} color={T.brandBlue} strokeWidth={1.9}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{s.label}</div>
                <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>{s.sub}</div>
              </div>
              <Icon name="chevR" size={15} color={T.inkFaint}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 30. ERROR STATE (no connection)
// ──────────────────────────────────────────────────────────────
const ErrorStateScreen = () => (
  <Screen bg={T.bg} scroll={false}>
    {/* Offline banner */}
    <div style={{
      background: T.danger, color: '#fff', padding: '8px 16px',
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }}/>
      No internet · Showing cached content
    </div>

    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.4 }}>Events</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <Icon name="plus" size={18} color={T.inkMute}/>
        </div>
      </div>
    </div>

    {/* Centered error illustration */}
    <div style={{ paddingTop: 90, textAlign: 'center', paddingInline: 36 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          width: 130, height: 130, borderRadius: 999,
          background: `radial-gradient(circle, ${T.danger}15 0%, transparent 65%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: 999, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(200,54,45,0.15)',
            position: 'relative',
          }}>
            <Icon name="bell" size={40} color={T.danger} strokeWidth={1.8}/>
            {/* Slash through */}
            <div style={{
              position: 'absolute', width: 60, height: 3, background: T.danger,
              transform: 'rotate(45deg)', borderRadius: 2,
            }}/>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 24, letterSpacing: -0.3 }}>
        Connection trouble
      </div>
      <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 10, lineHeight: 1.55 }}>
        We couldn't reach the club server. Check your internet connection and try again. Some content may still be available offline.
      </div>

      <div style={{ marginTop: 28 }}>
        <button style={{
          width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
          borderRadius: 14, padding: '14px 0',
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
          boxShadow: `0 10px 20px ${T.brandBlue}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5} style={{ transform: 'rotate(-45deg)' }}/>
          Try again
        </button>
        <div style={{ marginTop: 14, fontSize: 12, color: T.brandBlue, fontWeight: 600 }}>
          View cached content →
        </div>
      </div>

      {/* Tech details */}
      <div style={{
        marginTop: 32, padding: 12, borderRadius: 10,
        background: '#fff', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: T.inkFaint + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="settings" size={14} color={T.inkSoft}/>
        </div>
        <div style={{ flex: 1, fontSize: 10, color: T.inkMute, lineHeight: 1.4 }}>
          <b style={{ color: T.inkSoft }}>Error code:</b> NET_REQUEST_TIMEOUT · Last sync 14 min ago
        </div>
      </div>
    </div>
  </Screen>
);

Object.assign(window, {
  ChatListScreen, ChatThreadScreen, EmptyStateScreen, ErrorStateScreen,
});
