import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, MapPin, DollarSign, Clock, X, Check } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface IncomingBookingProps {
    customerName: string;
    serviceName: string;
    location: string;
    price: string;
    onAccept: () => void;
    onReject: () => void;
}

export default function IncomingBookingScreen({
    customerName,
    serviceName,
    location,
    price,
    onAccept,
    onReject
}: IncomingBookingProps) {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80' }} // Placeholder
                style={StyleSheet.absoluteFillObject}
            />
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject} />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', 'black']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarRing1} />
                        <View style={styles.avatarRing2} />
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{customerName.charAt(0)}</Text>
                        </View>
                    </View>
                    <Text style={styles.incomingText}>Incoming Service Request</Text>
                    <Text style={styles.customerName}>{customerName}</Text>
                </View>

                <View style={styles.detailsCard}>
                    <Text style={styles.serviceName}>{serviceName}</Text>

                    <View style={styles.detailRow}>
                        <MapPin size={18} color="#9ca3af" />
                        <Text style={styles.detailText} numberOfLines={2}>{location}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <DollarSign size={18} color="#4ade80" />
                        <Text style={[styles.detailText, { color: '#4ade80', fontWeight: 'bold' }]}>{price}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Pressable onPress={onReject} style={styles.actionButtonContainer}>
                        <View style={[styles.actionButton, styles.rejectButton]}>
                            <X size={32} color="white" />
                        </View>
                        <Text style={styles.actionLabel}>Decline</Text>
                    </Pressable>

                    <Pressable onPress={onAccept} style={styles.actionButtonContainer}>
                        <View style={[styles.actionButton, styles.acceptButton]}>
                            <Phone size={32} color="white" />
                        </View>
                        <Text style={styles.actionLabel}>Accept</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        width: '100%',
        padding: 30,
        justifyContent: 'space-between',
        paddingVertical: 80,
    },
    header: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarRing1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        zIndex: 1,
        // Add pulsing animation here if using Reanimated
    },
    avatarRing2: {
        position: 'absolute',
        width: 160, // Larger ring
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        zIndex: 0,
    },
    incomingText: {
        color: '#9ca3af',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    customerName: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    detailsCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        gap: 16,
    },
    serviceName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailText: {
        color: '#d1d5db',
        fontSize: 16,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    actionButtonContainer: {
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    acceptButton: {
        backgroundColor: '#22c55e',
    },
    actionLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
