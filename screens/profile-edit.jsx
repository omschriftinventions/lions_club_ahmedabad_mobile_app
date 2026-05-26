// Lions Club — Profile management & auth completion
// Edit Profile · Settings · Forgot Password · Reset Password

const T = window.LC;
const { MEMBERS } = window.LCData;

// ──────────────────────────────────────────────────────────────
// 19. EDIT PROFILE
// ──────────────────────────────────────────────────────────────
const EditProfileScreen = () => {
  const me = MEMBERS[0];
  const Field = ({ label, value, type, icon, sub, required }) => (
    <div style={{ paddingBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.4 }}>
          {label}{required && <span style={{ color: T.danger, marginLeft: 3 }}>*</span>}
        </div>
        {sub && <div style={{ fontSize: 10, color: T.inkMute }}>{sub}</div>}
      </div>
      <div style={{
        marginTop: 6, background: '#fff', borderRadius: 10,
        border: `1.5px solid ${type === 'focus' ? T.brandBlue : T.line}`,
        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {icon && <Icon name={icon} size={16} color={type === 'focus' ? T.brandBlue : T.inkMute}/>}
        <input readOnly value={value} style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: T.font, fontSize: 14, color: T.ink, fontWeight: 500,
        }}/>
        {type === 'focus' && <div style={{ width: 5, height: 5, borderRadius: 3, background: T.brandBlue }}/>}
      </div>
    </div>
  );
  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="close" size={22} color={T.ink}/>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: T.fontDsp, color: T.ink }}>Edit Profile</div>
        </div>
        <div style={{ fontSize: 13, color: T.brandBlue, fontWeight: 700 }}>Save</div>
      </div>

      {/* Photo */}
      <div style={{ background: '#fff', padding: '20px 0 22px', textAlign: 'center', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <Avatar initials={me.initials} size={92} color={me.color} ring/>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 30, height: 30, borderRadius: 999,
            background: T.brandBlue, border: '3px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="edit" size={13} color="#fff" strokeWidth={2.2}/>
          </div>
        </div>
        <div style={{ fontSize: 12, color: T.brandBlue, fontWeight: 600, marginTop: 10 }}>Change profile photo</div>
      </div>

      <div style={{ padding: '18px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, marginBottom: 10 }}>PERSONAL INFORMATION</div>
        <Field label="FULL NAME"   value={me.name}    type="focus" required/>
        <Field label="SPOUSE NAME" value={me.spouse}  icon="profile"/>
        <Field label="DATE OF BIRTH" value="March 14, 1968" icon="cake"/>
        <Field label="ANNIVERSARY" value={me.anniv}   icon="star"/>

        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, margin: '14px 0 10px' }}>CONTACT</div>
        <Field label="MOBILE"   value={me.phone} icon="phone" required sub="Used for OTP"/>
        <Field label="EMAIL"    value={me.email} icon="mail" required/>
        <Field label="WHATSAPP" value={me.phone} icon="wapp" sub="Same as mobile"/>

        <div style={{ fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2, margin: '14px 0 10px' }}>PROFESSIONAL</div>
        <Field label="PROFESSION"   value={me.profession} icon="briefcase"/>
        <Field label="BUSINESS"     value={me.business}/>
        <Field label="AREA (AHMEDABAD)" value={me.area} icon="pin"/>

        <div style={{
          marginTop: 12, padding: 14, borderRadius: 12,
          background: T.brandBlue + '08', border: `1px dashed ${T.brandBlue}30`,
          display: 'flex', gap: 10,
        }}>
          <Icon name="award" size={20} color={T.brandBlue} strokeWidth={1.8}/>
          <div style={{ flex: 1, fontSize: 11, color: T.inkSoft, lineHeight: 1.5 }}>
            <b style={{ color: T.ink }}>Role & designation</b> (President, PMJF) are managed by the Secretary. Contact Lion Anand Shah to update.
          </div>
        </div>

        <div style={{ marginTop: 18, marginBottom: 24 }}>
          <button style={{
            width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
            borderRadius: 14, padding: '15px 0',
            fontFamily: T.font, fontSize: 14, fontWeight: 700,
            boxShadow: `0 10px 20px ${T.brandBlue}40`,
          }}>Save Changes</button>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: T.danger, fontWeight: 600 }}>Delete my account</span>
          </div>
        </div>
      </div>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 20. SETTINGS
// ──────────────────────────────────────────────────────────────
const SettingsScreen = () => {
  const Row = ({ icon, label, sub, value, danger, toggle, last }) => (
    <div style={{
      padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: last ? 'none' : `1px solid ${T.line}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: danger ? T.danger + '15' : T.brandBlue + '12',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={17} color={danger ? T.danger : T.brandBlue} strokeWidth={1.9}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: danger ? T.danger : T.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.inkMute, marginTop: 1 }}>{sub}</div>}
      </div>
      {value && <div style={{ fontSize: 12, color: T.inkMute, fontWeight: 600 }}>{value}</div>}
      {toggle !== undefined && (
        <div style={{
          width: 42, height: 25, borderRadius: 999,
          background: toggle ? T.success : T.line,
          padding: 2, display: 'flex',
          justifyContent: toggle ? 'flex-end' : 'flex-start',
        }}>
          <div style={{ width: 21, height: 21, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
        </div>
      )}
      {value && <Icon name="chevR" size={15} color={T.inkFaint}/>}
    </div>
  );
  const Group = ({ title, children }) => (
    <>
      <div style={{ paddingInline: 20, paddingTop: 18, paddingBottom: 8, fontSize: 11, fontWeight: 800, color: T.inkMute, letterSpacing: 1.2 }}>{title}</div>
      <div style={{ background: '#fff', marginInline: 16, borderRadius: 14, overflow: 'hidden' }}>{children}</div>
    </>
  );
  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
          <Icon name="chevL" size={20} color={T.ink}/>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, letterSpacing: -0.3 }}>Settings</div>
      </div>

      <Group title="PREFERENCES">
        <Row icon="bell"      label="Push notifications" sub="Events, birthdays, news" toggle={true}/>
        <Row icon="mail"      label="Email digest"        sub="Weekly summary"          toggle={true}/>
        <Row icon="wapp"      label="WhatsApp reminders"  sub="Service drives"          toggle={false}/>
        <Row icon="sun"       label="Appearance"          value="System"/>
        <Row icon="settings"  label="Language"            value="English" last/>
      </Group>

      <Group title="ACCOUNT">
        <Row icon="profile"  label="Edit profile"         value="Tap"/>
        <Row icon="phone"    label="Change mobile number" value="+91 98250 12345"/>
        <Row icon="mail"     label="Change email"         value="rajesh.patel…"/>
        <Row icon="logout"   label="Change password"      value="Tap" last/>
      </Group>

      <Group title="PRIVACY">
        <Row icon="eye"  label="Show profile to all Lions" sub="Across districts" toggle={true}/>
        <Row icon="pin"  label="Share my area"             sub="Helps with carpools" toggle={true}/>
        <Row icon="briefcase" label="Show in business directory" toggle={true} last/>
      </Group>

      <Group title="SUPPORT">
        <Row icon="book"      label="Help & FAQs"          value="Tap"/>
        <Row icon="handshake" label="Contact Secretary"    sub="Lion Anand Shah"/>
        <Row icon="flag"      label="Report an issue"      value="Tap"/>
        <Row icon="award"     label="Rate the app"         value="App Store" last/>
      </Group>

      <Group title="DANGER ZONE">
        <Row icon="logout" label="Sign out"          danger/>
        <Row icon="close"  label="Delete account"    sub="Permanent · officer approval needed" danger last/>
      </Group>

      <div style={{ textAlign: 'center', padding: '28px 0 32px', color: T.inkFaint, fontSize: 11 }}>
        Lions Club Ahmedabad · v1.0.0 (build 142)<br/>
        <span style={{ color: T.brandGold, fontStyle: 'italic', fontFamily: T.fontDsp }}>We Serve.</span>
      </div>
    </Screen>
  );
};

// ──────────────────────────────────────────────────────────────
// 21. FORGOT PASSWORD
// ──────────────────────────────────────────────────────────────
const ForgotPasswordScreen = () => (
  <Screen bg={T.bg}>
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
        <Icon name="chevL" size={20} color={T.ink}/>
      </div>
    </div>

    <div style={{ paddingInline: 28, paddingTop: 24 }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: T.brandBlue + '12', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="mail" size={36} color={T.brandBlue} strokeWidth={1.8}/>
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 22, letterSpacing: -0.4, lineHeight: 1.15 }}>
        Forgot your<br/>password?
      </div>
      <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 12, lineHeight: 1.55 }}>
        Enter the email address registered with the club. We'll send a 6-digit reset code.
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.4, marginBottom: 6 }}>EMAIL ADDRESS</div>
        <div style={{
          background: '#fff', borderRadius: 12,
          border: `1.5px solid ${T.brandBlue}`,
          padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="mail" size={18} color={T.brandBlue}/>
          <input readOnly value="rajesh.patel@example.com" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: T.font, fontSize: 14, color: T.ink, fontWeight: 500,
          }}/>
        </div>
      </div>

      <button style={{
        width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 0', marginTop: 22,
        fontFamily: T.font, fontSize: 14, fontWeight: 700,
        boxShadow: `0 10px 20px ${T.brandBlue}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Send reset code <Icon name="arrow" size={16} color="#fff" strokeWidth={2.5}/>
      </button>

      <div style={{
        marginTop: 22, padding: 14, borderRadius: 12,
        background: T.brandGold + '15', border: `1px solid ${T.brandGold}40`,
        display: 'flex', gap: 10,
      }}>
        <Icon name="handshake" size={18} color={T.warning} strokeWidth={1.8}/>
        <div style={{ flex: 1, fontSize: 11, color: T.inkSoft, lineHeight: 1.5 }}>
          <b style={{ color: T.ink }}>Need help?</b> Contact Club Secretary <b style={{ color: T.brandBlue }}>Lion Anand Shah</b> on +91 98980 23456 to verify membership before reset.
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: T.inkSoft }}>
        Remembered it? <span style={{ color: T.brandBlue, fontWeight: 700 }}>Back to Sign in</span>
      </div>
    </div>
  </Screen>
);

// ──────────────────────────────────────────────────────────────
// 22. RESET PASSWORD
// ──────────────────────────────────────────────────────────────
const ResetPasswordScreen = () => {
  const Strength = ({ level }) => {
    const labels = ['Weak','Fair','Good','Strong'];
    const colors = [T.danger, T.warning, T.success, T.success];
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < level ? colors[level-1] : T.line,
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T.inkMute }}>
          <span>Strength</span>
          <span style={{ color: colors[level-1], fontWeight: 700 }}>{labels[level-1]}</span>
        </div>
      </div>
    );
  };

  const Check = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: ok ? T.success : T.inkMute }}>
      <div style={{
        width: 14, height: 14, borderRadius: 999,
        background: ok ? T.success : T.line,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {ok && <Icon name="check" size={9} color="#fff" strokeWidth={3}/>}
      </div>
      {label}
    </div>
  );

  return (
    <Screen bg={T.bg}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(10,22,40,0.05)' }}>
          <Icon name="chevL" size={20} color={T.ink}/>
        </div>
      </div>

      <div style={{ paddingInline: 28, paddingTop: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: T.success + '15', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={36} color={T.success} strokeWidth={2.2}/>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: T.fontDsp, color: T.ink, marginTop: 22, letterSpacing: -0.4, lineHeight: 1.15 }}>
          Set a new<br/>password
        </div>
        <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 10, lineHeight: 1.55 }}>
          Your code was verified. Pick something strong — you'll log in with this from now on.
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.4, marginBottom: 6 }}>NEW PASSWORD</div>
          <div style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${T.brandBlue}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input readOnly value="••••••••••••" style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: T.font, fontSize: 16, color: T.ink, letterSpacing: 2, fontWeight: 700,
            }}/>
            <Icon name="eye" size={18} color={T.inkMute}/>
          </div>
          <Strength level={3}/>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: 0.4, marginBottom: 6 }}>CONFIRM PASSWORD</div>
          <div style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${T.line}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input readOnly value="••••••••••••" style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: T.font, fontSize: 16, color: T.ink, letterSpacing: 2, fontWeight: 700,
            }}/>
            <Icon name="eye" size={18} color={T.inkMute}/>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Check ok={true}  label="At least 8 characters"/>
          <Check ok={true}  label="One uppercase letter"/>
          <Check ok={true}  label="One number"/>
          <Check ok={false} label="One special character (recommended)"/>
        </div>

        <button style={{
          width: '100%', background: T.brandBlue, color: '#fff', border: 'none',
          borderRadius: 14, padding: '15px 0', marginTop: 24,
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
          boxShadow: `0 10px 20px ${T.brandBlue}40`,
        }}>Update password & sign in</button>
      </div>
    </Screen>
  );
};

Object.assign(window, {
  EditProfileScreen, SettingsScreen, ForgotPasswordScreen, ResetPasswordScreen,
});
