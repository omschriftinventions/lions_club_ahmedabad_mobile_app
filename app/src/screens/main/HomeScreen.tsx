import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import Svg, { Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Pill } from '../../components/Pill';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { T } from '../../theme/tokens';
import { AdCarousel } from '../../components/AdCarousel';
import { Linking } from 'react-native';

interface ImpactRow { id: string; name: string; icon: string; color: string; units: number; amount_inr: number; }
interface EventRow { id: number; title: string; type: string; starts_at: string; venue: string; going: number; my_status: string | null; }
interface NewsRow { id: number; title: string; tag: string; excerpt: string; published_at: string; }

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { member, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const go = (route: string, params?: any) => { closeMenu(); nav.navigate(route, params); };

  const impact = useQuery({
    queryKey: ['impact'],
    queryFn: () => api.get<{ impact: ImpactRow[] }>('/causes/impact'),
  });
  const events = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => api.get<{ events: EventRow[] }>('/events?upcoming=true&limit=5'),
  });
  const news = useQuery({
    queryKey: ['news', 'recent'],
    queryFn: () => api.get<{ news: NewsRow[] }>('/news?limit=4'),
  });

  return (
    <Screen bg={T.bg}>
      {/* Hero */}
      <LinearGradient colors={[T.brandBlueDeep, T.brandBlue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: 12, paddingBottom: 80, paddingHorizontal: 20, marginHorizontal: -0, position: 'relative' }}>
        <Svg width={280} height={280} viewBox="0 0 280 280" style={{ position: 'absolute', top: -80, right: -80, opacity: 0.07 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <Line key={i} x1="140" y1="140" x2="140" y2="20" stroke={T.brandGold} strokeWidth="3" transform={`rotate(${i * 22.5} 140 140)`}/>
          ))}
        </Svg>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
              <Ionicons name="menu" size={26} color="#fff" />
            </Pressable>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>DISTRICT 3232 B1</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1 }}>Ahmedabad host (Main)</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <Pressable onPress={() => nav.navigate('Notifications')} hitSlop={10}>
              <Ionicons name="notifications" size={22} color="#fff" />
            </Pressable>
            <Pressable onPress={() => nav.navigate('Main', { screen: 'Profile' })}>
              <Avatar initials={(member?.name ?? 'L L').split(' ').slice(-2).map(w => w[0]).join('')} size={32} color={T.rolePresident} />
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Good morning,</Text>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.4, marginTop: 2 }}>{member?.name}</Text>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(255,209,0,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignItems: 'center', gap: 6 }}>
            <Ionicons name="ribbon" size={12} color={T.brandGold} />
            <Text style={{ color: T.brandGold, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{member?.superAdmin ? 'SUPER ADMIN' : (member?.role ?? 'MEMBER').toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Impact card */}
      <View style={{ paddingHorizontal: 16, marginTop: -56 }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: T.inkMute, letterSpacing: 1 }}>OUR IMPACT · 2025–26</Text>
              <Text style={{ fontSize: 19, fontWeight: '800', color: T.ink, marginTop: 2 }}>Service progress</Text>
            </View>
            <Pressable onPress={() => nav.navigate('ServiceContent', {})}><Ionicons name="chevron-forward" size={16} color={T.inkFaint} /></Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {impact.isLoading
              ? <ActivityIndicator color={T.brandBlue} />
              : (impact.data?.impact ?? []).slice(0, 3).map(c => (
                <View key={c.id} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: c.color }}>{c.units || 0}</Text>
                  <Text style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>{c.name.toLowerCase()}</Text>
                </View>
              ))}
          </View>
        </Card>
      </View>

      {/* Advertisements */}
      <View style={{ paddingHorizontal: 0, paddingTop: 12, paddingBottom: 4 }}>
        <AdCarousel placement="dashboard" onPressLink={(url) => Linking.openURL(url).catch(() => {})} />
      </View>

      {/* Upcoming events */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, letterSpacing: -0.3 }}>Upcoming Events</Text>
          <Pressable onPress={() => nav.navigate('Main', { screen: 'Events' })}>
            <Text style={{ fontSize: 13, color: T.brandBlue, fontWeight: '600' }}>See all</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        horizontal
        data={events.data?.events ?? []}
        keyExtractor={e => String(e.id)}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate('EventDetail', { id: item.id })} style={{ width: 260 }}>
            <Card pad={14}>
              <Pill label={item.type} color={item.type === 'Service' ? T.success : T.brandBlue} />
              <Text style={{ marginTop: 10, fontWeight: '800', color: T.ink, fontSize: 15 }} numberOfLines={2}>{item.title}</Text>
              <Text style={{ marginTop: 6, color: T.inkMute, fontSize: 12 }}>{new Date(item.starts_at).toLocaleString()}</Text>
              <Text style={{ color: T.inkMute, fontSize: 12 }} numberOfLines={1}>{item.venue}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <Text style={{ color: T.inkSoft, fontSize: 12 }}>{item.going} going</Text>
                <Text style={{ color: item.my_status === 'yes' ? T.success : T.inkFaint, fontWeight: '700', fontSize: 12 }}>
                  {item.my_status === 'yes' ? 'You\'re in' : 'Tap to RSVP'}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
      />

      {/* News */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: T.ink, marginBottom: 12 }}>From the Club</Text>
        {(news.data?.news ?? []).map(n => (
          <Pressable key={n.id} onPress={() => nav.navigate('NewsDetail', { id: n.id })} style={{ marginBottom: 12 }}>
            <Card pad={14}>
              <Pill label={n.tag || 'News'} color={T.brandBlue} />
              <Text style={{ marginTop: 8, fontWeight: '700', color: T.ink }}>{n.title}</Text>
              <Text style={{ marginTop: 4, color: T.inkMute, fontSize: 13 }} numberOfLines={2}>{n.excerpt}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Left-slide menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable onPress={closeMenu} style={{ flex: 1, backgroundColor: 'rgba(10,22,40,0.45)' }}>
          <Pressable onPress={() => {}} style={{
            width: 280, height: '100%', backgroundColor: T.surface,
            paddingTop: 60, paddingHorizontal: 20,
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 4, height: 0 },
            elevation: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <Avatar
                initials={(member?.name ?? 'L L').split(' ').slice(-2).map(w => w[0]).join('')}
                size={48}
                color={member?.canEdit ? T.rolePresident : T.inkMute}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: T.ink, fontSize: 15 }} numberOfLines={1}>{member?.name}</Text>
                <Text style={{ color: T.inkMute, fontSize: 12, marginTop: 2 }}>{member?.role}</Text>
              </View>
            </View>

            <MenuRow icon="home"            label="Home"             onPress={closeMenu} />
            <MenuRow icon="people"          label="Roster"           onPress={() => go('Main', { screen: 'Roster' })} />
            <MenuRow icon="calendar"        label="Events"           onPress={() => go('Main', { screen: 'Events' })} />
            <MenuRow icon="newspaper"       label="News"             onPress={() => go('Main', { screen: 'News' })} />
            <MenuRow icon="notifications"   label="Notifications"    onPress={() => go('Notifications')} />
            <MenuRow icon="chatbubbles"     label="Chats"            onPress={() => go('Chats')} />
            <MenuRow icon="search"          label="Find a Lion"      onPress={() => go('FindMember')} />
            <MenuRow icon="briefcase"       label="Business directory" onPress={() => go('BusinessDirectory')} />
            <MenuRow icon="heart-circle"    label="Service impact"   onPress={() => go('ServiceContent', {})} />
            <MenuRow icon="images"          label="Photo gallery"    onPress={() => go('PhotoGallery')} />
            <MenuRow icon="document-text"   label="Meeting minutes"  onPress={() => go('MeetingMinutes')} />
<MenuRow icon="mic"              label="AI Meeting Assistant" onPress={() => go('MeetingList')} />
            <MenuRow icon="trophy"          label="Awards wall"      onPress={() => go('AwardsWall')} />
            <MenuRow icon="globe"           label="District news"    onPress={() => go('DistrictNews')} />
            <MenuRow icon="person-add"      label="Refer a Lion"     onPress={() => go('ReferLion')} />
            <MenuRow icon="ribbon"          label="Charter invite"   onPress={() => go('CharterInvite')} />
            <MenuRow icon="person-circle"   label="My profile"       onPress={() => go('Main', { screen: 'Profile' })} />
            <MenuRow icon="settings"        label="Settings"         onPress={() => go('Settings')} />

            {member?.canEdit && (
              <>
                <View style={{ height: 1, backgroundColor: T.line, marginVertical: 12 }} />
                <Text style={{ color: T.inkFaint, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginLeft: 4, marginBottom: 6 }}>OFFICER</Text>
                <MenuRow icon="shield-checkmark"   label="Create event / news" onPress={() => go('OfficerAdmin')} />
                <MenuRow icon="person-add"         label="Add member"          onPress={() => go('AddMember')} />
                <MenuRow icon="people-circle"      label="Manage roster"       onPress={() => go('RosterAdmin')} />
                <MenuRow icon="checkbox"           label="Mark attendance"     onPress={() => go('Attendance')} />
                <MenuRow icon="megaphone"          label="Broadcast"           onPress={() => go('Broadcast')} />
              </>
            )}

            {member?.superAdmin && (
              <>
                <View style={{ height: 1, backgroundColor: T.line, marginVertical: 12 }} />
                <Text style={{ color: T.inkFaint, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginLeft: 4, marginBottom: 6 }}>SYSTEM</Text>
                <MenuRow icon="shield-checkmark" label="System Admin" onPress={() => go('Admin')} />
<MenuRow icon="heart-circle" label="Manage causes" onPress={() => go('CauseAdmin')} />
<MenuRow icon="images" label="Advertisements" onPress={() => go('AdManagement')} />
              </>
            )}
            <View style={{ height: 1, backgroundColor: T.line, marginVertical: 14 }} />
            <MenuRow icon="help-circle"        label="Help & FAQ" onPress={() => go('HelpFAQ')} />
            <MenuRow icon="information-circle" label="About"      onPress={() => go('Info')} />
            <MenuRow icon="time" label="History" onPress={() => go('History')} />
            <MenuRow icon="log-out" label="Sign out" color={T.danger} onPress={() => { closeMenu(); logout(); }} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const MenuRow: React.FC<{ icon: any; label: string; onPress: () => void; color?: string }> =
  ({ icon, label, onPress, color = T.ink }) => (
  <Pressable onPress={onPress} style={({ pressed }) => ({
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, paddingHorizontal: 4, borderRadius: T.r.sm,
    backgroundColor: pressed ? T.bg : 'transparent',
  })}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={{ fontSize: 15, fontWeight: '600', color }}>{label}</Text>
  </Pressable>
);
