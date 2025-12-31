import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/Config';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#F59E0B';
        case 'accepted': return '#00E5A0';
        case 'completed': return '#3B82F6';
        default: return '#6B7280';
    }
};

export default function WorkerHomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<'available' | 'unavailable'>('available');
    const [activeTab, setActiveTab] = useState('Home');
    const [services, setServices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'Services') {
            fetchMyServices();
        } else if (activeTab === 'Bookings' || activeTab === 'Chat') {
            fetchMyBookings();
        }
    }, [activeTab]);

    const fetchMyServices = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/services/worker/${userId}`);
            const data = await response.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (error) {
            console.error('Error fetching worker services:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/user/${userId}/worker`);
            const data = await response.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching worker bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/status/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                fetchMyBookings();
                Alert.alert('Success', `Booking ${newStatus} successfully!`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update booking status');
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <View style={[styles.dot, styles.dotTop]} />
                        <View style={[styles.dot, styles.dotBottomLeft]} />
                        <View style={[styles.dot, styles.dotBottomRight]} />
                        <View style={[styles.dot, styles.dotCenter]} />
                    </View>
                    <Text style={styles.logoText}>The Make Connect</Text>
                </View>

                <TouchableOpacity
                    style={styles.addServiceBtn}
                    onPress={() => router.push('/worker/addservice')}
                >
                    <Ionicons name="add" size={18} color="#00E5A0" />
                    <Text style={styles.addServiceText}>Add Service</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            {activeTab === 'Home' ? (
                <View style={styles.content}>
                    <Text style={styles.statusLabel}>Set your status</Text>

                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, status === 'available' && styles.toggleBtnActive]}
                            onPress={() => setStatus('available')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, status === 'available' && styles.toggleTextActive]}>
                                Available
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.toggleBtn, status === 'unavailable' && styles.toggleBtnActive]}
                            onPress={() => setStatus('unavailable')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, status === 'unavailable' && styles.toggleTextActive]}>
                                Unavailable
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : activeTab === 'Services' ? (
                <ScrollView
                    style={styles.servicesBody}
                    contentContainerStyle={{ paddingBottom: 150, padding: 20 }}
                >
                    <Text style={styles.sectionTitle}>My Services</Text>
                    {loading ? (
                        <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                    ) : services.length === 0 ? (
                        <Text style={styles.emptyText}>You haven't added any services yet.</Text>
                    ) : (
                        services.map((service) => (
                            <View key={service._id} style={styles.serviceItem}>
                                <View style={styles.serviceMainInfo}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text style={styles.serviceCategory}>{service.category}</Text>
                                    <Text style={styles.servicePrice}>₹{service.price}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.editBtn}
                                    onPress={() => router.push({
                                        pathname: '/worker/addservice',
                                        params: { id: service._id }
                                    })}
                                >
                                    <Ionicons name="create-outline" size={20} color="#00E5A0" />
                                    <Text style={styles.editText}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            ) : activeTab === 'Bookings' ? (
                <ScrollView
                    style={styles.servicesBody}
                    contentContainerStyle={{ paddingBottom: 150, padding: 20 }}
                >
                    <Text style={styles.sectionTitle}>Job Bookings</Text>
                    {loading ? (
                        <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                    ) : bookings.length === 0 ? (
                        <Text style={styles.emptyText}>No bookings received yet.</Text>
                    ) : (
                        bookings.map((booking) => (
                            <View
                                key={booking._id}
                                style={styles.bookingItem}
                            >
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.bookingServiceName}>{booking.serviceId?.name || 'Service'}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                                        <Text style={styles.statusText}>{booking.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.bookingCustomerName}>Customer: {booking.customerId?.name}</Text>
                                <Text style={styles.bookingDate}>{new Date(booking.createdAt).toLocaleDateString()}</Text>

                                {booking.status === 'pending' ? (
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.rejectBtn]}
                                            onPress={() => handleStatusUpdate(booking._id, 'rejected')}
                                        >
                                            <Text style={styles.rejectBtnText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.acceptBtn]}
                                            onPress={() => handleStatusUpdate(booking._id, 'accepted')}
                                        >
                                            <Text style={styles.acceptBtnText}>Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : booking.status === 'accepted' ? (
                                    <TouchableOpacity
                                        style={styles.chatLinkBtn}
                                        onPress={() => router.push(`/chat/${booking._id}`)}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={20} color="#000" />
                                        <Text style={styles.chatLinkText}>Open Chat</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        ))
                    )}
                </ScrollView>
            ) : activeTab === 'Chat' ? (
                <ScrollView
                    style={styles.servicesBody}
                    contentContainerStyle={{ paddingBottom: 150, padding: 20 }}
                >
                    <Text style={styles.sectionTitle}>Messages</Text>
                    {loading ? (
                        <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                    ) : bookings.length === 0 ? (
                        <Text style={styles.emptyText}>No active conversations.</Text>
                    ) : (
                        bookings.map((booking) => (
                            <TouchableOpacity
                                key={booking._id}
                                style={styles.chatListItem}
                                onPress={() => router.push(`/chat/${booking._id}`)}
                            >
                                <View style={styles.chatAvatar}>
                                    <Text style={styles.avatarText}>{booking.customerId?.name?.[0] || 'C'}</Text>
                                </View>
                                <View style={styles.chatInfo}>
                                    <Text style={styles.chatName}>{booking.customerId?.name}</Text>
                                    <Text style={styles.chatLastMsg} numberOfLines={1}>
                                        {booking.chatMessages?.length > 0
                                            ? booking.chatMessages[booking.chatMessages.length - 1].text
                                            : 'Tap to reply...'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            ) : (
                <View style={styles.content}>
                    <Text style={{ color: '#9CA3AF' }}>{activeTab} Screen Coming Soon</Text>
                </View>
            )}

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
                <NavItem
                    icon="home"
                    label="Home"
                    active={activeTab === 'Home'}
                    onPress={() => setActiveTab('Home')}
                />
                <NavItem
                    icon="tools"
                    label="Services"
                    active={activeTab === 'Services'}
                    onPress={() => setActiveTab('Services')}
                    isMaterial
                />
                <NavItem
                    icon="chatbubbles-outline"
                    label="Chat"
                    active={activeTab === 'Chat'}
                    onPress={() => setActiveTab('Chat')}
                />
                <NavItem
                    icon="calendar-outline"
                    label="Bookings"
                    active={activeTab === 'Bookings'}
                    onPress={() => setActiveTab('Bookings')}
                />
                <NavItem
                    icon="person-outline"
                    label="Profile"
                    active={activeTab === 'Profile'}
                    onPress={() => setActiveTab('Profile')}
                />
            </View>
        </View>
    );
}

const NavItem = ({ icon, label, active, onPress, isMaterial }: any) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
        {isMaterial ? (
            <MaterialCommunityIcons name={icon} size={24} color={active ? "#00E5A0" : "#9CA3AF"} />
        ) : (
            <Ionicons name={icon} size={24} color={active ? "#00E5A0" : "#9CA3AF"} />
        )}
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000000",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        width: 24,
        height: 24,
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00E5A0',
    },
    dotTop: { top: 0, left: 9 },
    dotBottomLeft: { bottom: 2, left: 2 },
    dotBottomRight: { bottom: 2, right: 2 },
    dotCenter: { top: 9, left: 9, transform: [{ scale: 0.8 }] },
    logoText: {
        color: '#F9FAFB',
        fontSize: 18,
        fontWeight: '800',
    },
    addServiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 160, 0.2)',
    },
    addServiceText: {
        color: '#00E5A0',
        fontSize: 12,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100, // offset for nav
    },
    statusLabel: {
        color: '#9CA3AF',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#111827',
        padding: 6,
        borderRadius: 40,
        width: width * 0.8,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    toggleBtn: {
        flex: 1,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    toggleBtnActive: {
        backgroundColor: '#00E5A0',
    },
    toggleText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#000000',
        fontWeight: '800',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#111827',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    navLabelActive: {
        color: '#00E5A0',
    },
    servicesBody: {
        flex: 1,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 20,
    },
    serviceItem: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    serviceMainInfo: {
        flex: 1,
    },
    serviceName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    serviceCategory: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 2,
    },
    servicePrice: {
        color: '#00E5A0',
        fontSize: 14,
        fontWeight: '800',
        marginTop: 6,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
    },
    editText: {
        color: '#00E5A0',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    bookingItem: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingServiceName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    bookingCustomerName: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 4,
    },
    bookingDate: {
        color: '#4B5563',
        fontSize: 12,
    },
    chatListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    chatAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 15,
    },
    chatName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    chatLastMsg: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 15,
    },
    actionBtn: {
        flex: 1,
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptBtn: {
        backgroundColor: '#00E5A0',
    },
    rejectBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    acceptBtnText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 14,
    },
    rejectBtnText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 14,
    },
    chatLinkBtn: {
        backgroundColor: '#00E5A0',
        height: 45,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 15,
    },
    chatLinkText: {
        color: '#000',
        fontWeight: '800',
    },
});
