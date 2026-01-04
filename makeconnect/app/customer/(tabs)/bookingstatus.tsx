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
import { CONFIG } from '../../../constants/Config';

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
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/customer')}>
                            <Text style={styles.primaryBtnText}>View My Bookings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/customer')}>
                            <Text style={styles.secondaryBtnText}>Return to Home</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/customer')}>
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
        backgroundColor: '#000000',
    },
    header: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerStatusText: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 3,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
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
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 2,
        borderColor: 'rgba(0, 229, 160, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 45,
    },
    confirmedRing: {
        borderColor: '#00E5A0',
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#111827',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
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
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 20,
    },
    subTitle: {
        color: '#9CA3AF',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 45,
        fontWeight: '500',
    },
    briefCard: {
        width: '100%',
        backgroundColor: '#111827',
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    briefHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 52,
        height: 52,
        backgroundColor: '#000',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    briefCategory: {
        color: '#00E5A0',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    briefServiceName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    pendingBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
    },
    confirmedBadge: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#1F2937',
        marginVertical: 20,
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
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    briefPrice: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    confirmedDetails: {
        width: '100%',
    },
    workerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    smallAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#00E5A0',
    },
    workerName: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    bookingFullTime: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    messageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingVertical: 14,
        borderRadius: 18,
        gap: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#00E5A0',
    },
    messageBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    footer: {
        paddingHorizontal: 20,
        gap: 15,
        alignItems: 'center',
    },
    primaryBtn: {
        width: '100%',
        backgroundColor: '#00E5A0',
        height: 65,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
    },
    primaryBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '900',
    },
    secondaryBtn: {
        width: '100%',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    secondaryBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    footerNote: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '700',
    },
});
