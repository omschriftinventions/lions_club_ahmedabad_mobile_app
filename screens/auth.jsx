// Lions Club — Auth flow screens
// Splash → Login → OTP → Forgot Password → Reset Password

const T = window.LC;

// ──────────────────────────────────────────────────────────────
// 1. SPLASH SCREEN
// Logo centered on brand blue. Subtle gold radial glow. Motto + version.
// ──────────────────────────────────────────────────────────────
const SplashScreen = () => (
  <Screen bg={T.brandBlueDeep} statusDark>
    {/* Radial glow */}
    <div style={{
      position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 420, height: 420, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(255,209,0,0.18) 0%, transparent 65%)`,
      pointerEvents: 'none',
    }}/>

    {/* Decorative rays */}
    <svg width="402" height="402" viewBox="0 0 402 402" style={{ position: 'absolute', top: '12%', left: 0, opacity: 0.06 }}>
      {Array.from({length: 24}).map((_, i) => (
        <line key={i} x1="201" y1="201" x2="201" y2="40"
          stroke={T.brandGold} strokeWidth="2"
          transform={`rotate(${i*15} 201 201)`}/>
      ))}
    </svg>

    <div style={{
      position: 'absolute', top: '32%', left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
    }}>
      <div style={{
        width: 140, height: 140, borderRadius: '50%',
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
      }}>
        <LionsLogo size={120}/>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1,
          fontFamily: T.fontDsp,
        }}>LIONS CLUB</div>
        <div style={{ color: T.brandGold, fontSize: 13, fontWeight: 600, letterSpacing: 6, marginTop: 4 }}>
          AHMEDABAD
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <div style={{ width: 28, height: 1, background: T.brandGold, opacity: 0.6 }}/>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 4, fontStyle: 'italic', fontFamily: T.fontDsp }}>WE SERVE</div>
          <div style={{ width: 28, height: 1, background: T.brandGold, opacity: 0.6 }}/>
        </div>
      </div>
    </div>

    {/* Loading dots */}
    <div style={{
      position: 'absolute', bottom: 120, left: 0, right: 0,
      display: 'flex', gap: 8, justifyContent: 'center',
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 4,
          background: T.brandGold, opacity: i === 1 ? 1 : 0.4,
        }}/>
      ))}
    </div>

    <div style={{
      position: 'absolute', bottom: 50, left: 0, right: 0,
      textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 0.5,
    }}>
      District 323-H · v1.0.0
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 2. LOGIN — email + password
// ──────────────────────────────────────────────────────────────
const LoginScreen = () => (
  <Screen bg="#fff">
    {/* Hero header with brand blue */}
    <div style={{
      background: `linear-gradient(160deg, ${T.brandBlueDeep} 0%, ${T.brandBlue} 100%)`,
      height: 260, position: 'relative', overflow: 'hidden',
      borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    }}>
      <MiniStatus dark/>
      {/* gold ribbon decoration */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(255,209,0,0.08)',
      }}/>
      <div style={{
        position: 'absolute', top: 50, right: -100, width: 240, height: 240,
        borderRadius: '50%', background: 'rgba(255,209,0,0.05)',
      }}/>

      <div style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LionsLogo size={46}/>
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 0.3, fontFamily: T.fontDsp }}>
            Lions Club Ahmedabad
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1.5, marginTop: 2 }}>
            DISTRICT 323-H · WE SERVE
          </div>
        </div>
      </div>

      <div style={{ paddingInline: 28, marginTop: 30 }}>
        <div style={{ color: '#fff', fontSize: 30, fontWeight: 700, fontFamily: T.fontDsp, letterSpacing: -0.5 }}>
          Welcome back
        </div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 }}>
          Sign in to your member account
        </div>
      </div>
    </div>

    {/* Form */}
    <div style={{ padding: '32px 24px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Email Address
        </label>
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 10,
          background: T.bg, border: `1px solid ${T.line}`,
          borderRadius: 14, padding: '14px 16px',
        }}>
          <Icon name="mail" size={20} color={T.inkMute}/>
          <input readOnly value="rajesh.patel@example.com" style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: T.font, fontSize: 15, color: T.ink,
          }}/>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Password
        </label>
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 10,
          background: T.bg, border: `2px solid ${T.brandBlue}`,
          borderRadius: 14, padding: '13px 16px',
        }}>
          <Icon name="settings" size={20} color={T.inkMute}/>
          <input readOnly type="password" value="••••••••••" style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: T.font, fontSize: 15, color: T.ink, letterSpacing: 2,
          }}/>
          <Icon name="eye" size={20} color={T.inkMute}/>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.inkSoft }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4, background: T.brandBlue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="check" size={12} color="#fff" strokeWidth={3}/></div>
          Remember me
        </label>
        <a style={{ fontSize: 13, color: T.brandBlue, fontWeight: 600 }}>Forgot password?</a>
      </div>

      <button style={{
        width: '100%', height: 54, borderRadius: 14, border: 'none',
        background: T.brandBlue, color: '#fff',
        fontFamily: T.font, fontSize: 16, fontWeight: 700, letterSpacing: 0.3,
        boxShadow: `0 10px 24px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        cursor: 'pointer',
      }}>
        Sign In <Icon name="arrow" size={18} color="#fff"/>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
        <div style={{ flex: 1, height: 1, background: T.line }}/>
        <div style={{ fontSize: 11, color: T.inkFaint, letterSpacing: 1 }}>OR</div>
        <div style={{ flex: 1, height: 1, background: T.line }}/>
      </div>

      <button style={{
        width: '100%', height: 50, borderRadius: 14,
        background: '#fff', border: `1.5px solid ${T.line}`,
        color: T.ink, fontFamily: T.font, fontSize: 14, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <Icon name="phone" size={18} color={T.brandBlue}/> Sign in with Mobile + OTP
      </button>

      <div style={{ textAlign: 'center', marginTop: 30, fontSize: 13, color: T.inkSoft }}>
        New to the club? <span style={{ color: T.brandBlue, fontWeight: 700 }}>Request access</span>
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 3. OTP VERIFICATION
// 6-digit OTP boxes, resend timer, contextual help.
// ──────────────────────────────────────────────────────────────
const OtpScreen = () => {
  const digits = ['4','7','2','9','',''];
  return (
    <Screen bg="#fff">
      <MiniStatus/>
      {/* Back button */}
      <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 999, background: T.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="chevL" size={20} color={T.ink}/></div>
      </div>

      <div style={{ padding: '20px 28px 0' }}>
        {/* Icon */}
        <div style={{
          width: 76, height: 76, borderRadius: 20,
          background: `linear-gradient(140deg, ${T.brandBlue}, ${T.brandBlueDeep})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, boxShadow: `0 14px 32px ${T.brandBlue}33`,
        }}>
          <Icon name="phone" size={36} color={T.brandGold} strokeWidth={2}/>
        </div>

        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, fontFamily: T.fontDsp, letterSpacing: -0.5, color: T.ink }}>
          Verify your number
        </h1>
        <div style={{ marginTop: 10, fontSize: 14, color: T.inkSoft, lineHeight: 1.5 }}>
          We've sent a 6-digit verification code to
          <div style={{ color: T.ink, fontWeight: 700, marginTop: 4 }}>
            +91 98250 12345 <a style={{ color: T.brandBlue, fontWeight: 600, marginLeft: 6, fontSize: 13 }}>Change</a>
          </div>
        </div>

        {/* OTP inputs */}
        <div style={{ display: 'flex', gap: 10, marginTop: 36, justifyContent: 'space-between' }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              flex: 1, height: 60, borderRadius: 14,
              background: d ? '#fff' : T.bg,
              border: `2px solid ${d ? T.brandBlue : (i === digits.findIndex(x => !x) ? T.brandBlue : T.line)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.ink,
              boxShadow: d ? `0 6px 14px ${T.brandBlue}15` : 'none',
              position: 'relative',
            }}>
              {d}
              {!d && i === digits.findIndex(x => !x) && (
                <div style={{
                  position: 'absolute', width: 2, height: 26, background: T.brandBlue,
                  animation: 'blink 1s infinite',
                }}/>
              )}
            </div>
          ))}
        </div>

        {/* Resend */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: T.inkSoft }}>
          Didn't receive code? <span style={{ color: T.inkFaint }}>Resend in <b style={{ color: T.brandBlue }}>00:24</b></span>
        </div>

        {/* Verify button */}
        <button style={{
          marginTop: 32, width: '100%', height: 54, borderRadius: 14, border: 'none',
          background: T.brandBlue, color: '#fff',
          fontFamily: T.font, fontSize: 16, fontWeight: 700,
          boxShadow: `0 10px 24px ${T.brandBlue}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          Verify <Icon name="check" size={18} color="#fff" strokeWidth={3}/>
        </button>

        {/* Help */}
        <div style={{
          marginTop: 28, padding: '14px 16px',
          background: T.bgWarm, borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: T.brandGold, color: T.brandBlueDeep,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, flexShrink: 0,
          }}>?</div>
          <div style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.55 }}>
            Trouble receiving the OTP? Check your network or contact Club Secretary <b style={{ color: T.ink }}>Lion Anand Shah</b>.
          </div>
        </div>
      </div>
    </Screen>
  );
};

Object.assign(window, { SplashScreen, LoginScreen, OtpScreen });
