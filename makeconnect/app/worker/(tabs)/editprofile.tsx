import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';

export default function WorkerEditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`);
            const data = await response.json();
            if (data.success) {
                setUserData(data.user);
                setName(data.user.name || '');
                setAbout(data.user.about || '');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadProfileImage(result.assets[0].uri);
        }
    };

    const uploadProfileImage = async (uri: string) => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const formData = new FormData();

            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);

            const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}/profile-image`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            if (data.success) {
                setUserData({ ...userData, profileImage: data.profileImage });
                Alert.alert('Success', 'Profile picture updated!');
            } else {
                Alert.alert('Error', data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'An error occurred while uploading image');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    about,
                }),
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    const renderRatingRow = (label: string, percent: number, val: string) => (
        <View style={styles.barContainer}>
            <Text style={styles.barLabel}>{label}</Text>
            <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${percent * 100}%` }]} />
            </View>
            <Text style={styles.barPercent}>{val}</Text>
        </View>
    );

    if (loading && !userData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveHeaderBtn}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Picture Section */}
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatarContainer}>
                        {userData?.profileImage ? (
                            <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={60} color="#666" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
                            <MaterialCommunityIcons name="pencil" size={16} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.occupationText}>Master Electrician</Text>
                </View>

                {/* Rating Section */}
                <View style={styles.ratingSection}>
                    <View style={styles.ratingLeft}>
                        <Text style={styles.ratingValue}>{userData?.rating || '4.9'}</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons key={star} name="star" size={16} color="#00E5A0" />
                            ))}
                        </View>
                        <Text style={styles.reviewsCount}>124 reviews</Text>
                    </View>

                    <View style={styles.ratingBars}>
                        {renderRatingRow('5', 0.8, '80%')}
                        {renderRatingRow('4', 0.15, '15%')}
                        {renderRatingRow('3', 0.03, '3%')}
                        {renderRatingRow('2', 0.01, '1%')}
                        {renderRatingRow('1', 0.01, '1%')}
                    </View>
                </View>

                {/* Input Fields */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.nameInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor="#666"
                    />

                    <Text style={styles.aboutLabel}>About</Text>
                    <TextInput
                        style={styles.aboutInput}
                        value={about}
                        onChangeText={setAbout}
                        placeholder="Tell us about yourself"
                        placeholderTextColor="#666"
                        multiline
                    />
                </View>

                {/* Chips */}
                <View style={styles.chipsRow}>
                    <View style={styles.chip}>
                        <MaterialCommunityIcons name="gender-male" size={18} color="#00E5A0" />
                        <Text style={styles.chipText}>{userData?.gender || 'Male'}</Text>
                    </View>
                    <View style={styles.chip}>
                        <MaterialCommunityIcons name="cake-variant" size={18} color="#00E5A0" />
                        <Text style={styles.chipText}>{userData?.age || '34'}</Text>
                    </View>
                </View>

                {/* Verification Section */}
                <View style={styles.verificationSection}>
                    <Text style={styles.sectionTitle}>Verification</Text>

                    <View style={styles.verificationBadge}>
                        <View style={styles.verifiedIconContainer}>
                            <Ionicons name="checkmark-circle" size={20} color="#00E5A0" />
                        </View>
                        <Text style={styles.verifiedText}>Verified</Text>
                    </View>

                    <TouchableOpacity style={styles.verificationItem}>
                        <View style={styles.verificationItemLeft}>
                            <MaterialCommunityIcons name="briefcase-outline" size={24} color="#FFF" />
                            <Text style={styles.verificationItemText}>Master Electrician License</Text>
                        </View>
                        <Ionicons name="eye" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.verificationItem}>
                        <View style={styles.verificationItemLeft}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#FFF" />
                            <Text style={styles.verificationItemText}>Government Issued ID</Text>
                        </View>
                        <Ionicons name="eye" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Upload Button */}
                <TouchableOpacity style={styles.uploadBtn}>
                    <Text style={styles.uploadBtnText}>Upload New Document</Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
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
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
    saveHeaderBtn: {
        color: '#00E5A0',
        fontSize: 17,
        fontWeight: '900',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderColor: '#111827',
    },
    avatarPlaceholder: {
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#00E5A0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    occupationText: {
        color: '#00E5A0',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    ratingSection: {
        flexDirection: 'row',
        marginTop: 35,
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#111',
    },
    ratingLeft: {
        alignItems: 'flex-start',
        width: '35%',
    },
    ratingValue: {
        color: '#FFF',
        fontSize: 54,
        fontWeight: '900',
        lineHeight: 60,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
        marginVertical: 6,
    },
    reviewsCount: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
    ratingBars: {
        flex: 1,
        marginLeft: 20,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    barLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '700',
        width: 15,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#111827',
        borderRadius: 4,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#00E5A0',
        borderRadius: 4,
    },
    barPercent: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
        width: 35,
        textAlign: 'right',
    },
    inputSection: {
        marginTop: 40,
    },
    inputLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    nameInput: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: '900',
        borderBottomWidth: 2,
        borderBottomColor: '#1F2937',
        paddingBottom: 12,
        marginBottom: 35,
    },
    aboutLabel: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 15,
    },
    aboutInput: {
        color: '#9CA3AF',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '500',
        backgroundColor: '#0A0A0A',
        padding: 15,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#111',
    },
    chipsRow: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 15,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    chipText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    verificationSection: {
        marginTop: 45,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 20,
    },
    verificationBadge: {
        backgroundColor: '#0A0A0A',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        gap: 15,
        borderWidth: 1,
        borderColor: '#111',
    },
    verifiedIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    verificationItem: {
        backgroundColor: '#111827',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    verificationItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    verificationItemText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    uploadBtn: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#00E5A0',
    },
    uploadBtnText: {
        color: '#00E5A0',
        fontSize: 17,
        fontWeight: '800',
    },
});
