import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CONFIG } from '../../../constants/Config';

const { width } = Dimensions.get('window');

export default function WorkerHomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<'available' | 'unavailable'>('available');

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <View style={[styles.dot, styles.dotTop]} />
                        <View style={[styles.dot, styles.dotBottomLeft]} />
                        <View style={[styles.dot, styles.dotBottomRight]} />
                        <View style={[styles.dot, styles.dotCenter]} />
                    </View>
                    <Text style={styles.logoText}>The Make Connect</Text>
                </View>

                <TouchableOpacity
                    style={styles.addServiceBtn}
                    onPress={() => router.push('/worker/addservice')}
                >
                    <Ionicons name="add" size={18} color="#00E5A0" />
                    <Text style={styles.addServiceText}>Add Service</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.statusLabel}>Set your status</Text>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, status === 'available' && styles.toggleBtnActive]}
                        onPress={() => setStatus('available')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, status === 'available' && styles.toggleTextActive]}>
                            Available
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleBtn, status === 'unavailable' && styles.toggleBtnActive]}
                        onPress={() => setStatus('unavailable')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, status === 'unavailable' && styles.toggleTextActive]}>
                            Unavailable
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000000",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoIcon: {
        width: 32,
        height: 32,
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00E5A0',
    },
    dotTop: { top: 0, left: 12 },
    dotBottomLeft: { bottom: 2, left: 2 },
    dotBottomRight: { bottom: 2, right: 2 },
    dotCenter: { top: 12, left: 12, transform: [{ scale: 0.8 }] },
    logoText: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    addServiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 160, 0.3)',
    },
    addServiceText: {
        color: '#00E5A0',
        fontSize: 13,
        fontWeight: '800',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    statusLabel: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 30,
        textAlign: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#111827',
        padding: 6,
        borderRadius: 40,
        width: width * 0.85,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    toggleBtn: {
        flex: 1,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 35,
    },
    toggleBtnActive: {
        backgroundColor: '#00E5A0',
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    toggleText: {
        color: '#9CA3AF',
        fontSize: 17,
        fontWeight: '700',
    },
    toggleTextActive: {
        color: '#000000',
        fontWeight: '900',
    },
});
