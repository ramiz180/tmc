import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';
import { useLanguage } from '../../../context/LanguageContext';
import { LanguageCode } from '../../../constants/translations';

const LANGUAGES: { code: LanguageCode; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export default function LanguagesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { currentLanguage, setLanguage, t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
        } catch (error) {
            console.error('Error loading language:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageSelect = async (code: LanguageCode) => {
        try {
            await setLanguage(code);
            if (userId) {
                await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: code }),
                });
            }
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('languages.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.languageList}>
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageItem,
                                currentLanguage === lang.code && styles.languageItemSelected
                            ]}
                            onPress={() => handleLanguageSelect(lang.code)}
                        >
                            <View>
                                <Text style={styles.languageName}>{lang.name}</Text>
                                <Text style={styles.languageNative}>{lang.nativeName}</Text>
                            </View>
                            {currentLanguage === lang.code && (
                                <View style={styles.checkIcon}>
                                    <Ionicons name="checkmark-circle" size={24} color="#00E5A0" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#051405',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#051405',
        borderBottomWidth: 1,
        borderBottomColor: '#112211',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    languageList: {
        backgroundColor: '#0A1A0A',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#112211',
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#112211',
    },
    languageItemSelected: {
        backgroundColor: '#112211',
    },
    languageName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    languageNative: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 2,
    },
    checkIcon: {
        marginLeft: 10,
    },
});
