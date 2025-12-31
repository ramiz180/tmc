import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/Config';

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
    const params = useLocalSearchParams();
    const id = params.id as string;
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const mapRef = useRef<MapView>(null);
    const locationWatcher = useRef<any>(null);

    useEffect(() => {
        initChat();
        const interval = setInterval(fetchBookingDetails, 5000); // Poll for messages/location
        startLocationTracking();
        return () => {
            clearInterval(interval);
            if (locationWatcher.current) {
                locationWatcher.current.remove();
            }
        };
    }, [id]);

    const startLocationTracking = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            locationWatcher.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, // Update every 10 meters
                    timeInterval: 5000,   // or every 5 seconds
                },
                (location) => {
                    updateMyLocationOnBackend(location.coords.latitude, location.coords.longitude);
                }
            );
        } catch (error) {
            console.error('Error starting location tracking:', error);
        }
    };

    const updateMyLocationOnBackend = async (lat: number, lng: number) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            await fetch(`${CONFIG.BACKEND_URL}/auth/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    latitude: lat,
                    longitude: lng,
                }),
            });
        } catch (error) {
            console.error('Error updating live location:', error);
        }
    };

    const initChat = async () => {
        const userId = await AsyncStorage.getItem('userId');
        setCurrentUserId(userId);
        fetchBookingDetails();
    };

    const fetchBookingDetails = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const role = await AsyncStorage.getItem('userRole') || 'customer';
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/user/${userId}/${role}`);
            const data = await response.json();
            if (data.success) {
                const found = data.bookings.find((b: any) => b._id === id);
                setBooking(found);
            }
        } catch (error) {
            console.error('Error fetching chat details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/message/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUserId,
                    text: message,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage('');
                fetchBookingDetails();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    const otherUser = currentUserId === booking?.customerId?._id ? booking?.workerId : booking?.customerId;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Map Section */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: booking?.workerId?.location?.latitude || 28.6139,
                        longitude: booking?.workerId?.location?.longitude || 77.2090,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    customMapStyle={DARK_MAP_STYLE}
                >
                    {booking?.workerId?.location?.latitude && (
                        <Marker
                            coordinate={{
                                latitude: booking.workerId.location.latitude,
                                longitude: booking.workerId.location.longitude,
                            }}
                            title="Worker Location"
                            description={booking.workerId.name}
                        >
                            <View style={[styles.marker, { backgroundColor: '#00E5A0' }]}>
                                <Ionicons name="construct" size={16} color="#000" />
                            </View>
                        </Marker>
                    )}

                    {booking?.customerId?.location?.latitude && (
                        <Marker
                            coordinate={{
                                latitude: booking.customerId.location.latitude,
                                longitude: booking.customerId.location.longitude,
                            }}
                            title="Your Location"
                        >
                            <View style={[styles.marker, { backgroundColor: '#3B82F6' }]}>
                                <Ionicons name="person" size={16} color="#FFF" />
                            </View>
                        </Marker>
                    )}
                </MapView>

                {/* Map Action Buttons */}
                <View style={styles.mapActions}>
                    <TouchableOpacity
                        style={styles.mapActionBtn}
                        onPress={() => {
                            if (booking?.workerId?.location && booking?.customerId?.location) {
                                mapRef.current?.fitToCoordinates([
                                    booking.workerId.location,
                                    booking.customerId.location
                                ], {
                                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                    animated: true,
                                });
                            }
                        }}
                    >
                        <Ionicons name="expand" size={20} color="#00E5A0" />
                    </TouchableOpacity>
                </View>

                {/* Header Overlay */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{otherUser?.name || 'User'}</Text>
                        <Text style={styles.headerStatus}>{booking?.status === 'accepted' ? 'Live Connection' : 'Connecting...'}</Text>
                    </View>
                    <TouchableOpacity style={styles.callBtn}>
                        <Ionicons name="call" size={20} color="#00E5A0" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chat Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.chatContainer}
            >
                <ScrollView
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    style={styles.messagesList}
                    contentContainerStyle={{ padding: 20 }}
                >
                    {booking?.status === 'pending' ? (
                        <View style={styles.waitingContainer}>
                            <Ionicons name="time-outline" size={48} color="#00E5A0" />
                            <Text style={styles.waitingTitle}>Awaiting Acceptance</Text>
                            <Text style={styles.waitingSub}>Chat will be enabled once the professional accepts your request.</Text>
                        </View>
                    ) : booking?.chatMessages?.map((msg: any, index: number) => (
                        <View
                            key={index}
                            style={[
                                styles.messageBubble,
                                msg.senderId === currentUserId ? styles.myMessage : styles.theirMessage,
                            ]}
                        >
                            <Text style={[
                                styles.messageText,
                                msg.senderId === currentUserId ? styles.myMessageText : styles.theirMessageText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={[styles.inputArea, { paddingBottom: insets.bottom + 10 }]}>
                    <TextInput
                        style={[styles.input, booking?.status !== 'accepted' && styles.disabledInput]}
                        placeholder={booking?.status === 'accepted' ? "Type a message..." : "Chat disabled"}
                        placeholderTextColor="#9CA3AF"
                        value={message}
                        onChangeText={setMessage}
                        editable={booking?.status === 'accepted'}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, booking?.status !== 'accepted' && styles.disabledSendBtn]}
                        onPress={handleSendMessage}
                        disabled={booking?.status !== 'accepted'}
                    >
                        <Ionicons name="send" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const DARK_MAP_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
    { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        height: height * 0.4,
        width: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        paddingBottom: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    headerName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    headerStatus: {
        color: '#00E5A0',
        fontSize: 12,
        fontWeight: '600',
    },
    callBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapActions: {
        position: 'absolute',
        bottom: 50,
        right: 20,
        gap: 10,
    },
    mapActionBtn: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 160, 0.3)',
    },
    marker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
    },
    messagesList: {
        flex: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#00E5A0',
        borderBottomRightRadius: 5,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#1E293B',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#000',
        fontWeight: '500',
    },
    theirMessageText: {
        color: '#FFF',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: '#1E293B',
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: '#0F172A',
        borderRadius: 25,
        paddingHorizontal: 20,
        color: '#FFF',
        fontSize: 15,
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#00E5A0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    disabledInput: {
        backgroundColor: '#1E293B',
        opacity: 0.5,
    },
    disabledSendBtn: {
        backgroundColor: '#4B5563',
        opacity: 0.5,
    },
    waitingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 15,
    },
    waitingTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    },
    waitingSub: {
        color: '#9CA3AF',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
});
