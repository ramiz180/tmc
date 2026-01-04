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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';

export default function ChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.servicesBody}
                contentContainerStyle={{ paddingBottom: 150, padding: 20, paddingTop: insets.top + 10 }}
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
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
