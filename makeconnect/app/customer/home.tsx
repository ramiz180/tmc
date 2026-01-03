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
    ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/Config';

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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#F59E0B';
        case 'accepted': return '#00E5A0';
        case 'completed': return '#3B82F6';
        default: return '#6B7280';
    }
};

export default function CustomerHomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('Home');
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<any>(null);

    useEffect(() => {
        fetchLocation();
        fetchCategories();
    }, []);

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

    useEffect(() => {
        if (activeTab === 'Home') {
            fetchServices();
        } else if (activeTab === 'Bookings' || activeTab === 'Messages') {
            fetchBookings();
        }
    }, [activeTab]);

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

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings/user/${userId}/customer`);
            const data = await response.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
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

            {activeTab === 'Home' ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Greeting & Search */}
                    {!selectedCategory && (
                        <View style={styles.topSection}>
                            <Text style={styles.greeting}>Hello!</Text>
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
            ) : activeTab === 'Bookings' ? (
                <ScrollView
                    style={styles.tabBody}
                    contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
                >
                    <Text style={styles.tabTitle}>My Bookings</Text>
                    {loading ? (
                        <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                    ) : bookings.length === 0 ? (
                        <Text style={styles.emptyText}>You have no bookings yet.</Text>
                    ) : (
                        bookings.map((booking) => (
                            <TouchableOpacity
                                key={booking._id}
                                style={styles.bookingItem}
                                onPress={() => router.push(`/chat/${booking._id}`)}
                            >
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.bookingServiceName}>{booking.serviceId?.name || 'Service'}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                                        <Text style={styles.statusText}>{booking.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.bookingWorkerName}>Worker: {booking.workerId?.name}</Text>
                                <Text style={styles.bookingDate}>{new Date(booking.createdAt).toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            ) : activeTab === 'Messages' ? (
                <ScrollView
                    style={styles.tabBody}
                    contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
                >
                    <Text style={styles.tabTitle}>Messages</Text>
                    {loading ? (
                        <ActivityIndicator color="#00E5A0" style={{ marginTop: 20 }} />
                    ) : bookings.length === 0 ? (
                        <Text style={styles.emptyText}>No active conversations.</Text>
                    ) : (
                        bookings.map((booking) => (
                            <TouchableOpacity
                                key={booking._id}
                                style={styles.chatListItem}
                                onPress={() => router.push(`/chat/${booking._id}`)}
                            >
                                <View style={styles.chatAvatar}>
                                    <Text style={styles.avatarText}>{booking.workerId?.name?.[0] || 'W'}</Text>
                                </View>
                                <View style={styles.chatInfo}>
                                    <Text style={styles.chatName}>{booking.workerId?.name}</Text>
                                    <Text style={styles.chatLastMsg} numberOfLines={1}>
                                        {booking.chatMessages?.length > 0
                                            ? booking.chatMessages[booking.chatMessages.length - 1].text
                                            : 'Tap to start chatting...'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            ) : (
                <View style={styles.content}>
                    <Text style={{ color: '#FFF' }}>{activeTab} Coming Soon</Text>
                </View>
            )}

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
                <NavItem
                    icon="home"
                    label="Home"
                    active={activeTab === 'Home'}
                    onPress={() => setActiveTab('Home')}
                />
                <NavItem
                    icon="calendar-outline"
                    label="Bookings"
                    active={activeTab === 'Bookings'}
                    onPress={() => setActiveTab('Bookings')}
                />
                <NavItem
                    icon="chatbubbles-outline"
                    label="Messages"
                    active={activeTab === 'Messages'}
                    onPress={() => setActiveTab('Messages')}
                />
                <NavItem
                    icon="person-outline"
                    label="Profile"
                    active={activeTab === 'Profile'}
                    onPress={() => setActiveTab('Profile')}
                />
            </View>
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
                <Text style={styles.distanceText}>{distance} km away</Text>
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

const NavItem = ({ icon, label, active, onPress }: any) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
        <Ionicons name={icon} size={24} color={active ? "#00E5A0" : "#9CA3AF"} />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0F172A", // Dark Slate Blue
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
        fontSize: 20,
        fontWeight: '800',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconBtn: {
        padding: 4,
    },
    notificationBtn: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00E5A0',
        borderWidth: 1,
        borderColor: '#0F172A',
    },
    topSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    greeting: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 56,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    filterBtn: {
        padding: 4,
    },

    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        marginTop: 10,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    categoryCard: {
        width: (width - 40) / 2,
        height: 180,
        margin: 5,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1E293B',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: 15,
    },
    categoryName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    categoryView: {
        flex: 1,
    },
    subCatFilters: {
        marginTop: 15,
        paddingHorizontal: 15,
        maxHeight: 50,
    },
    subCatContent: {
        gap: 10,
        paddingRight: 30,
    },
    subCatChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
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
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    workerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 15,
        backgroundColor: '#334155',
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
        marginBottom: 4,
    },
    workerNameText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    serviceTitle: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 4,
    },
    distanceText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    bookBtn: {
        backgroundColor: '#00E5A0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    bookBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '800',
    },


    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        width: width - 40,
    },

    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 15,
    },
    emptySubText: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#111827',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    navLabelActive: {
        color: '#00E5A0',
    },
    tabBody: {
        flex: 1,
    },
    tabTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 20,
    },
    bookingItem: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingServiceName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    bookingWorkerName: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 4,
    },
    bookingDate: {
        color: '#4B5563',
        fontSize: 12,
    },
    chatListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    chatAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 15,
    },
    chatName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    chatLastMsg: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 2,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
