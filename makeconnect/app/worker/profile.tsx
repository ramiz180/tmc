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
import { CONFIG } from '../../constants/Config';

export default function WorkerProfileScreen() {
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
                setAbout(data.user.about || 'With over 15 years of experience, I specialize in residential and commercial electrical systems. Committed to safety, quality, and reliability on every project.');
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
                Alert.alert('Success', 'Profile updated successfully!');
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
                    <Text style={styles.saveBtnText}>Save</Text>
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
                                <Ionicons name="person" size={50} color="#666" />
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
                        <Text style={styles.ratingValue}>4.9</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons key={star} name="star" size={16} color="#00E5A0" />
                            ))}
                        </View>
                        <Text style={styles.reviewsCount}>124 reviews</Text>
                    </View>

                    <View style={styles.ratingBars}>
                        {[
                            { label: '5', percent: 0.8, val: '80%' },
                            { label: '4', percent: 0.15, val: '15%' },
                            { label: '3', percent: 0.03, val: '3%' },
                            { label: '2', percent: 0.01, val: '1%' },
                            { label: '1', percent: 0.01, val: '1%' },
                        ].map((item, idx) => (
                            <View key={idx} style={styles.barContainer}>
                                <Text style={styles.barLabel}>{item.label}</Text>
                                <View style={styles.barBackground}>
                                    <View style={[styles.barFill, { width: `${item.percent * 100}%` }]} />
                                </View>
                                <Text style={styles.barPercent}>{item.val}</Text>
                            </View>
                        ))}
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
                        <Text style={styles.chipText}>Male</Text>
                    </View>
                    <View style={styles.chip}>
                        <MaterialCommunityIcons name="cake-variant" size={18} color="#00E5A0" />
                        <Text style={styles.chipText}>34</Text>
                    </View>
                </View>

                {/* Verification Section */}
                <View style={styles.verificationSection}>
                    <Text style={styles.sectionTitle}>Verification</Text>

                    <View style={styles.verificationItem}>
                        <View style={styles.verificationLeft}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark" size={14} color="#00E5A0" />
                            </View>
                            <Text style={styles.verificationText}>Verified</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.verificationItem}>
                        <View style={styles.verificationLeft}>
                            <MaterialCommunityIcons name="briefcase-outline" size={24} color="#FFF" />
                            <Text style={styles.verificationText}>Master Electrician License</Text>
                        </View>
                        <Ionicons name="eye" size={20} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.verificationItem}>
                        <View style={styles.verificationLeft}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#FFF" />
                            <Text style={styles.verificationText}>Government Issued ID</Text>
                        </View>
                        <Ionicons name="eye" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Upload Button */}
                <TouchableOpacity style={styles.uploadBtn}>
                    <Text style={styles.uploadBtnText}>Upload New Document</Text>
                </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    saveBtnText: {
        color: '#00E5A0',
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#1F2937',
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
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#051405',
    },
    occupationText: {
        color: '#00E5A0',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
    },
    ratingSection: {
        flexDirection: 'row',
        marginTop: 30,
        alignItems: 'center',
    },
    ratingLeft: {
        alignItems: 'center',
        width: '35%',
    },
    ratingValue: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: '800',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 3,
        marginVertical: 8,
    },
    reviewsCount: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    ratingBars: {
        flex: 1,
        marginLeft: 10,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    barLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        width: 15,
    },
    barBackground: {
        flex: 1,
        height: 6,
        backgroundColor: '#111827',
        borderRadius: 3,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#00E5A0',
        borderRadius: 3,
    },
    barPercent: {
        color: '#9CA3AF',
        fontSize: 12,
        width: 35,
        textAlign: 'right',
    },
    inputSection: {
        marginTop: 40,
    },
    inputLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 8,
    },
    nameInput: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
        borderBottomWidth: 1,
        borderBottomColor: '#1F2937',
        paddingBottom: 10,
    },
    aboutLabel: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 30,
        marginBottom: 10,
    },
    aboutInput: {
        color: '#9CA3AF',
        fontSize: 15,
        lineHeight: 22,
    },
    chipsRow: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 15,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 160, 0.2)',
    },
    chipText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
    verificationSection: {
        marginTop: 40,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
    },
    verificationItem: {
        backgroundColor: '#0A1A0A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#112211',
    },
    verificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#00E5A0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verificationText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    uploadBtn: {
        backgroundColor: '#0F2A0F',
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#1A331A',
    },
    uploadBtnText: {
        color: '#00E5A0',
        fontSize: 16,
        fontWeight: '700',
    },
});
