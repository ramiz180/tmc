import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/Config';
const { width } = Dimensions.get('window');

const VideoItem = ({ vid, isVisible }: { vid: string; isVisible: boolean }) => {
    const player = useVideoPlayer(vid, (player) => {
        player.loop = true;
    });

    useEffect(() => {
        if (isVisible) {
            player.play();
        } else {
            player.pause();
        }
    }, [isVisible]);

    return (
        <VideoView
            player={player}
            style={styles.heroVideoComponent}
            contentFit="cover"
            nativeControls
            allowsPictureInPicture
        />
    );
};


export default function ServiceDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    // Auto-advance timer
    useEffect(() => {
        if (!service) return;
        const totalItems = (service.images?.length || 0) + (service.videos?.length || 0);
        if (totalItems <= 1) return;

        const timer = setInterval(() => {
            const nextIndex = (activeIndex + 1) % totalItems;
            scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
            setActiveIndex(nextIndex);
        }, 5000); // Advance every 5 seconds

        return () => clearInterval(timer);
    }, [service, activeIndex]);

    useEffect(() => {
        if (id) {
            fetchServiceDetails();
        }
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/services`);
            const data = await response.json();
            if (data.success) {
                const found = data.services.find((s: any) => s._id === id);
                setService(found);
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setBookingLoading(true);
        try {
            const customerId = await AsyncStorage.getItem('userId');
            if (!customerId) {
                Alert.alert('Error', 'Please log in to book a service');
                return;
            }

            const response = await fetch(`${CONFIG.BACKEND_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service._id,
                    customerId,
                    workerId: service.workerId?._id || service.workerId,
                }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert(
                    'Request Sent!',
                    'The worker has been notified. You can track the status in your Bookings tab.',
                    [{ text: 'OK', onPress: () => router.replace('/customer/home') }]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to connect');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            Alert.alert('Error', 'An error occurred');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00E5A0" />
            </View>
        );
    }

    if (!service) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: '#FFF' }}>Service not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={[styles.backContainer, { top: insets.top + 10 }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {(service.images && service.images.length > 0) || (service.videos && service.videos.length > 0) ? (
                        <View>
                            <ScrollView
                                ref={scrollRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={(e) => {
                                    const offset = e.nativeEvent.contentOffset.x;
                                    const index = Math.round(offset / width);
                                    if (index !== activeIndex) setActiveIndex(index);
                                }}
                                scrollEventThrottle={16}
                            >
                                {service.images?.map((img: string, index: number) => (
                                    <View key={`img-${index}`} style={styles.heroImage}>
                                        <Image source={{ uri: img }} style={styles.previewImg} />
                                    </View>
                                ))}
                                {service.videos?.map((vid: string, index: number) => {
                                    const videoIndex = (service.images?.length || 0) + index;
                                    return (
                                        <View key={`vid-${index}`} style={styles.heroImage}>
                                            <VideoItem vid={vid} isVisible={activeIndex === videoIndex} />
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* Pagination Dots */}
                            <View style={styles.paginationDots}>
                                {[...(service.images || []), ...(service.videos || [])].length > 1 &&
                                    [...(service.images || []), ...(service.videos || [])].map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.dot,
                                                i === activeIndex && styles.activeDot
                                            ]}
                                        />
                                    ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <MaterialCommunityIcons name="tools" size={80} color="#00E5A0" />
                        </View>
                    )}

                    <View style={styles.heroOverlay}>
                        <View style={styles.heroTopBadges}>
                            <Text style={styles.categoryBadge}>{service.category}</Text>
                            {(service.images?.length > 0 || service.videos?.length > 0) && (
                                <View style={styles.mediaCountBadge}>
                                    <Ionicons name="images-outline" size={14} color="#FFF" />
                                    <Text style={styles.mediaCountText}>
                                        {service.images?.length || 0} Images • {service.videos?.length || 0} Videos
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.serviceTitle}>{service.name}</Text>
                    </View>
                </View>

                <View style={styles.container}>
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Service Price</Text>
                            <Text style={styles.priceValue}>₹{service.price}</Text>
                        </View>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={16} color="#FBBF24" />
                            <Text style={styles.ratingText}>4.8 (24 Reviews)</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Worker Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Provider</Text>
                        <View style={styles.workerCard}>
                            <View style={styles.workerAvatar}>
                                <Text style={styles.avatarText}>{service.workerName ? service.workerName[0] : 'W'}</Text>
                            </View>
                            <View style={styles.workerDetails}>
                                <Text style={styles.workerName}>{service.workerName}</Text>
                                <Text style={styles.workerVerified}>Verified Professional</Text>
                            </View>
                            <TouchableOpacity style={styles.profileLink}>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                            {service.description || "No description provided for this service."}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.locationBox}>
                            <Ionicons name="location-outline" size={20} color="#00E5A0" />
                            <Text style={styles.locationText}>{service.location?.address || "N/A"}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={styles.connectBtn}
                    onPress={handleConnect}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.connectBtnText}>Connect Now</Text>
                            <Ionicons name="flash" size={20} color="#000" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hero: {
        height: 300,
        width: '100%',
        position: 'relative',
        backgroundColor: '#1E293B',
    },
    backContainer: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.3,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.2)',
        justifyContent: 'flex-end',
        padding: 20,
    },
    heroTopBadges: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    mediaCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
    },
    mediaCountText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    heroImage: {
        width: width,
        height: 300,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    previewImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroVideoComponent: {
        width: '100%',
        height: '100%',
    },
    paginationDots: {
        position: 'absolute',
        bottom: 15,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
        backgroundColor: '#00E5A0',
        width: 20,
    },
    swipeHint: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    swipeHintText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    categoryBadge: {
        backgroundColor: '#00E5A0',
        color: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    serviceTitle: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '800',
    },
    container: {
        padding: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    priceValue: {
        color: '#00E5A0',
        fontSize: 32,
        fontWeight: '800',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#1F2937',
        marginVertical: 10,
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 15,
    },
    workerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    workerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
    },
    workerDetails: {
        flex: 1,
        marginLeft: 15,
    },
    workerName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    workerVerified: {
        color: '#00E5A0',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    descriptionText: {
        color: '#9CA3AF',
        fontSize: 15,
        lineHeight: 24,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 15,
        gap: 12,
    },
    locationText: {
        color: '#F9FAFB',
        fontSize: 14,
        fontWeight: '500',
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0F172A',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#1F2937',
    },
    connectBtn: {
        backgroundColor: '#00E5A0',
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    connectBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    profileLink: {
        padding: 5,
    },
});
