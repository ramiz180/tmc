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

export default function MessagesScreen() {
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
                <Text style={styles.tabTitle}>Messages</Text>
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
                                <Text style={styles.avatarText}>{booking.workerId?.name?.[0] || 'W'}</Text>
                            </View>
                            <View style={styles.chatInfo}>
                                <Text style={styles.chatName}>{booking.workerId?.name}</Text>
                                <Text style={styles.chatLastMsg} numberOfLines={1}>
                                    {booking.chatMessages?.length > 0
                                        ? booking.chatMessages[booking.chatMessages.length - 1].text
                                        : 'Tap to start chatting...'}
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
    tabBody: {
        flex: 1,
    },
    tabTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 25,
    },
    chatListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        padding: 18,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    chatAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1F2937',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00E5A0',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 18,
    },
    chatName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    chatLastMsg: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 4,
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
