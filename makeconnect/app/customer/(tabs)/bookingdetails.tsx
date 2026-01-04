import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Form States
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [instructions, setInstructions] = useState('');
    const [userLocation, setUserLocation] = useState<any>(null);

    useEffect(() => {
        fetchServiceDetails();
        fetchUserLocation();
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/services/${id}`);
            const data = await response.json();
            if (data.success) {
                setService(data.service);
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserLocation = async () => {
        const locJson = await AsyncStorage.getItem('userLocation');
        if (locJson) setUserLocation(JSON.parse(locJson));
    };

    const handleConfirmBooking = async () => {
        setBookingLoading(true);
        try {
            const customerId = await AsyncStorage.getItem('userId');
            if (!customerId) {
                Alert.alert('Error', 'Please log in to book a service');
                return;
            }

            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service._id,
                    customerId,
                    workerId: service.workerId?._id || service.workerId,
                    location: userLocation,
                    bookingDate: date.toLocaleDateString(),
                    bookingTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    instructions,
                    paymentMethod: { type: 'Card', last4: '4242' } // Placeholder for now
                }),
            });

            const data = await response.json();
            if (data.success) {
                router.push({
                    pathname: '/customer/bookingstatus',
                    params: { bookingId: data.booking._id, status: 'sent' }
                });
            } else {
                Alert.alert('Error', data.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            Alert.alert('Error', 'An error occurred');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm Booking</Text>
                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Worker Preview Card */}
                <View style={styles.workerPreviewCard}>
                    <View style={styles.workerAvatarContainer}>
                        <Image
                            source={{ uri: service.workerId?.profileImage || 'https://via.placeholder.com/150' }}
                            style={styles.workerAvatar}
                        />
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#00E5A0" />
                        </View>
                    </View>
                    <Text style={styles.workerName}>{service.workerName}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{service.category.toUpperCase()}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FBBF24" />
                        <Text style={styles.ratingText}>4.9 (124 reviews)</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Hourly Rate</Text>
                        <Text style={styles.priceValue}>₹{service.price}<Text style={styles.perHour}>/hr</Text></Text>
                    </View>
                </View>

                {/* Service Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Service Location</Text>
                    <View style={styles.locationInput}>
                        <Ionicons name="location" size={20} color="#00E5A0" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {userLocation?.address || 'Select location...'}
                        </Text>
                        <TouchableOpacity>
                            <Ionicons name="locate" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date & Time */}
                <View style={styles.section}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>Date & Time</Text>
                        <View style={styles.dateTimeRow}>
                            <TouchableOpacity
                                style={styles.dateTimeItem}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateTimeText}>{date.toLocaleDateString()}</Text>
                                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateTimeItem}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons name="time-outline" size={18} color="#00E5A0" />
                                <Text style={styles.dateTimeText}>
                                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event: any, selectedDate?: Date) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={(event: any, selectedTime?: Date) => {
                            setShowTimePicker(false);
                            if (selectedTime) setTime(selectedTime);
                        }}
                    />
                )}

                {/* Special Instructions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>Special Instructions</Text>
                        <Text style={styles.optionalLabel}>Optional</Text>
                    </View>
                    <View style={styles.instructionsContainer}>
                        <TextInput
                            style={styles.instructionsInput}
                            placeholder="Describe your issue in detail or leave special instructions for entry (e.g., Gate code is 1234)..."
                            placeholderTextColor="#64748B"
                            multiline
                            numberOfLines={4}
                            value={instructions}
                            onChangeText={setInstructions}
                        />
                        <View style={styles.instructionsFooter}>
                            <View style={styles.instructionsIcons}>
                                <TouchableOpacity style={styles.instrIcon}><Ionicons name="camera" size={20} color="#00E5A0" /></TouchableOpacity>
                                <TouchableOpacity style={styles.instrIcon}><Ionicons name="mic" size={20} color="#00E5A0" /></TouchableOpacity>
                                <TouchableOpacity style={styles.instrIcon}><Ionicons name="location" size={20} color="#00E5A0" /></TouchableOpacity>
                            </View>
                            <Text style={styles.charCount}>{instructions.length}/500</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentIcon}>
                            <Ionicons name="card" size={24} color="#FFF" />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Payment Method</Text>
                            <Text style={styles.paymentDetails}>Visa ending in 4242</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changeBtnText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirmBooking}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.confirmBtnText}>Confirm Book</Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
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
    moreBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    workerPreviewCard: {
        backgroundColor: '#111827',
        marginHorizontal: 20,
        borderRadius: 30,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
        marginTop: 10,
    },
    workerAvatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    workerAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#00E5A0',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#111827',
        borderRadius: 12,
        padding: 2,
    },
    workerName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 15,
    },
    categoryBadgeText: {
        color: '#00E5A0',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    ratingText: {
        color: '#9CA3AF',
        fontSize: 15,
        fontWeight: '600',
    },
    priceRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#1F2937',
        paddingTop: 20,
    },
    priceLabel: {
        color: '#9CA3AF',
        fontSize: 15,
        fontWeight: '500',
    },
    priceValue: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: '900',
    },
    perHour: {
        fontSize: 15,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    sectionLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    locationInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 18,
        gap: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    locationText: {
        flex: 1,
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    dateTimeText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    optionalLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '700',
    },
    instructionsContainer: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    instructionsInput: {
        color: '#FFF',
        fontSize: 15,
        textAlignVertical: 'top',
        minHeight: 120,
        fontWeight: '500',
    },
    instructionsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    instructionsIcons: {
        flexDirection: 'row',
        gap: 18,
    },
    instrIcon: {
        padding: 4,
    },
    charCount: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    paymentIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#000',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#111',
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 15,
    },
    paymentLabel: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    paymentDetails: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    changeBtnText: {
        color: '#00E5A0',
        fontSize: 15,
        fontWeight: '800',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 15,
        borderTopWidth: 1,
        borderTopColor: '#111827',
    },
    confirmBtn: {
        backgroundColor: '#00E5A0',
        height: 65,
        borderRadius: 22,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
    },
    confirmBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '900',
    },
    cancelBtn: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
        marginBottom: 10,
    },
    cancelBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
});
