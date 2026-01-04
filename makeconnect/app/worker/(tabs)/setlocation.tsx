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
import { CONFIG } from '../../../constants/Config';

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
      router.replace("/worker");
    } catch (error) {
      setLoading(false);
      console.log("Save location error:", error);
      router.replace("/worker");
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
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#000',
    borderRadius: 24,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  locateButton: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
    zIndex: 1,
  },
  sheetBackground: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#000',
  },
  sheetIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#1F2937',
    borderRadius: 3,
  },
  sheetContent: {
    padding: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  primaryAddress: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6,
  },
  fullAddress: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: 'rgba(0, 229, 160, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#00E5A0',
  },
  changeButtonText: {
    color: '#00E5A0',
    fontWeight: '800',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#111827',
    marginVertical: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    marginBottom: 16,
    fontSize: 16,
    color: '#FFF',
    paddingHorizontal: 20,
    backgroundColor: '#111827',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 35,
  },
  tag: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginRight: 15,
    backgroundColor: '#111827',
  },
  tagActive: {
    backgroundColor: '#00E5A0',
    borderColor: '#00E5A0',
  },
  tagText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  tagTextActive: {
    color: '#000',
  },
  saveButton: {
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonEnabled: {
    backgroundColor: '#00E5A0',
    shadowColor: '#00E5A0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#111827',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '900',
  },
  saveButtonTextActive: {
    color: '#000',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
