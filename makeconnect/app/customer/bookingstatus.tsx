import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONFIG } from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function BookingStatusScreen() {
    const { bookingId, status } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/${bookingId}`);
            const data = await response.json();
            if (data.success) {
                setBooking(data.booking);
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    const isConfirmed = status === 'confirmed' || booking?.status === 'accepted';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.headerStatusText}>STATUS</Text>
            </View>

            <View style={styles.content}>
                {/* Status Indicator */}
                <View style={[styles.statusRing, isConfirmed && styles.confirmedRing]}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: booking?.workerId?.profileImage || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={[styles.statusIndicator, isConfirmed ? styles.confirmedIndicator : styles.pendingIndicator]}>
                            {isConfirmed ? (
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            ) : (
                                <ActivityIndicator size="small" color="#00E5A0" />
                            )}
                        </View>
                    </View>
                </View>

                <Text style={styles.mainTitle}>
                    {isConfirmed ? 'Booking Confirmed!' : 'Booking Request Sent'}
                </Text>

                <Text style={styles.subTitle}>
                    {isConfirmed
                        ? 'Your booking is confirmed. We\'ve notified the worker and sent a confirmation to your email.'
                        : `We are waiting for ${booking?.workerId?.name || 'the worker'} to accept your booking request.`}
                </Text>

                {/* Booking Brief Card */}
                <View style={styles.briefCard}>
                    <View style={styles.briefHeader}>
                        <View style={styles.serviceIconContainer}>
                            <MaterialCommunityIcons name="tools" size={24} color="#FFF" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.briefCategory}>{booking?.serviceId?.category?.toUpperCase() || 'SERVICE'}</Text>
                            <Text style={styles.briefServiceName}>{booking?.serviceId?.name || 'Service Request'}</Text>
                        </View>
                        <View style={[styles.statusBadge, isConfirmed ? styles.confirmedBadge : styles.pendingBadge]}>
                            <Text style={styles.statusBadgeText}>{isConfirmed ? 'CONFIRMED' : 'AWAITING'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {!isConfirmed ? (
                        <View style={styles.briefRow}>
                            <View style={styles.briefItem}>
                                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                                <Text style={styles.briefItemText}>{booking?.bookingDate}, {booking?.bookingTime}</Text>
                            </View>
                            <Text style={styles.briefPrice}>₹{booking?.serviceId?.price}/hr</Text>
                        </View>
                    ) : (
                        <View style={styles.confirmedDetails}>
                            <View style={styles.workerRow}>
                                <Image
                                    source={{ uri: booking?.workerId?.profileImage || 'https://via.placeholder.com/150' }}
                                    style={styles.smallAvatar}
                                />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.workerName}>{booking?.workerId?.name}</Text>
                                    <Text style={styles.bookingFullTime}>{booking?.bookingDate} at {booking?.bookingTime}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.messageBtn}>
                                <Ionicons name="chatbubble-ellipses" size={18} color="#00E5A0" />
                                <Text style={styles.messageBtnText}>Message Worker</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                {isConfirmed ? (
                    <>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/customer/home')}>
                            <Text style={styles.primaryBtnText}>View My Bookings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/customer/home')}>
                            <Text style={styles.secondaryBtnText}>Return to Home</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/customer/home')}>
                            <Text style={styles.primaryBtnText}>Go to Home</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerNote}>You will be notified once confirmed</Text>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerStatusText: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    statusRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: 'rgba(0, 229, 160, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    confirmedRing: {
        borderColor: '#00E5A0',
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0F172A',
    },
    pendingIndicator: {
        // Just the background
    },
    confirmedIndicator: {
        backgroundColor: '#00E5A0',
    },
    mainTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    subTitle: {
        color: '#9CA3AF',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 40,
    },
    briefCard: {
        width: '100%',
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    briefHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#334155',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    briefCategory: {
        color: '#00E5A0',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    briefServiceName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pendingBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
    },
    confirmedBadge: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 15,
    },
    briefRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    briefItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    briefItemText: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '600',
    },
    briefPrice: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    confirmedDetails: {
        width: '100%',
    },
    workerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    smallAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    workerName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    bookingFullTime: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    messageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    messageBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        paddingHorizontal: 20,
        gap: 15,
        alignItems: 'center',
    },
    primaryBtn: {
        width: '100%',
        backgroundColor: '#00E5A0',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    secondaryBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footerNote: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
    },
});
