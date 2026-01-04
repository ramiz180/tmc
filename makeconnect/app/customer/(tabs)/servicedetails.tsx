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
import { CONFIG } from '../../../constants/Config';
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
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hero: {
        height: width * 1.2,
        backgroundColor: '#0A0A0A',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        height: width * 1.2,
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
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    playControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        marginBottom: 50,
    },
    mainPlayBtn: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseCircle: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    seekBtn: {
        opacity: 0.9,
    },
    mediaBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    mediaCategoryText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mediaCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mediaCountText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
    mediaProgressBarContainer: {
        height: 4,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    mediaProgressBar: {
        height: '100%',
        backgroundColor: '#00E5A0',
    },
    detailsBody: {
        padding: 24,
        backgroundColor: '#000',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        minHeight: 500,
    },
    mainInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    serviceNameText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        gap: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    ratingValueText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    reviewsCountText: {
        color: '#9CA3AF',
        fontWeight: '500',
    },
    priceSection: {
        marginBottom: 30,
    },
    priceHeadText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    priceValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
    },
    priceTotalText: {
        color: '#00E5A0',
        fontSize: 44,
        fontWeight: '900',
    },
    fixedPriceText: {
        color: '#9CA3AF',
        fontSize: 18,
        fontWeight: '600',
    },
    section: {
        marginTop: 40,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 20,
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    providerAvatarContainer: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#1F2937',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#00E5A0',
    },
    providerAvatar: {
        width: '100%',
        height: '100%',
    },
    providerInfo: {
        flex: 1,
        marginLeft: 18,
    },
    providerNameText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    verifiedBadgeText: {
        color: '#00E5A0',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    },
    subCatCard: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 20,
        gap: 15,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    subCatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    subCatBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00E5A0',
    },
    subCatItemText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    descriptionText: {
        color: '#9CA3AF',
        fontSize: 16,
        lineHeight: 28,
        fontWeight: '500',
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#111827',
    },
    bookNowBtn: {
        backgroundColor: '#00E5A0',
        height: 65,
        borderRadius: 20,
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
        fontSize: 20,
        fontWeight: '900',
    },
    heroPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
