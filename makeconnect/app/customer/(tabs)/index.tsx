import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../constants/Config';

const { width } = Dimensions.get('window');

// Fallback images for common categories
const CATEGORY_IMAGES: any = {
    'Beauty Services': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=500&q=80',
    'Plumbing': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&q=80',
    'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
    'Home Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=500&q=80',
    'Handyman': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&q=80',
    'Tutoring': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80',
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&q=80';

export default function CustomerHomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<any>(null);
    const [userName, setUserName] = useState('there');

    useEffect(() => {
        fetchUserData();
        fetchLocation();
        fetchCategories();
        fetchServices();
    }, []);

    const fetchUserData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`);
                const data = await response.json();
                if (data.success && data.user.name) {
                    setUserName(data.user.name);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchLocation = async () => {
        const locJson = await AsyncStorage.getItem('userLocation');
        if (locJson) setUserLocation(JSON.parse(locJson));
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1);
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/categories`);
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const userLocationJson = await AsyncStorage.getItem('userLocation');
            let url = `${CONFIG.BACKEND_URL}/services`;

            if (userLocationJson) {
                const userLocation = JSON.parse(userLocationJson);
                if (userLocation.latitude && userLocation.longitude) {
                    url += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
                }
            }

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => selectedCategory ? setSelectedCategory(null) : null}>
                    <Ionicons name={selectedCategory ? "chevron-back" : "menu"} size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{selectedCategory ? selectedCategory.name : 'The Make Connect'}</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="search" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="options-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Greeting & Search */}
                {!selectedCategory && (
                    <View style={styles.topSection}>
                        <Text style={styles.greeting}>Hello, {userName}!</Text>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for a service or worker..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity style={styles.filterBtn}>
                                <Ionicons name="options" size={20} color="#00E5A0" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {!selectedCategory ? (
                    /* Categories Grid */
                    <View style={styles.categoriesGrid}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat._id}
                                style={styles.categoryCard}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Image
                                    source={{ uri: CATEGORY_IMAGES[cat.name] || DEFAULT_CATEGORY_IMAGE }}
                                    style={styles.categoryImage}
                                />
                                <View style={styles.categoryOverlay}>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    /* Category-specific Services View */
                    <View style={styles.categoryView}>
                        {/* Sub-category Filter */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.subCatFilters}
                            contentContainerStyle={styles.subCatContent}
                        >
                            <TouchableOpacity
                                style={[styles.subCatChip, selectedSubCategory === 'All' && styles.subCatChipActive]}
                                onPress={() => setSelectedSubCategory('All')}
                            >
                                <Text style={[styles.subCatText, selectedSubCategory === 'All' && styles.subCatTextActive]}>All</Text>
                            </TouchableOpacity>
                            {selectedCategory.subCategories?.map((sub: string) => (
                                <TouchableOpacity
                                    key={sub}
                                    style={[styles.subCatChip, selectedSubCategory === sub && styles.subCatChipActive]}
                                    onPress={() => setSelectedSubCategory(sub)}
                                >
                                    <Text style={[styles.subCatText, selectedSubCategory === sub && styles.subCatTextActive]}>{sub}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Service List */}
                        <View style={styles.serviceList}>
                            {services
                                .filter(s => s.category === selectedCategory.name)
                                .filter(s => selectedSubCategory === 'All' || s.subCategories?.includes(selectedSubCategory))
                                .length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="account-search-outline" size={64} color="#334155" />
                                    <Text style={styles.emptyText}>No workers available</Text>
                                    <Text style={styles.emptySubText}>Try another sub-category or radius.</Text>
                                </View>
                            ) : (
                                services
                                    .filter(s => s.category === selectedCategory.name)
                                    .filter(s => selectedSubCategory === 'All' || s.subCategories?.includes(selectedSubCategory))
                                    .map((service) => (
                                        <WorkerCard
                                            key={service._id}
                                            service={service}
                                            distance={userLocation && service.location ? calculateDistance(userLocation.latitude, userLocation.longitude, service.location.latitude, service.location.longitude) : '?.?'}
                                            onPress={() => router.push({
                                                pathname: '/customer/servicedetails',
                                                params: { id: service._id }
                                            })}
                                        />
                                    ))
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const WorkerCard = ({ service, distance }: any) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.workerRowCard}
            onPress={() => router.push({
                pathname: '/customer/servicedetails',
                params: { id: service._id }
            })}
        >
            <Image
                source={{ uri: service.images?.[0] || 'https://via.placeholder.com/100' }}
                style={styles.workerAvatar}
            />
            <View style={styles.workerDetails}>
                <View style={styles.workerHeader}>
                    <Text style={styles.workerNameText} numberOfLines={1}>{service.workerName}</Text>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text style={styles.ratingText}>{service.workerId?.rating || '4.5'}</Text>
                    </View>
                </View>
                <Text style={styles.serviceTitle} numberOfLines={1}>{service.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.distanceText}>{distance} km away</Text>
                    <View style={styles.priceTypeBadge}>
                        <Text style={styles.priceTypeText}>₹{service.price}{service.priceType === 'hourly' ? '/hr' : ' Fixed'}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => router.push({
                    pathname: '/customer/bookingdetails',
                    params: { id: service._id }
                })}
            >
                <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

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
        paddingBottom: 15,
    },
    headerTitle: {
        color: '#F9FAFB',
        fontSize: 22,
        fontWeight: '900',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    topSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    greeting: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 60,
        gap: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    filterBtn: {
        padding: 5,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        paddingTop: 10,
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - 45) / 2,
        height: (width - 45) / 2 * 1.2,
        marginBottom: 15,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: 16,
    },
    categoryName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    categoryView: {
        flex: 1,
    },
    subCatFilters: {
        marginTop: 20,
        paddingHorizontal: 15,
    },
    subCatContent: {
        gap: 12,
        paddingRight: 30,
    },
    subCatChip: {
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 30,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    subCatChipActive: {
        backgroundColor: '#00E5A0',
        borderColor: '#00E5A0',
    },
    subCatText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '700',
    },
    subCatTextActive: {
        color: '#000',
    },
    serviceList: {
        padding: 15,
        gap: 15,
    },
    workerRowCard: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    workerAvatar: {
        width: 85,
        height: 85,
        borderRadius: 18,
        backgroundColor: '#1F2937',
    },
    workerDetails: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    workerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    workerNameText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '800',
    },
    serviceTitle: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 6,
    },
    distanceText: {
        color: '#00E5A0',
        fontSize: 12,
        fontWeight: '600',
    },
    priceTypeBadge: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    priceTypeText: {
        color: '#00E5A0',
        fontSize: 11,
        fontWeight: '700',
    },
    bookBtn: {
        backgroundColor: '#00E5A0',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 15,
    },
    bookBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        width: width - 30,
    },
    emptyText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 20,
    },
    emptySubText: {
        color: '#9CA3AF',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
});
