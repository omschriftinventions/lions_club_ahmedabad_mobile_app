import React from 'react';

const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm13 10v-1a4 4 0 0 0-3-3.8M15.5 3.2a3.5 3.5 0 0 1 0 6.6',
  calendar: 'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4',
  news: 'M4 4h16v16H4zM4 8h16M9 12h6M9 16h4',
  bell: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  chat: 'M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  briefcase: 'M3 8h18v12H3zM8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3',
  heart: 'M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM6 5H4v2a3 3 0 0 0 3 3M18 5h2v2a3 3 0 0 1-3 3M9 17h6M10 13v4M14 13v4M8 21h8',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  doc: 'M6 3h8l4 4v14H6zM14 3v4h4M8 13h8M8 17h8M8 9h3',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Zm11-3a8 8 0 0 1 0 12',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 3a8 8 0 0 0-.2-1.7l2-1.5-2-3.4-2.3 1a8 8 0 0 0-3-1.7L14 2h-4l-.5 2.7a8 8 0 0 0-3 1.7l-2.3-1-2 3.4 2 1.5A8 8 0 0 0 4 12c0 .6.1 1.2.2 1.7l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 3 1.7L10 22h4l.5-2.7a8 8 0 0 0 3-1.7l2.3 1 2-3.4-2-1.5c.1-.5.2-1.1.2-1.7Z',
  plus: 'M12 5v14M5 12h14',
  chevron: 'M9 6l6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  camera: 'M3 7h3l2-2h8l2 2h3v12H3zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  link: 'M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1',
  check: 'M5 12l5 5 9-11',
  x: 'M6 6l12 12M18 6 6 18',
  phone: 'M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  edit: 'M4 20h4l10-10-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  ribbon: 'M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3 1-2 8 5-3 5 3-2-8',
  history: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 12l3.5 2M12 7v5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 2.5 13 0 18M12 3c-2.5 2.5-2.5 13 0 18',
  user: 'M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  back: 'M15 6l-6 6 6 6',
mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm0 0v6M9 21h6',
share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 13.5l6.8 3M15.4 7.5l-6.8 3',
download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
play: 'M8 5v14l11-7z',
pause: 'M8 5h3v14H8zM14 5h3v14h-3z',
stop: 'M6 6h12v12H6z',
};

export const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d={P[name] ?? ''} />
  </svg>
);