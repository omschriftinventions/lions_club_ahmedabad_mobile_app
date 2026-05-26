// Lions Club Ahmedabad — Design Tokens
// All visual primitives. Match these EXACTLY in React Native (StyleSheet).

const T = {
  // Brand
  brandBlue:    '#003F87',   // Lions International Blue (primary)
  brandBlueDark:'#002C5F',   // Deeper, for gradients / pressed states
  brandBlueDeep:'#001F45',   // Hero backgrounds
  brandGold:    '#FFD100',   // Lions Gold (accent / CTAs on dark)
  brandGoldDark:'#E6B800',   // Gold pressed state

  // Neutrals
  ink:          '#0A1628',   // Primary text
  inkSoft:      '#3D4B5C',   // Secondary text
  inkMute:      '#6B7785',   // Tertiary / captions
  inkFaint:     '#9AA3AE',   // Disabled / hints
  line:         '#E5E8EC',   // Hairlines
  surface:      '#FFFFFF',
  bg:           '#F4F6F9',   // App background (cool off-white)
  bgWarm:       '#FAF8F3',   // Warm alt (event detail etc.)

  // Semantic
  success:      '#1F8A5B',
  danger:       '#C8362D',
  warning:      '#E08E1A',
  info:         '#2A6FDB',

  // Roles (member badges)
  rolePresident:'#8B1A3B',
  roleSecretary:'#003F87',
  roleTreasurer:'#1F5F3F',
  roleMember:   '#6B7785',

  // Radii
  r: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 },

  // Spacing scale (4-based)
  s: (n) => n * 4,

  // Type
  font:    '-apple-system, "SF Pro Text", system-ui, sans-serif',
  fontDsp: '"Playfair Display", "Cormorant Garamond", Georgia, serif', // for headlines
};

window.LC = T;
