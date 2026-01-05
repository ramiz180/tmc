import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONFIG } from '../../../constants/Config';
import { useLanguage } from '../../../context/LanguageContext';

export default function HelpSupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/settings`);
            const data = await response.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = (type: 'email' | 'phone' | 'whatsapp') => {
        if (!settings?.contact_info) return;
        const { email, phone, whatsapp } = settings.contact_info;

        switch (type) {
            case 'email':
                Linking.openURL(`mailto:${email}`);
                break;
            case 'phone':
                Linking.openURL(`tel:${phone}`);
                break;
            case 'whatsapp':
                Linking.openURL(`whatsapp://send?phone=${whatsapp}`);
                break;
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
                <Text style={styles.headerTitle}>{t('help.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>{t('help.faqs')}</Text>
                {settings?.faqs?.map((faq: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.faqCard}
                        onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Ionicons
                                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#00E5A0"
                            />
                        </View>
                        {expandedIndex === index && (
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>{t('help.contactUs')}</Text>
                <View style={styles.contactContainer}>
                    <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('email')}>
                        <View style={[styles.iconBox, { backgroundColor: '#1E3A8A' }]}>
                            <Ionicons name="mail" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.contactLabel}>{t('help.email')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('phone')}>
                        <View style={[styles.iconBox, { backgroundColor: '#065F46' }]}>
                            <Ionicons name="call" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.contactLabel}>{t('help.phone')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('whatsapp')}>
                        <View style={[styles.iconBox, { backgroundColor: '#15803D' }]}>
                            <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.contactLabel}>{t('help.whatsapp')}</Text>
                    </TouchableOpacity>
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
    sectionTitle: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 5,
    },
    faqCard: {
        backgroundColor: '#0A1A0A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#112211',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    },
    faqAnswer: {
        color: '#9CA3AF',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#112211',
        paddingTop: 12,
    },
    contactContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    contactCard: {
        flex: 1,
        backgroundColor: '#0A1A0A',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#112211',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactLabel: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
});
