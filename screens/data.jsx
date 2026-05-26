// Lions Club Ahmedabad — Mock Data
// Placeholder roster; Claude Code: replace with real directory import.

const MEMBERS = [
  { id: 1,  name: 'Lion Rajesh Patel',     role: 'President',         designation: 'PMJF',  profession: 'Chartered Accountant',  business: 'Patel & Associates',      area: 'Satellite',         phone: '+91 98250 12345', email: 'rajesh.patel@example.com', joined: 2008, dob: 'Mar 14', anniv: 'Nov 22', spouse: 'Anita Patel',  initials: 'RP', color: '#8B1A3B' },
  { id: 2,  name: 'Lion Anand Shah',        role: 'Secretary',         designation: 'MJF',   profession: 'Textile Exporter',      business: 'Shah Exports Pvt Ltd',    area: 'Navrangpura',       phone: '+91 98980 23456', email: 'anand.shah@example.com',   joined: 2011, dob: 'Jul 02', anniv: 'Feb 11', spouse: 'Reena Shah',   initials: 'AS', color: '#003F87' },
  { id: 3,  name: 'Lion Vikram Mehta',      role: 'Treasurer',         designation: 'MJF',   profession: 'Banker',                business: 'HDFC Bank',               area: 'Bodakdev',          phone: '+91 99090 34567', email: 'vikram.mehta@example.com', joined: 2014, dob: 'Sep 28', anniv: 'Apr 05', spouse: 'Priya Mehta',  initials: 'VM', color: '#1F5F3F' },
  { id: 4,  name: 'Lion Dr. Hiral Joshi',   role: '1st Vice President',designation: 'MJF',   profession: 'Pediatrician',          business: 'Joshi Child Care',        area: 'Vastrapur',         phone: '+91 98240 45678', email: 'hiral.joshi@example.com',  joined: 2012, dob: 'Jan 19', anniv: 'Dec 03', spouse: 'Dr. Nikhil Joshi', initials: 'HJ', color: '#003F87' },
  { id: 5,  name: 'Lion Bharat Desai',      role: '2nd Vice President',designation: 'PMJF',  profession: 'Real Estate',           business: 'Desai Developers',        area: 'Prahladnagar',      phone: '+91 98253 56789', email: 'bharat.desai@example.com', joined: 2009, dob: 'May 06', anniv: 'Jun 14', spouse: 'Sonal Desai',  initials: 'BD', color: '#003F87' },
  { id: 6,  name: 'Lion Kirit Amin',        role: 'Membership Chair',  designation: 'MJF',   profession: 'Pharmaceuticals',       business: 'Amin Pharma',             area: 'Thaltej',           phone: '+91 98255 67890', email: 'kirit.amin@example.com',   joined: 2015, dob: 'Aug 21', anniv: 'Jan 28', spouse: 'Falguni Amin', initials: 'KA', color: '#6B7785' },
  { id: 7,  name: 'Lion Meera Trivedi',     role: 'Service Chair',     designation: 'MJF',   profession: 'School Principal',      business: 'Vidya Mandir School',     area: 'Paldi',             phone: '+91 98257 78901', email: 'meera.trivedi@example.com',joined: 2016, dob: 'Oct 12', anniv: 'Mar 19', spouse: 'Suresh Trivedi',initials: 'MT', color: '#6B7785' },
  { id: 8,  name: 'Lion Nilesh Shukla',     role: 'Tail Twister',      designation: '—',     profession: 'Auto Dealer',           business: 'Shukla Motors',           area: 'Maninagar',         phone: '+91 98259 89012', email: 'nilesh.shukla@example.com',joined: 2018, dob: 'Feb 25', anniv: 'Aug 30', spouse: 'Heena Shukla', initials: 'NS', color: '#6B7785' },
  { id: 9,  name: 'Lion Parul Bhatt',       role: 'Member',            designation: '—',     profession: 'Architect',             business: 'Bhatt Design Studio',     area: 'CG Road',           phone: '+91 98260 90123', email: 'parul.bhatt@example.com',  joined: 2019, dob: 'Nov 08', anniv: 'May 16', spouse: 'Ravi Bhatt',   initials: 'PB', color: '#6B7785' },
  { id: 10, name: 'Lion Sandeep Gandhi',    role: 'Member',            designation: '—',     profession: 'IT Consultant',         business: 'TechWave Solutions',      area: 'SG Highway',        phone: '+91 98261 01234', email: 'sandeep.gandhi@example.com',joined:2020, dob: 'Jun 30', anniv: 'Oct 09', spouse: 'Komal Gandhi',  initials: 'SG', color: '#6B7785' },
  { id: 11, name: 'Lion Tejas Patel',       role: 'Member',            designation: '—',     profession: 'Jeweller',              business: 'Patel Jewels',            area: 'Manek Chowk',       phone: '+91 98262 12340', email: 'tejas.patel@example.com',  joined: 2017, dob: 'Apr 17', anniv: 'Sep 21', spouse: 'Janki Patel',  initials: 'TP', color: '#6B7785' },
  { id: 12, name: 'Lion Dr. Arvind Kapadia',role: 'Member',            designation: 'MJF',   profession: 'Orthopedic Surgeon',    business: 'Kapadia Ortho Hospital',  area: 'Ellis Bridge',      phone: '+91 98263 23451', email: 'arvind.kapadia@example.com',joined:2010,dob: 'Dec 11', anniv: 'Jul 04', spouse: 'Dr. Reshma Kapadia', initials: 'AK', color: '#6B7785' },
];

const EVENTS = [
  { id: 1, title: 'Charter Night 2026 — 17th Installation',     date: 'Jun 14, 2026', day: '14', month: 'JUN', time: '7:30 PM', venue: 'Hyatt Regency, Ashram Road', type: 'Signature', going: 78, status: 'rsvp-yes' },
  { id: 2, title: 'Eye Camp — Free Cataract Screening',          date: 'Jun 22, 2026', day: '22', month: 'JUN', time: '9:00 AM', venue: 'Civil Hospital, Asarwa',      type: 'Service',   going: 24, status: 'rsvp-yes' },
  { id: 3, title: 'Monthly Board Meeting',                        date: 'Jul 02, 2026', day: '02', month: 'JUL', time: '8:00 PM', venue: 'Club House, Navrangpura',    type: 'Meeting',   going: 12, status: 'pending' },
  { id: 4, title: 'Tree Plantation Drive — Sabarmati Riverfront',date: 'Jul 11, 2026', day: '11', month: 'JUL', time: '6:30 AM', venue: 'Sabarmati Riverfront West',   type: 'Service',   going: 41, status: 'pending' },
  { id: 5, title: 'Fellowship Dinner with Guest DG',              date: 'Jul 19, 2026', day: '19', month: 'JUL', time: '7:00 PM', venue: 'The House of MG',             type: 'Fellowship',going: 56, status: 'pending' },
  { id: 6, title: 'Blood Donation Camp',                          date: 'Aug 03, 2026', day: '03', month: 'AUG', time: '10:00 AM',venue: 'Red Cross Bhavan, Naranpura',type: 'Service',   going: 33, status: 'pending' },
];

const NEWS = [
  { id: 1, title: 'Club crosses ₹42 lakh in service projects this year', tag: 'Milestone',  ago: '2h',  excerpt: 'Combined impact of our eye camps, school-kit drives and tree plantation programs.' },
  { id: 2, title: 'DG Lion Pradeep Mehta visits Ahmedabad on Aug 24',    tag: 'Visit',      ago: '1d',  excerpt: 'The District Governor will address members at a fellowship dinner.' },
  { id: 3, title: 'Vision First — 320 cataract surgeries sponsored',     tag: 'Service',    ago: '3d',  excerpt: 'Partnership with C.H. Nagri Eye Hospital concludes Phase II.' },
  { id: 4, title: 'New member induction — welcome 4 new Lions',          tag: 'Membership', ago: '1w',  excerpt: 'Inducted at the June stated meeting. Read their introductions.' },
];

const CAUSES = [
  { id: 'vision',     name: 'Vision',              icon: '👁',  units: '3,420', unitLabel: 'screenings this year', color: '#003F87' },
  { id: 'hunger',     name: 'Hunger Relief',       icon: '🍱',  units: '12,800',unitLabel: 'meals served',         color: '#C8362D' },
  { id: 'environment',name: 'Environment',         icon: '🌳',  units: '1,180', unitLabel: 'trees planted',        color: '#1F8A5B' },
  { id: 'diabetes',   name: 'Diabetes',            icon: '💉',  units: '640',   unitLabel: 'tests sponsored',      color: '#7A3FB8' },
  { id: 'cancer',     name: 'Pediatric Cancer',    icon: '🎗',  units: '₹4.2L', unitLabel: 'raised',               color: '#E08E1A' },
  { id: 'education',  name: 'Education',           icon: '📚',  units: '420',   unitLabel: 'kits distributed',     color: '#2A6FDB' },
];

const NOTIFICATIONS = [
  { id: 1, type: 'event',   title: 'Charter Night RSVP closes tomorrow',  ago: '2h',  unread: true,  icon: '📅' },
  { id: 2, type: 'birthday',title: "Lion Vikram Mehta's birthday today",   ago: '8h',  unread: true,  icon: '🎂' },
  { id: 3, type: 'message', title: 'Secretary Anand Shah sent a message',  ago: '1d',  unread: false, icon: '💬' },
  { id: 4, type: 'service', title: 'Eye Camp — your slot confirmed',       ago: '2d',  unread: false, icon: '✓' },
  { id: 5, type: 'news',    title: 'New club announcement posted',         ago: '3d',  unread: false, icon: '📰' },
];

window.LCData = { MEMBERS, EVENTS, NEWS, CAUSES, NOTIFICATIONS };
