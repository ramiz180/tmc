import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';
import { useLanguage } from '../../../context/LanguageContext';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#F59E0B';
        case 'accepted': return '#00E5A0';
        case 'completed': return '#3B82F6';
        default: return '#6B7280';
    }
};

export default function BookingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMyBookings();
    }, []);

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
            <ScrollView
                style={styles.servicesBody}
                contentContainerStyle={{ paddingBottom: 150, padding: 20, paddingTop: insets.top + 10 }}
            >
                <Text style={styles.sectionTitle}>{t('bookings.title')}</Text>
                {loading ? (
                    <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                ) : bookings.length === 0 ? (
                    <Text style={styles.emptyText}>{t('bookings.noBookings')}</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000000",
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
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
