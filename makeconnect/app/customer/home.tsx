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

const CATEGORY_ICONS: any = {
    'Beauty Services': 'beauty_service_category_1766820880508.png',
    'Plumbing': 'plumbing_service_category_1766820895818.png',
    'Electrical': 'electrical_service_category_1766820911558.png',
    'Home Cleaning': 'cleaning_service_category_1766820930070.png',
    'Handyman': 'handyman_service_category_1766820946084.png',
    'Tutoring': 'tutoring_service_category_1766820960722.png',
};

const FILTERS = ['Top Rated', 'Available Now', 'Verified', 'Discounted'];

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
    const [activeFilter, setActiveFilter] = useState('Top Rated');
    const [services, setServices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'Home') {
            fetchServices();
        } else if (activeTab === 'Bookings' || activeTab === 'Messages') {
            fetchBookings();
        }
    }, [activeTab]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/services`);
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
                <TouchableOpacity>
                    <Ionicons name="menu" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>The Make Connect</Text>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#FFF" />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            {activeTab === 'Home' ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Greeting & Search */}
                    <View style={styles.topSection}>
                        <Text style={styles.greeting}>Hello!</Text>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for a service or worker..."
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity style={styles.filterBtn}>
                                <Ionicons name="options" size={20} color="#00E5A0" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Categories Grid */}
                    <View style={styles.categoriesGrid}>
                        {Object.keys(CATEGORY_ICONS).map((catName) => (
                            <TouchableOpacity
                                key={catName}
                                style={styles.categoryCard}
                            >
                                <Image
                                    source={{ uri: `file://C:/Users/HP/.gemini/antigravity/brain/0f35e5b5-e4f1-4ab0-a48b-3eab3d6e83c7/${CATEGORY_ICONS[catName]}` }}
                                    style={styles.categoryImage}
                                />
                                <View style={styles.categoryOverlay}>
                                    <Text style={styles.categoryName}>{catName}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* All Services */}
                    <View style={styles.nearbySection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Available Services</Text>
                            {loading && <ActivityIndicator size="small" color="#00E5A0" />}
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.workersList}
                        >
                            {services.length === 0 && !loading ? (
                                <Text style={styles.emptyText}>No services available yet</Text>
                            ) : (
                                services.map((service) => (
                                    <ServiceCard
                                        key={service._id}
                                        service={service}
                                        onPress={() => router.push({
                                            pathname: '/customer/servicedetails',
                                            params: { id: service._id }
                                        })}
                                    />
                                ))
                            )}
                        </ScrollView>
                    </View>

                    {/* Filter Bar */}
                    <View style={styles.filterBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {FILTERS.map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                                    onPress={() => setActiveFilter(f)}
                                >
                                    <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
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

const ServiceCard = ({ service, onPress }: any) => (
    <TouchableOpacity style={styles.workerCard} onPress={onPress}>
        <View style={styles.serviceIconContainer}>
            {service.images && service.images.length > 0 ? (
                <Image source={{ uri: service.images[0] }} style={styles.serviceImage} />
            ) : service.videos && service.videos.length > 0 ? (
                <MaterialCommunityIcons name="video" size={40} color="#00E5A0" />
            ) : (
                <MaterialCommunityIcons name="tools" size={32} color="#00E5A0" />
            )}
        </View>
        <View style={styles.workerInfo}>
            <Text style={styles.workerName} numberOfLines={1}>{service.name}</Text>
            <View style={styles.workerStats}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={styles.workerRating}>4.8</Text>
            </View>
            <Text style={styles.priceText}>₹{service.price}</Text>
            <Text style={styles.workerDist}>{service.workerName}</Text>
        </View>
    </TouchableOpacity>
);

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
        fontSize: 18,
        fontWeight: '800',
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
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        marginTop: 20,
    },
    categoryCard: {
        width: (width - 40) / 2,
        height: 120,
        margin: 5,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1E293B',
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
        padding: 12,
    },
    categoryName: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    nearbySection: {
        marginTop: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    },
    workersList: {
        paddingHorizontal: 15,
        gap: 15,
    },
    workerCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 12,
        width: 160,
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 100,
        height: 80,
        backgroundColor: '#334155',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    serviceImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    workerImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    workerInfo: {
        alignItems: 'center',
        width: '100%',
    },
    workerName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    workerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    workerRating: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    priceText: {
        color: '#00E5A0',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 4,
    },
    workerDist: {
        color: '#9CA3AF',
        fontSize: 11,
        marginTop: 2,
        textAlign: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        width: width - 30,
        paddingVertical: 20,
    },
    filterBar: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#1E293B',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    filterChipActive: {
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        borderColor: '#00E5A0',
    },
    filterChipText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#00E5A0',
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
