import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../lib/auth';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import MemberDetailScreen from '../screens/main/MemberDetailScreen';
import EventDetailScreen from '../screens/main/EventDetailScreen';
import NewsDetailScreen from '../screens/main/NewsDetailScreen';
import ProfileEditScreen from '../screens/main/ProfileEditScreen';
import OfficerAdminScreen from '../screens/main/OfficerAdminScreen';
import ServiceContentScreen from '../screens/main/ServiceContentScreen';
import InfoScreen from '../screens/main/InfoScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import AddMemberScreen from '../screens/main/AddMemberScreen';
import AttendanceScreen from '../screens/main/AttendanceScreen';
import BroadcastScreen from '../screens/main/BroadcastScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import RosterAdminScreen from '../screens/main/RosterAdminScreen';
import ChatListScreen from '../screens/main/ChatListScreen';
import ChatThreadScreen from '../screens/main/ChatThreadScreen';
import BusinessDirectoryScreen from '../screens/main/BusinessDirectoryScreen';
import FindMemberScreen from '../screens/main/FindMemberScreen';
import MeetingMinutesScreen from '../screens/main/MeetingMinutesScreen';
import AwardsWallScreen from '../screens/main/AwardsWallScreen';
import CharterInviteScreen from '../screens/main/CharterInviteScreen';
import OnboardingScreen from '../screens/main/OnboardingScreen';
import HelpFAQScreen from '../screens/main/HelpFAQScreen';
import ReferLionScreen from '../screens/main/ReferLionScreen';
import DistrictNewsScreen from '../screens/main/DistrictNewsScreen';
import ProjectDetailScreen from '../screens/main/ProjectDetailScreen';
import LogProjectScreen from '../screens/main/LogProjectScreen';
import PhotoGalleryScreen from '../screens/main/PhotoGalleryScreen';
import PastEventRecapScreen from '../screens/main/PastEventRecapScreen';
import AdminScreen from '../screens/main/AdminScreen';
import MeetingListScreen from '../screens/main/MeetingListScreen';
import MeetingDetailScreen from '../screens/main/MeetingDetailScreen';
import MeetingRecorderScreen from '../screens/main/MeetingRecorderScreen';
import MeetingUploadScreen from '../screens/main/MeetingUploadScreen';

export type RootStackParamList = {
  Main: undefined;
  MemberDetail: { id: number };
  EventDetail: { id: number };
  NewsDetail: { id: number };
  ProfileEdit: undefined;
  OfficerAdmin: undefined;
  ServiceContent: { causeId?: string };
  Info: undefined;
  Notifications: undefined;
  AddMember: undefined;
  Attendance: undefined;
  Broadcast: undefined;
  Settings: undefined;
  RosterAdmin: undefined;
  Chats: undefined;
  ChatThread: { id: number };
  BusinessDirectory: undefined;
  FindMember: undefined;
  MeetingMinutes: undefined;
  AwardsWall: undefined;
  CharterInvite: undefined;
  Onboarding: undefined;
  HelpFAQ: undefined;
  ReferLion: undefined;
  DistrictNews: undefined;
  ProjectDetail: { id?: number; causeId?: string };
  LogProject: { causeId?: string };
  PhotoGallery: undefined;
  PastEventRecap: { id: number };
  Admin: undefined;
  MeetingList: undefined;
  MeetingDetail: { id: number };
  MeetingRecorder: undefined;
  MeetingUpload: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { access } = useAuth();
  if (!access) return <AuthStack />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="OfficerAdmin" component={OfficerAdminScreen} />
      <Stack.Screen name="ServiceContent" component={ServiceContentScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Broadcast" component={BroadcastScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="RosterAdmin" component={RosterAdminScreen} />
      <Stack.Screen name="Chats" component={ChatListScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      <Stack.Screen name="BusinessDirectory" component={BusinessDirectoryScreen} />
      <Stack.Screen name="FindMember" component={FindMemberScreen} />
      <Stack.Screen name="MeetingMinutes" component={MeetingMinutesScreen} />
      <Stack.Screen name="AwardsWall" component={AwardsWallScreen} />
      <Stack.Screen name="CharterInvite" component={CharterInviteScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
      <Stack.Screen name="ReferLion" component={ReferLionScreen} />
      <Stack.Screen name="DistrictNews" component={DistrictNewsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="LogProject" component={LogProjectScreen} />
      <Stack.Screen name="PhotoGallery" component={PhotoGalleryScreen} />
      <Stack.Screen name="PastEventRecap" component={PastEventRecapScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="MeetingList" component={MeetingListScreen} />
      <Stack.Screen name="MeetingDetail" component={MeetingDetailScreen} />
      <Stack.Screen name="MeetingRecorder" component={MeetingRecorderScreen} />
      <Stack.Screen name="MeetingUpload" component={MeetingUploadScreen} />
    </Stack.Navigator>
  );
}
