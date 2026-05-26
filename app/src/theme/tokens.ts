/**
 * Lions Club Ahmedabad — Design Tokens
 * Mirrors screens/tokens.jsx exactly. RN-ready (no CSS units, numeric radii/spacing).
 */
export const T = {
  // Brand
  brandBlue:     '#003F87',
  brandBlueDark: '#002C5F',
  brandBlueDeep: '#001F45',
  brandGold:     '#FFD100',
  brandGoldDark: '#E6B800',

  // Neutrals
  ink:      '#0A1628',
  inkSoft:  '#3D4B5C',
  inkMute:  '#6B7785',
  inkFaint: '#9AA3AE',
  line:     '#E5E8EC',
  surface:  '#FFFFFF',
  bg:       '#F4F6F9',
  bgWarm:   '#FAF8F3',

  // Semantic
  success: '#1F8A5B',
  danger:  '#C8362D',
  warning: '#E08E1A',
  info:    '#2A6FDB',

  // Roles
  rolePresident: '#8B1A3B',
  roleSecretary: '#003F87',
  roleTreasurer: '#1F5F3F',
  roleMember:    '#6B7785',

  // Radii
  r: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const,

  // Spacing (4-based)
  s: (n: number) => n * 4,

  // Typography
  font: undefined as string | undefined,                 // system
  fontDsp: 'PlayfairDisplay_700Bold' as string | undefined,

  // Type scale
  fs: {
    micro: 10, caption: 11, label: 12, body: 14, bodyLg: 15,
    title: 17, h3: 19, h2: 22, h1: 26, display: 32,
  } as const,
};

export type Theme = typeof T;
