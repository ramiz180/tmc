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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';

export default function CustomerEditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

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
                setPhone(data.user.phone || '');
                setEmail(data.user.email || '');
                setAddress(data.user.location?.houseNo || '');
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
        setSaving(true);
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
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setSaving(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    phone,
                    email,
                    location: {
                        ...userData?.location,
                        houseNo: address
                    }
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
            setSaving(false);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { marginTop: insets.top }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 40 }} />
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

                        <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Full Name"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Phone Number"
                                placeholderTextColor="#666"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email Address"
                                placeholderTextColor="#666"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Home Address</Text>
                            <View style={styles.addressInputWrapper}>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Home Address"
                                    placeholderTextColor="#666"
                                />
                                <Ionicons name="location" size={22} color="#00E5A0" style={styles.locationIcon} />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#111827',
        borderWidth: 2,
        borderColor: '#00E5A0',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#00E5A0',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    changePhotoBtn: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#00E5A0',
    },
    changePhotoText: {
        color: '#00E5A0',
        fontSize: 16,
        fontWeight: '800',
    },
    inputSection: {
        gap: 25,
    },
    inputGroup: {
        gap: 12,
    },
    inputLabel: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '800',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    input: {
        backgroundColor: '#111827',
        color: '#FFF',
        fontSize: 16,
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
        fontWeight: '600',
    },
    addressInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#1F2937',
        paddingRight: 18,
    },
    locationIcon: {
        marginLeft: 10,
    },
    saveBtn: {
        backgroundColor: '#00E5A0',
        height: 65,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        color: '#000',
        fontSize: 20,
        fontWeight: '900',
    },
});
