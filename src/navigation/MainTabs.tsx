import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import { MainTabParamList } from '../types';

import DashboardScreen from '../screens/DashboardScreen';
import NutriScanScreen from '../screens/NutriScanScreen';
import CoachScreen from '../screens/CoachScreen';
import JourneyScreen from '../screens/JourneyScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { focused: string; unfocused: string }> = {
  Hoje: { focused: 'home', unfocused: 'home-outline' },
  NutriScan: { focused: 'nutrition', unfocused: 'nutrition-outline' },
  Coach: { focused: 'barbell', unfocused: 'barbell-outline' },
  Jornada: { focused: 'trending-up', unfocused: 'trending-up-outline' },
  Perfil: { focused: 'person', unfocused: 'person-outline' },
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          const iconName = focused ? icons.focused : icons.unfocused;
          return (
            <View style={styles.iconWrapper}>
              {focused && <View style={styles.activeIndicator} />}
              <Icon name={iconName} size={size * 0.85} color={color} />
            </View>
          );
        },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accentLight,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}>
      <Tab.Screen name="Hoje" component={DashboardScreen} />
      <Tab.Screen name="NutriScan" component={NutriScanScreen} />
      <Tab.Screen name="Coach" component={CoachScreen} />
      <Tab.Screen name="Jornada" component={JourneyScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});

export default MainTabs;
