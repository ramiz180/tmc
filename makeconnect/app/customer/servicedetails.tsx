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
            const response = await fetch(`${CONFIG.BACKEND_URL}/services/${id}`);
            const data = await response.json();
            if (data.success) {
                setService(data.service);
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        router.push({
            pathname: '/customer/bookingdetails',
            params: { id: service._id }
        });
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

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    {/* Top Buttons Overlay */}
                    <View style={[styles.heroHeader, { top: insets.top + 10 }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.heroCircleBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.heroCircleBtn}>
                                <Ionicons name="heart" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.heroCircleBtn}>
                                <Ionicons name="share-social" size={22} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {(service.images && service.images.length > 0) || (service.videos && service.videos.length > 0) ? (
                        <View style={{ flex: 1 }}>
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
                                    <View key={`img-${index}`} style={styles.heroMediaItem}>
                                        <Image source={{ uri: img }} style={styles.fullMedia} />
                                    </View>
                                ))}
                                {service.videos?.map((vid: string, index: number) => {
                                    const videoIndex = (service.images?.length || 0) + index;
                                    return (
                                        <View key={`vid-${index}`} style={styles.heroMediaItem}>
                                            <VideoItem vid={vid} isVisible={activeIndex === videoIndex} />
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* Video Controls Overlay */}
                            <View style={styles.videoControlsOverlay}>
                                {/* Play/Seek Controls */}
                                <View style={styles.playControls}>
                                    <TouchableOpacity><Ionicons name="play-skip-back" size={32} color="#FFF" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.seekBtn}><MaterialCommunityIcons name="replay" size={32} color="#FFF" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.mainPlayBtn}>
                                        <View style={styles.pauseCircle}>
                                            <Ionicons name="pause" size={36} color="#FFF" />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.seekBtn}><MaterialCommunityIcons name="forward" size={32} color="#FFF" /></TouchableOpacity>
                                    <TouchableOpacity><Ionicons name="play-skip-forward" size={32} color="#FFF" /></TouchableOpacity>
                                </View>

                                <View style={styles.mediaBottomRow}>
                                    <Text style={styles.mediaCategoryText}>{service.category}</Text>
                                    <View style={styles.mediaCountBadge}>
                                        <Ionicons name="images" size={14} color="#FFF" />
                                        <Text style={styles.mediaCountText}>
                                            {service.images?.length || 0} Images • {service.videos?.length || 0} Videos
                                        </Text>
                                    </View>
                                </View>

                                {/* Bottom Progress Bar */}
                                <View style={styles.mediaProgressBarContainer}>
                                    <View style={[styles.mediaProgressBar, { width: '35%' }]} />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <MaterialCommunityIcons name="tools" size={80} color="#00E5A0" />
                        </View>
                    )}
                </View>

                <View style={styles.detailsBody}>
                    <View style={styles.mainInfoRow}>
                        <Text style={styles.serviceNameText}>{service.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={16} color="#FBBF24" />
                            <Text style={styles.ratingValueText}>
                                {service.workerId?.rating?.toFixed(1) || '4.8'}{' '}
                                <Text style={styles.reviewsCountText}>(24 Reviews)</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.priceSection}>
                        <Text style={styles.priceHeadText}>SERVICE PRICE</Text>
                        <View style={styles.priceValueRow}>
                            <Text style={styles.priceTotalText}>₹{service.price}</Text>
                            <Text style={styles.fixedPriceText}>(Fixed Price)</Text>
                        </View>
                    </View>

                    {/* Worker Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Provider</Text>
                        <TouchableOpacity style={styles.providerCard}>
                            <View style={styles.providerAvatarContainer}>
                                <Image
                                    source={{ uri: service.workerId?.profileImage || 'https://via.placeholder.com/150' }}
                                    style={styles.providerAvatar}
                                />
                            </View>
                            <View style={styles.providerInfo}>
                                <Text style={styles.providerNameText}>{service.workerName || service.workerId?.name}</Text>
                                <Text style={styles.verifiedBadgeText}>Verified Professional</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Sub-categories */}
                    {service.subCategories && service.subCategories.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sub-categories</Text>
                            <View style={styles.subCatCard}>
                                {service.subCategories.map((sub: string, i: number) => (
                                    <View key={i} style={styles.subCatRow}>
                                        <View style={styles.subCatBullet} />
                                        <Text style={styles.subCatItemText}>{sub}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                            {service.description || "Expert plumbing services specializing in pipe repair, leak detection, and installations. Available for emergency calls. 10+ years of experience in residential plumbing."}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.bottomAction, { paddingBottom: insets.top < 40 ? 20 : insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={styles.bookNowBtn}
                    onPress={handleConnect}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.bookNowBtnText}>Book Now</Text>
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
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hero: {
        height: width * 1.1, // Aspect ratio closer to mockup
        backgroundColor: '#111',
        position: 'relative',
    },
    heroHeader: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100,
    },
    heroCircleBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroActions: {
        flexDirection: 'row',
        gap: 12,
    },
    heroMediaItem: {
        width: width,
        height: width * 1.1,
    },
    fullMedia: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroVideoComponent: {
        width: '100%',
        height: '100%',
    },
    videoControlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
    },
    playControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 25,
        marginBottom: 40,
    },
    mainPlayBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    seekBtn: {
        opacity: 0.9,
    },
    mediaBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    mediaCategoryText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '600',
    },
    mediaCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 8,
    },
    mediaCountText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    mediaProgressBarContainer: {
        height: 4,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    mediaProgressBar: {
        height: '100%',
        backgroundColor: '#00E5A0',
    },
    detailsBody: {
        padding: 24,
        backgroundColor: '#000',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        marginTop: -36,
    },
    mainInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    serviceNameText: {
        color: '#FFF',
        fontSize: 34,
        fontWeight: '800',
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#222',
    },
    ratingValueText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    reviewsCountText: {
        color: '#666',
        fontWeight: '400',
    },
    priceSection: {
        marginBottom: 25,
    },
    priceHeadText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    priceValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 10,
    },
    priceTotalText: {
        color: '#00E5A0',
        fontSize: 48,
        fontWeight: '800',
    },
    fixedPriceText: {
        color: '#666',
        fontSize: 18,
        fontWeight: '500',
    },
    section: {
        marginTop: 35,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 18,
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    providerAvatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#222',
        overflow: 'hidden',
    },
    providerAvatar: {
        width: '100%',
        height: '100%',
    },
    providerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    providerNameText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    verifiedBadgeText: {
        color: '#00E5A0',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 3,
    },
    subCatCard: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 24,
        gap: 15,
        marginTop: 5,
    },
    subCatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    subCatBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00E5A0',
    },
    subCatItemText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    descriptionText: {
        color: '#888',
        fontSize: 17,
        lineHeight: 28,
        fontWeight: '400',
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#111',
    },
    bookNowBtn: {
        backgroundColor: '#00E5A0',
        height: 68,
        borderRadius: 22,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#00E5A0',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
    },
    bookNowBtnText: {
        color: '#000',
        fontSize: 22,
        fontWeight: '800',
    },
    heroPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
