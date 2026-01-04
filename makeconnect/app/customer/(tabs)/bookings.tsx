import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';

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
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/user/${userId}/customer`);
            const data = await response.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.tabBody}
                contentContainerStyle={{ padding: 20, paddingTop: insets.top + 10, paddingBottom: 120 }}
            >
                <Text style={styles.tabTitle}>My Bookings</Text>
                {loading ? (
                    <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                ) : bookings.length === 0 ? (
                    <Text style={styles.emptyText}>You have no bookings yet.</Text>
                ) : (
                    bookings.map((booking) => (
                        <TouchableOpacity
                            key={booking._id}
                            style={styles.bookingItem}
                            onPress={() => router.push(`/chat/${booking._id}`)}
                        >
                            <View style={styles.bookingHeader}>
                                <Text style={styles.bookingServiceName}>{booking.serviceId?.name || 'Service'}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                                    <Text style={styles.statusText}>{booking.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.bookingWorkerName}>Worker: {booking.workerId?.name}</Text>
                            <Text style={styles.bookingDate}>{new Date(booking.createdAt).toLocaleDateString()}</Text>
                        </TouchableOpacity>
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
    tabBody: {
        flex: 1,
    },
    tabTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 25,
    },
    bookingItem: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookingServiceName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    bookingWorkerName: {
        color: '#9CA3AF',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    bookingDate: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '500',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 40,
    },
});
