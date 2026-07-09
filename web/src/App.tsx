import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Shell } from './components/Shell';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Roster from './screens/Roster';
import MemberDetail from './screens/MemberDetail';
import Events from './screens/Events';
import EventDetail from './screens/EventDetail';
import News from './screens/News';
import NewsDetail from './screens/NewsDetail';
import Profile from './screens/Profile';
import Manage from './screens/Manage';
import Notifications from './screens/Notifications';
import Impact from './screens/Impact';
import Projects from './screens/Projects';
import Awards from './screens/Awards';
import Photos from './screens/Photos';
import Chats from './screens/Chats';
import ChatThread from './screens/ChatThread';
import Minutes from './screens/Minutes';
import Broadcast from './screens/Broadcast';
import Attendance from './screens/Attendance';
import AddMember from './screens/AddMember';
import ManageRoster from './screens/ManageRoster';
import Refer from './screens/Refer';
import Directory from './screens/Directory';
import Find from './screens/Find';
import Charter from './screens/Charter';
import DistrictNews from './screens/DistrictNews';
import Help from './screens/Help';
import About from './screens/About';
import History from './screens/History';
import HistoryAdmin from './screens/HistoryAdmin';
import Settings from './screens/Settings';
import Admin from './screens/Admin';
import Meetings from './screens/Meetings';
import MeetingDetail from './screens/MeetingDetail';
import AdManagement from './screens/AdManagement';

export default function App() {
  const { access, hydrate, ready } = useAuth();
  useEffect(() => { hydrate(); }, []);

  if (!ready) return <div className="center" style={{ minHeight: '100vh', background: 'var(--navy)' }}><div className="spinner" style={{ borderTopColor: 'var(--gold)' }} /></div>;
  if (!access) return <Login />;

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:id" element={<ChatThread />} />
        <Route path="/minutes" element={<Minutes />} />
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/manage-roster" element={<ManageRoster />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/find" element={<Find />} />
        <Route path="/charter" element={<Charter />} />
        <Route path="/district-news" element={<DistrictNews />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/history-admin" element={<HistoryAdmin />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/meetings/:id" element={<MeetingDetail />} />
        <Route path="/ads" element={<AdManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}