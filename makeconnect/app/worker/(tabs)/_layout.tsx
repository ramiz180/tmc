import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';

export default function WorkerLayout() {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: '#111827',
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: '#1F2937',
                    height: 65 + insets.bottom / 2,
                    paddingBottom: insets.bottom / 2,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                },
                tabBarActiveTintColor: '#00E5A0',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 5,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="services"
                options={{
                    title: t('tabs.services'),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="tools" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: t('tabs.chat'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: t('tabs.bookings'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('tabs.profile'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="addservice"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />
            <Tabs.Screen
                name="editprofile"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />
            <Tabs.Screen
                name="setlocation"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />
        </Tabs>
    );
}
