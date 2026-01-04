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

export default function CustomerProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace('/auth/roleselectionscreen');
                    }
                }
            ]
        );
    };

    const renderMenuItem = (icon: any, label: string, onPress?: () => void, IconComponent: any = Ionicons) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                    <IconComponent name={icon} size={20} color="#00E5A0" />
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
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {userData?.profileImage ? (
                            <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={50} color="#666" />
                            </View>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{userData?.name || 'Customer Name'}</Text>
                        <Text style={styles.userEmail}>{userData?.phone || userData?.email || 'No contact info'}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editProfileBtn}
                    onPress={() => router.push('/customer/editprofile')}
                >
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>

                {/* Account Section */}
                <Text style={styles.sectionLabel}>Account</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('calendar-check', 'My Bookings', () => router.push('/customer/(tabs)/bookings'), MaterialCommunityIcons)}
                    {renderMenuItem('credit-card', 'Payment Methods', undefined, MaterialCommunityIcons)}
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionLabel}>Settings</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('help-circle', 'Help & Support')}
                    {renderMenuItem('globe-outline', 'Language')}
                    {renderMenuItem('document-text-outline', 'Terms & Conditions')}
                    {renderMenuItem('shield-checkmark-outline', 'Privacy Policy')}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#F87171" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 35,
        backgroundColor: '#0A0A0A',
        padding: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#111',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: '#111827',
        borderWidth: 2,
        borderColor: '#00E5A0',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 20,
        flex: 1,
    },
    userName: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 6,
    },
    userEmail: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
    },
    editProfileBtn: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 45,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#00E5A0',
    },
    editProfileText: {
        color: '#00E5A0',
        fontSize: 17,
        fontWeight: '800',
    },
    sectionLabel: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 20,
        letterSpacing: 0.5,
    },
    menuGroup: {
        marginBottom: 40,
        gap: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#111',
    },
    menuItemLabel: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        marginTop: 10,
        gap: 12,
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.2)',
    },
    logoutText: {
        color: '#F87171',
        fontSize: 18,
        fontWeight: '900',
    },
});
