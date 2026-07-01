// In-app user guide content for the Lions Club portal. Shared structure used by
// the Help & FAQ screen. Emoji icons render on both web and mobile.

export interface GuideSection {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  steps: string[];
  tips?: string[];
}

export interface GuideFAQ {
  q: string;
  a: string;
  category: string;
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'start', title: 'Getting started & signing in', emoji: '\uD83D\uDD11',
    summary: 'How to log in for the first time and what you can do.',
    steps: [
      'Open the app and enter the phone number registered with the club (include the country code, e.g. +91 98765 43210).',
      'Tap "Send login code". You will receive a 6-digit code by SMS.',
      'Enter the 6-digit code. If it is correct you are signed in and your tokens are stored securely.',
      'You stay signed in until you sign out. If a session expires you will be asked to log in again.',
    ],
    tips: [
      'Only members registered in the club roster can log in. If your phone is not recognised, ask a club officer to add you.',
      'Your role (President, Secretary, Treasurer, etc.) decides what you can do. Most members can read everything; only officers can create or edit club data.',
    ],
  },
  {
    id: 'dashboard', title: 'Dashboard (Home)', emoji: '\uD83C\uDFE0',
    summary: 'Your landing page with the club at a glance.',
    steps: [
      'The hero shows your name and role. The stat cards summarise service impact (people served, projects, amount spent) and upcoming events.',
      'Upcoming Events lists the next few events; tap one to open its details.',
      'Recent News lists the latest announcements; tap to read the full article.',
      'Officers see an "Officer actions" panel with shortcuts to create an event, publish news, or open Manage.',
    ],
  },
  {
    id: 'roster', title: 'Roster', emoji: '\uD83D\uDC65',
    summary: 'The full club directory with search and filters.',
    steps: [
      'Use the search box to find members by name, profession, business, area, designation, email, phone or role.',
      'Tap a role chip (All roles, President, Secretary, etc.) to filter.',
      'Tap any row to open that member\u2019s full profile.',
    ],
  },
  {
    id: 'member', title: 'Member profile', emoji: '\uD83D\uDC64',
    summary: 'Contact, professional, personal and networking details for a member.',
    steps: [
      'View the member\u2019s designation, profession, business, area, joined year and contact details.',
      'Personal details (birthday, anniversary, spouse) are shown when available.',
      'If the member has filled their networking profile, a "Networking (E-GAINS)" card shows their Expertise, Goals, Accomplishments, Interests, Network and Social connections.',
      'Use the back button to return to the roster.',
    ],
  },
  {
    id: 'egains', title: 'Networking (E-GAINS)', emoji: '\uD83E\uDD17',
    summary: 'Share your professional profile so members can network with you.',
    steps: [
      'E-GAINS stands for Expertise, Goals, Accomplishments, Interests, Network and Social connections \u2014 six free-text fields on your profile.',
      'Open My Profile \u2192 Edit profile and scroll to the Networking (E-GAINS) section. Fill whichever fields apply to you and save.',
      'Filled fields appear on your member profile page for other members to see. Empty fields stay hidden.',
      'Use these to find collaborators, mentors, sponsors and friends within the club \u2014 e.g. list your expertise so members needing it can reach you.',
    ],
  },
  {
    id: 'events', title: 'Events', emoji: '\uD83D\uDCC5',
    summary: 'See upcoming and past events and respond to them.',
    steps: [
      'Toggle between Upcoming and All events.',
      'Tap an event card to open its detail page.',
      'On the detail page choose Yes / Maybe / Can\u2019t make it to RSVP. Your response is saved instantly and counts toward "going".',
      'See who is going and their responses in the attendees list.',
    ],
  },
  {
    id: 'news', title: 'News & updates', emoji: '\uD83D\uDCF0',
    summary: 'Club and district announcements.',
    steps: [
      'Use the scope chips to filter: All, Club, or District news.',
      'Tap an article to read the full text.',
      'When an officer publishes news, every member gets a push notification.',
    ],
  },
  {
    id: 'photos', title: 'Photo gallery', emoji: '\uD83D\uDDBC\uFE0F',
    summary: 'Photos from events and service projects.',
    steps: [
      'Browse the grid of photos. Tap a photo to view it larger with its caption.',
      'Officers can upload a photo with the Upload button \u2014 choose an image from your device and add an optional caption.',
    ],
    tips: ['Photos are stored on the club server. Accepted formats: JPG, PNG, WebP, up to 8 MB.'],
  },
  {
    id: 'impact', title: 'Service impact', emoji: '\u2764\uFE0F',
    summary: 'The dashboard for Lions Global Causes and your service numbers.',
    steps: [
      'See totals for people served and amount spent across all causes.',
      'Each cause card shows its projects and spend. Tap a cause to see its individual projects.',
      'Officers can log a new project with the "Log project" button: pick a cause, add a title, units served, amount spent, date and notes.',
    ],
  },
  {
    id: 'projects', title: 'Service projects', emoji: '\uD83C\uDFD7\uFE0F',
    summary: 'Detailed log of each service project and its photos.',
    steps: [
      'Select a cause to see its projects, or view all.',
      'Tap a project to see units, amount, date, notes and its photo gallery.',
      'Officers can upload photos directly to a project from this page.',
    ],
  },
  {
    id: 'awards', title: 'Awards wall', emoji: '\uD83C\uDFC6',
    summary: 'Recognitions and honours given to members.',
    steps: [
      'Browse awards with their category, date, recipient and description.',
      'Officers can add an award: name, icon/emoji, category, awarded-to member, date and description.',
    ],
  },
  {
    id: 'chats', title: 'Chats', emoji: '\uD83D\uDCAC',
    summary: 'Direct messages and group chats with fellow Lions.',
    steps: [
      'Open Chats to see your conversations; the list refreshes automatically.',
      'Tap "New chat", pick one or more members. Picking more than one creates a group (you can name it).',
      'Open a thread to read and send messages. Messages you send appear on the right; others on the left.',
      'New messages also trigger a push notification to the other members.',
    ],
  },
  {
    id: 'minutes', title: 'Meeting minutes', emoji: '\uD83D\uDCDD',
    summary: 'Records of club meetings.',
    steps: [
      'Browse minutes by date. Tap one to read the full body and open any linked document.',
      'Officers can add minutes: title, date, attendees, the minutes text and an optional document URL.',
      'Officers can delete a record from the list.',
    ],
  },
  {
    id: 'notifications', title: 'Notifications', emoji: '\uD83D\uDD14',
    summary: 'Your inbox of alerts.',
    steps: [
      'All event, news, broadcast and chat alerts appear here, newest first. Unread items are highlighted.',
      'The list marks itself read shortly after you open it. Use "Mark all read" to clear unread indicators.',
      'On the web, push notifications are not delivered to the browser \u2014 this inbox is your notification history. On the mobile app you also get device push.',
    ],
  },
  {
    id: 'directory', title: 'Business directory', emoji: '\uD83D\uDBC1\uFE0F',
    summary: 'Find members by their business or profession.',
    steps: [
      'Search by business, profession, area or role.',
      'Tap a card to open that member\u2019s profile, including phone and email for networking.',
    ],
  },
  {
    id: 'find', title: 'Find a Lion', emoji: '\uD83D\uDD0D',
    summary: 'Quick member search across all details.',
    steps: [
      'Type at least two characters to search the roster by name, profession, business, area, designation or role.',
      'Tap a result to open the member\u2019s profile.',
    ],
  },
  {
    id: 'refer', title: 'Refer a Lion', emoji: '\uD83D\uDC4B',
    summary: 'Sponsor prospective members.',
    steps: [
      'Submit a referral with the candidate\u2019s name, phone, email, profession and notes.',
      'You see your own referrals; officers see all referrals and can update each one\u2019s status (new \u2192 contacted \u2192 inducted / declined).',
    ],
  },
  {
    id: 'charter', title: 'Charter invite', emoji: '\uD83C\uDF95',
    summary: 'A ready-to-share invite to grow the club.',
    steps: [
      'Review the invite text, then tap "Copy invite text".',
      'Paste it into WhatsApp, SMS or email to invite prospective members.',
    ],
  },
  {
    id: 'district', title: 'District news', emoji: '\uD83C\uDF10',
    summary: 'Updates from District 3232 B1.',
    steps: ['Read district-level announcements here. Tap an article to read the full text.'],
  },
  {
    id: 'profile', title: 'My profile', emoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB',
    summary: 'View and edit your own details, including your networking profile.',
    steps: [
      'See your professional, contact and personal details.',
      'Tap "Edit profile" to update your details, then scroll to the Networking (E-GAINS) section to add your Expertise, Goals, Accomplishments, Interests, Network and Social connections.',
      'Save changes \u2014 they update the roster for everyone and your networking card for other members.',
    ],
  },
  {
    id: 'settings', title: 'Settings', emoji: '\u2699\uFE0F',
    summary: 'Account shortcuts.',
    steps: ['Edit your profile, jump to notifications or help, read about the app, and sign out from here.'],
  },
  {
    id: 'about', title: 'About', emoji: '\u2139\uFE0F',
    summary: 'About Lions Club and this portal.',
    steps: ['Read about Lions Clubs International and your role/access in this app.'],
  },
  {
    id: 'manage', title: 'Manage \u2014 create event & news (officer)', emoji: '\u2795',
    summary: 'How officers create events and publish news.',
    steps: [
      'New event: add a title, type (Signature/Service/Meeting/Fellowship/Other), start and end times, venue, description, optional cause and cover image. Creating it sends a push to every member.',
      'Publish news: add a headline, tag, excerpt, full body, optional cover image, and choose whether to publish immediately (which notifies members) or save as draft.',
    ],
    tips: ['Only President, Secretary and Treasurer can publish. These actions appear under the Officer section of the menu.'],
  },
  {
    id: 'attendance', title: 'Attendance (officer)', emoji: '\u2705',
    summary: 'Mark who attended an event.',
    steps: [
      'Choose an event from the dropdown.',
      'The full roster appears with each member\u2019s RSVP status. Tick "Present" for those who attended.',
      'Attendance is saved as you go and feeds the club\u2019s records.',
    ],
  },
  {
    id: 'addmember', title: 'Add member (officer)', emoji: '\uD83D\uDC64',
    summary: 'Register a new Lion so they can log in.',
    steps: [
      'Fill in name, role, designation, profession, business, area, joined year, phone and email.',
      'The phone becomes the member\u2019s login number, so enter it carefully.',
      'Save \u2014 the new member can now log in with OTP.',
    ],
  },
  {
    id: 'manageroster', title: 'Manage roster (officer)', emoji: '\uD83D\uDC65',
    summary: 'Keep the roster current.',
    steps: ['View all active members. Use the trash icon to deactivate a member (keeps their history, removes them from the active list). Use "Add member" to register someone new.'],
  },
  {
    id: 'broadcast', title: 'Broadcast (officer)', emoji: '\uD83D\uDCE3',
    summary: 'Send an urgent alert to the whole club.',
    steps: ['Add a title and optional message, then send. Every member receives a push notification and an inbox entry. Use sparingly for important updates.'],
  },
];

export const GUIDE_FAQS: GuideFAQ[] = [
  { category: 'Account', q: 'How do I log in?', a: 'Enter the phone number registered with the club (with country code), request a code, and enter the 6-digit code sent by SMS. Only registered members can log in.' },
  { category: 'Account', q: 'I didn\u2019t receive an OTP / my phone is not accepted', a: 'Only numbers listed in the club roster work. Ask a club officer to add your number (Add Member) or correct it. If SMS is still being set up, contact the Secretary for a temporary login.' },
  { category: 'Account', q: 'Who can edit club data?', a: 'Only officers \u2014 President, Secretary and Treasurer \u2014 can create events, publish news, log projects, add members, mark attendance and broadcast. Everyone else has read-only access.' },
  { category: 'Account', q: 'Why can\u2019t I see the Officer section?', a: 'That section only appears for members whose role has editing rights. If you should be an officer and don\u2019t see it, ask another officer to set your role.' },
  { category: 'Account', q: 'How do I change my phone number or email?', a: 'Open My Profile \u2192 Edit profile, update your phone/email and save. Your login uses your phone number, so keep it current.' },
  { category: 'Members', q: 'What can I search members by?', a: 'Name, profession, business, area, designation, email, phone or role. The same search works on the Roster, Find a Lion and Business Directory.' },
  { category: 'Networking', q: 'What are the E-GAINS fields?', a: 'E-GAINS stands for Expertise, Goals, Accomplishments, Interests, Network and Social connections. Fill them in My Profile \u2192 Edit profile so other members can see what you do and network with you.' },
  { category: 'Networking', q: 'How do I add my E-GAINS / networking details?', a: 'Open My Profile \u2192 Edit profile and scroll to the Networking (E-GAINS) section. Fill any of the six fields and save. They appear on your member profile page.' },
  { category: 'Networking', q: 'Who can see my E-GAINS?', a: 'Any authenticated club member viewing your profile. A field only shows once you have added content to it; empty fields stay hidden.' },
  { category: 'Events', q: 'How do I RSVP to an event?', a: 'Open the event from Events (or the Dashboard) and choose Yes, Maybe, or Can\u2019t make it. Your response updates the "going" count and the attendees list.' },
  { category: 'Events', q: 'Can I change my RSVP later?', a: 'Yes \u2014 reopen the event and pick a different option. It replaces your previous response.' },
  { category: 'Photos', q: 'How do I upload a photo?', a: 'On the Photo Gallery (or a project\u2019s gallery), tap Upload, choose an image from your device and add an optional caption. Only officers can upload.' },
  { category: 'Photos', q: 'What image formats and sizes are allowed?', a: 'JPG, PNG and WebP, up to 8 MB. Larger images should be resized before uploading.' },
  { category: 'Service', q: 'How do I log a service project?', a: 'Open Service Impact \u2192 Log project, pick a cause, add a title, units served, amount spent, date and notes. It immediately updates the impact totals.' },
  { category: 'Service', q: 'What are "causes"?', a: 'Lions International Global Causes (e.g. sight, hunger, diabetes, environment, childhood cancer). Projects are tagged to a cause so impact is aggregated.' },
  { category: 'Chats', q: 'How do I start a group chat?', a: 'In Chats \u2192 New chat, pick more than one member. You can give the group a title. A single member creates a direct (1:1) chat.' },
  { category: 'Notifications', q: 'Why don\u2019t I get push notifications on the web?', a: 'Web browsers don\u2019t receive Expo push. On the web, use the Notifications inbox to see your history. The mobile app receives device push for new events, news, broadcasts and chats.' },
  { category: 'Notifications', q: 'How do I mark notifications as read?', a: 'Open Notifications \u2014 the list marks itself read automatically. You can also tap "Mark all read".' },
  { category: 'Members', q: 'How do I refer a new member?', a: 'Open Refer a Lion, fill in the candidate\u2019s details and submit. Officers review and update the status through to induction.' },
  { category: 'Members', q: 'How do I add a member so they can log in?', a: 'Officers use Add Member to register a new Lion with their role and phone. The phone becomes their login number.' },
  { category: 'Privacy', q: 'Who can see my details?', a: 'Only authenticated members of your club. Personal details are visible to fellow members for club purposes. Editing is restricted by role.' },
  { category: 'Troubleshooting', q: 'The app shows "server down" or won\u2019t load data', a: 'Check your internet connection. If it persists, the club server may be restarting \u2014 wait a minute and refresh. If still failing, contact the Secretary.' },
  { category: 'Troubleshooting', q: 'I\u2019m stuck \u2014 how do I get help?', a: 'Use the "Contact Secretary" link at the bottom of this page, or speak to a club officer. They can update your profile or role.' },
];