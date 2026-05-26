import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import RosterScreen from '../screens/main/RosterScreen';
import EventsScreen from '../screens/main/EventsScreen';
import NewsScreen from '../screens/main/NewsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { T } from '../theme/tokens';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: T.brandBlue,
        tabBarInactiveTintColor: T.inkFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: T.surface, borderTopColor: T.line, height: 64, paddingTop: 6, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          const icon = ({
            Home: 'home',
            Roster: 'people',
            Events: 'calendar',
            News: 'newspaper',
            Profile: 'person-circle',
          } as Record<string, any>)[route.name] ?? 'ellipse';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Roster" component={RosterScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
