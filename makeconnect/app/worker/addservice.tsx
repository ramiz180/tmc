import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/Config';

export default function AddServiceScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
    const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchServiceDetails();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/categories`);
            const data = await response.json();
            if (data.success) {
                setCategoriesList(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchServiceDetails = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/services`);
            const data = await response.json();
            if (data.success) {
                const found = data.services.find((s: any) => s._id === id);
                if (found) {
                    setName(found.name);
                    setCategory(found.category);
                    setPrice(found.price.toString());
                    setDescription(found.description);
                    if (found.subCategories) {
                        setSelectedSubCategories(found.subCategories);
                    }
                    if (found.images) setImages(found.images);
                    if (found.videos) setVideos(found.videos);
                }
            }
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleCategoryChange = (categoryName: string) => {
        setCategory(categoryName);
        setSelectedSubCategories([]);

        const selectedCat = categoriesList.find(cat => cat.name === categoryName);
        if (selectedCat && selectedCat.subCategories && selectedCat.subCategories.length > 0) {
            setAvailableSubCategories(selectedCat.subCategories);
        } else {
            setAvailableSubCategories([]);
        }
    };

    const toggleSubCategory = (subCat: string) => {
        if (selectedSubCategories.includes(subCat)) {
            setSelectedSubCategories(selectedSubCategories.filter(s => s !== subCat));
        } else {
            setSelectedSubCategories([...selectedSubCategories, subCat]);
        }
    };

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5,
        });

        if (!result.canceled) {
            setUploading(true);
            try {
                const formData = new FormData();
                result.assets.forEach((asset) => {
                    const filename = asset.uri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename || '');
                    const type = match ? `image/${match[1]}` : `image`;
                    formData.append('images', {
                        uri: asset.uri,
                        name: filename,
                        type,
                    } as any);
                });

                const response = await fetch(`${CONFIG.BACKEND_URL}/upload/images`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.success) {
                    setImages([...images, ...data.urls]);
                } else {
                    Alert.alert('Error', 'Failed to upload images');
                }
            } catch (error) {
                console.error('Error uploading images:', error);
                Alert.alert('Error', 'An error occurred during image upload');
            } finally {
                setUploading(false);
            }
        }
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setUploading(true);
            try {
                const asset = result.assets[0];
                const formData = new FormData();
                const filename = asset.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `video/${match[1]}` : `video`;
                formData.append('video', {
                    uri: asset.uri,
                    name: filename,
                    type,
                } as any);

                const response = await fetch(`${CONFIG.BACKEND_URL}/upload/video`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.success) {
                    setVideos([data.url]);
                } else {
                    Alert.alert('Error', 'Failed to upload video');
                }
            } catch (error) {
                console.error('Error uploading video:', error);
                Alert.alert('Error', 'An error occurred during video upload');
            } finally {
                setUploading(false);
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const removeVideo = (index: number) => {
        setVideos(videos.filter((_, i) => i !== index));
    };

    const handleAddService = async () => {
        if (!name || !category || !price) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User not found. Please log in again.');
                return;
            }

            const url = id ? `${CONFIG.BACKEND_URL}/services/${id}` : `${CONFIG.BACKEND_URL}/services`;
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    category,
                    price: parseFloat(price),
                    description,
                    workerId: userId,
                    subCategories: selectedSubCategories,
                    images,
                    videos,
                }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', id ? 'Service updated successfully!' : 'Service added successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to save service');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            Alert.alert('Error', 'An error occurred while saving the service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.root}
        >
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{id ? 'Edit Service' : 'Add New Service'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {initialLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#00E5A0" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Name *</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Premium Bathroom Cleaning"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.categoryList}>
                            {categoriesList.map((cat) => (
                                <TouchableOpacity
                                    key={cat._id}
                                    style={[
                                        styles.categoryChip,
                                        category === cat.name && styles.categoryChipActive,
                                    ]}
                                    onPress={() => handleCategoryChange(cat.name)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            category === cat.name && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {availableSubCategories.length > 0 && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Sub-Categories (Select Multiple)</Text>
                            <View style={styles.categoryList}>
                                {availableSubCategories.map((subCat, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.categoryChip,
                                            selectedSubCategories.includes(subCat) && styles.categoryChipActive,
                                        ]}
                                        onPress={() => toggleSubCategory(subCat)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryChipText,
                                                selectedSubCategories.includes(subCat) && styles.categoryChipTextActive,
                                            ]}
                                        >
                                            {subCat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price (₹) *</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 499"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your service..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Media</Text>
                        <Text style={styles.helperText}>Add up to 5 images and 1 video to showcase your work.</Text>

                        <View style={styles.mediaContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity style={styles.addMediaBtn} onPress={pickImages} disabled={uploading}>
                                    <Ionicons name="camera" size={24} color="#00E5A0" />
                                    <Text style={styles.addMediaText}>Images</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.addMediaBtn} onPress={pickVideo} disabled={uploading}>
                                    <Ionicons name="videocam" size={24} color="#00E5A0" />
                                    <Text style={styles.addMediaText}>Video</Text>
                                </TouchableOpacity>

                                {images.map((uri, index) => (
                                    <View key={`img-${index}`} style={styles.mediaPreview}>
                                        <Image source={{ uri }} style={styles.previewImg} />
                                        <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {videos.map((uri, index) => (
                                    <View key={`vid-${index}`} style={styles.mediaPreview}>
                                        <View style={[styles.previewImg, styles.videoPlaceholder]}>
                                            <Ionicons name="play-circle" size={32} color="#00E5A0" />
                                        </View>
                                        <TouchableOpacity style={styles.removeBtn} onPress={() => removeVideo(index)}>
                                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                        {uploading && <ActivityIndicator color="#00E5A0" style={{ marginTop: 10 }} />}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleAddService}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.submitBtnText}>{id ? 'Update Service' : 'Publish Service'}</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1F2937',
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
        fontWeight: '800',
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        backgroundColor: '#111827',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#1F2937',
        paddingHorizontal: 15,
        height: 56,
        justifyContent: 'center',
    },
    input: {
        color: '#FFF',
        fontSize: 16,
    },
    categoryList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        borderColor: '#00E5A0',
    },
    categoryChipText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '600',
    },
    categoryChipTextActive: {
        color: '#00E5A0',
    },
    textAreaContainer: {
        height: 120,
        paddingVertical: 15,
        alignItems: 'flex-start',
    },
    textArea: {
        height: '100%',
        width: '100%',
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#00E5A0',
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    helperText: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 10,
    },
    mediaContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    addMediaBtn: {
        width: 80,
        height: 80,
        borderRadius: 15,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1F2937',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addMediaText: {
        color: '#00E5A0',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    mediaPreview: {
        width: 80,
        height: 80,
        marginRight: 12,
        position: 'relative',
    },
    previewImg: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    videoPlaceholder: {
        backgroundColor: '#1F2937',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#000',
        borderRadius: 10,
    },
});
