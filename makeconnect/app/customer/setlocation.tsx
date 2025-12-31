import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetTextInput, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/Config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SetLocation() {
  const [region, setRegion] = useState<any>(null);
  const [address, setAddress] = useState<string>("Locating...");
  const [primaryAddress, setPrimaryAddress] = useState<string>("Locating...");
  const [loading, setLoading] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    houseNo: "",
    landmark: "",
    contactName: "",
    contactPhone: "",
    type: "Home", // Home, Work, Other
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Bottom Sheet Snap Points
  const snapPoints = useMemo(() => ['35%', '85%'], []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(initialRegion);
      updateAddress(loc.coords.latitude, loc.coords.longitude);

      // Explicitly animate to current location to ensure map settles correctly
      setTimeout(() => {
        mapRef.current?.animateToRegion(initialRegion, 1000);
      }, 500);
    })();
  }, []);

  const updateAddress = async (lat: number, lng: number) => {
    try {
      const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (rev.length > 0) {
        const item = rev[0];
        const primary = item.name || item.street || "Unknown Place";
        const full = `${item.name || ""}, ${item.street || ""}, ${item.city || ""}, ${item.postalCode || ""}`.replace(/^, /, "").replace(/, , /g, ", ");
        setPrimaryAddress(primary);
        setAddress(full);
      }
    } catch (error) {
      console.log("Reverse geocode error:", error);
    }
  };

  const onRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    updateAddress(newRegion.latitude, newRegion.longitude);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      Keyboard.dismiss();
      const res = await Location.geocodeAsync(searchQuery);
      if (res.length > 0) {
        const { latitude, longitude } = res[0];
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
      setIsSearching(false);
    } catch (error) {
      setIsSearching(false);
      console.log("Search error:", error);
    }
  };

  const centerOnMe = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleSave = async () => {
    if (!addressDetails.houseNo.trim() || !addressDetails.contactName.trim() || !addressDetails.contactPhone.trim()) return;

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return router.replace("/auth/login");
      }

      await fetch(`${CONFIG.BACKEND_URL}/auth/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          latitude: region.latitude,
          longitude: region.longitude,
          houseNo: addressDetails.houseNo,
          apartment: addressDetails.landmark,
          contactName: addressDetails.contactName,
          contactPhone: addressDetails.contactPhone,
          label: addressDetails.type,
        }),
      });

      setLoading(false);
      router.replace("/customer/home");
    } catch (error) {
      setLoading(false);
      console.log("Save location error:", error);
      router.replace("/customer/home");
    }
  };

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Initializing Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Full Screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
      />

      {/* Fixed Center Marker (Purple to match image) */}
      <View style={styles.markerFixed} pointerEvents="none">
        <View style={styles.markerContainer}>
          <Ionicons name="location" size={44} color="#7C3AED" />
          <View style={styles.markerShadow} />
        </View>
      </View>

      {/* Top Search Controls */}
      <View style={[styles.topControls, { top: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for area, street..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {isSearching && <ActivityIndicator size="small" color="#7C3AED" />}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.locateButton, { bottom: '37%' }]}
        onPress={centerOnMe}
      >
        <Ionicons name="locate" size={24} color="#7C3AED" />
      </TouchableOpacity>

      {/* Premium Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryAddress}>{primaryAddress}</Text>
              <Text style={styles.fullAddress} numberOfLines={2}>{address}</Text>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => bottomSheetRef.current?.snapToIndex(0)}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <BottomSheetTextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#9CA3AF"
            value={addressDetails.contactName}
            onChangeText={(txt) => setAddressDetails({ ...addressDetails, contactName: txt })}
          />

          <BottomSheetTextInput
            style={styles.input}
            placeholder="Phone no."
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={addressDetails.contactPhone}
            onChangeText={(txt) => setAddressDetails({ ...addressDetails, contactPhone: txt })}
          />

          <BottomSheetTextInput
            style={styles.input}
            placeholder="House/Flat/Street Name"
            placeholderTextColor="#9CA3AF"
            value={addressDetails.houseNo}
            onChangeText={(txt) => setAddressDetails({ ...addressDetails, houseNo: txt })}
          />

          <BottomSheetTextInput
            style={styles.input}
            placeholder="Landmark (Optional)"
            placeholderTextColor="#9CA3AF"
            value={addressDetails.landmark}
            onChangeText={(txt) => setAddressDetails({ ...addressDetails, landmark: txt })}
          />

          <Text style={styles.label}>Save as</Text>
          <View style={styles.tagContainer}>
            {["Home", "Work", "Other"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tag,
                  addressDetails.type === t && styles.tagActive
                ]}
                onPress={() => setAddressDetails({ ...addressDetails, type: t })}
              >
                <Text style={[
                  styles.tagText,
                  addressDetails.type === t && styles.tagTextActive
                ]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (addressDetails.houseNo && addressDetails.contactName && addressDetails.contactPhone && !loading) ? styles.saveButtonEnabled : styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!addressDetails.houseNo || !addressDetails.contactName || !addressDetails.contactPhone || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[
                styles.saveButtonText,
                (addressDetails.houseNo && addressDetails.contactName && addressDetails.contactPhone) ? styles.saveButtonTextActive : styles.saveButtonTextDisabled
              ]}>Save and proceed to slots</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerFixed: {
    left: "50%",
    marginLeft: -22,
    marginTop: -44,
    position: "absolute",
    top: "50%",
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerShadow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: -4,
  },
  topControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 22.5,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  locateButton: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1,
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
  },
  sheetIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  sheetContent: {
    padding: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  primaryAddress: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  fullAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  changeButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeButtonText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  tag: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  tagActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#7C3AED',
  },
  saveButton: {
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonEnabled: {
    backgroundColor: '#7C3AED',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButtonTextActive: {
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
