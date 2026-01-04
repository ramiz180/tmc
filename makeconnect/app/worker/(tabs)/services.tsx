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
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';

export default function ServicesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchMyServices();
        }, [])
    );

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

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.servicesBody}
                contentContainerStyle={{ paddingBottom: 150, padding: 20, paddingTop: insets.top + 10 }}
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
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 25,
    },
    serviceItem: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    serviceMainInfo: {
        flex: 1,
    },
    serviceName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    serviceCategory: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    servicePrice: {
        color: '#00E5A0',
        fontSize: 17,
        fontWeight: '900',
        marginTop: 10,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#00E5A0',
    },
    editText: {
        color: '#00E5A0',
        fontSize: 14,
        fontWeight: '800',
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 17,
        fontWeight: '600',
    },
});
