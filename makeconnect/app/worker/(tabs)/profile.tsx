import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';
import { useLanguage } from '../../../context/LanguageContext';
import { registerForPushNotificationsAsync, savePushTokenToBackend } from '../../../services/NotificationService';

export default function WorkerProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                router.replace('/auth/roleselectionscreen');
                return;
            }
            const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`);
            const data = await response.json();
            if (data.success) {
                setUserData(data.user);

                // Register for push notifications
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken) {
                    await savePushTokenToBackend(userId, pushToken);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            t('common.logout'),
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: t('common.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace('/auth/roleselectionscreen');
                    }
                }
            ]
        );
    };

    const renderMenuItem = (icon: any, label: string, onPress?: () => void, isLast = false, IconComponent = Ionicons) => (
        <TouchableOpacity
            style={[styles.menuItem, isLast && styles.menuItemNoBorder]}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                    <IconComponent name={icon} size={22} color="#FFF" />
                </View>
                <Text style={styles.menuItemLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );

    if (loading && !userData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {userData?.profileImage ? (
                            <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={60} color="#666" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>{userData?.name || 'Worker Name'}</Text>

                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={() => router.push('/worker/editprofile')}
                    >
                        <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <Text style={styles.sectionLabel}>{t('profile.account')}</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('tools', t('profile.myServices'), () => router.push('/worker/services'), false, MaterialCommunityIcons as any)}
                    {renderMenuItem('location-outline', t('profile.serviceLocation'), () => router.push('/worker/setlocation'), true)}
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionLabel}>{t('profile.settings')}</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('help-circle', t('profile.helpSupport'), () => router.push('/worker/settings/help'))}
                    {renderMenuItem('earth', t('profile.languages'), () => router.push('/worker/settings/languages'), false, MaterialCommunityIcons as any)}
                    {renderMenuItem('gavel', t('profile.termsConditions'), () => router.push('/worker/settings/terms'), false, MaterialCommunityIcons as any)}
                    {renderMenuItem('shield-account', t('profile.privacyPolicy'), () => router.push('/worker/settings/privacy'), true, MaterialCommunityIcons as any)}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" style={styles.logoutIcon} />
                    <Text style={styles.logoutText}>{t('common.logout')}</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#051405',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#112211',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 15,
    },
    editProfileBtn: {
        backgroundColor: '#1C251C',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2A3A2A',
    },
    editProfileText: {
        color: '#E5E7EB',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionLabel: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    menuGroup: {
        backgroundColor: '#0A1A0A',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#112211',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#112211',
    },
    menuItemNoBorder: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemLabel: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    logoutBtn: {
        backgroundColor: '#1C1616',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#2D1A1A',
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 18,
        fontWeight: '700',
    },
});
