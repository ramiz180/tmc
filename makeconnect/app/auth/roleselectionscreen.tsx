import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../../constants/Config";

const HIRER_IMAGE = {
  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcfhobzhREYSFR32tM4CXbQxr175mLDG4FvxPs37zYH87zYOocLB301CgJjmpPo11TaTXs_Ai1IEjF6oG5JJaRPJqrAzs1mKyySAgl84fZNkZ3F9L-Red3AS7_n7lhSix1-xMiy_6-4lQ5FHey_gitva-xs-nQH7QQgv4aoOljC2GIrpOKj57xEh7ZQihFoCrc7JwGQZqJVLEp29be9Zn2vpr0lG9EKBiwC2aJT1qCdAf6p7iKpPXrlADC_thMcVWwqk8zx2dlX5oe3EwUwaFGUmZbM24GmLKDxeTkOQ6QUNSaj5yKo",
};

const WORKER_IMAGE = {
  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfDYdZ2jlh5ZGXGDji67XLFwmGNBLlW3Th0bYiZSp5X62GA8zy8IZOqsAb7lLcfd1bM8ONZxwGbkN8d6YblUwibXd_QTKg9RYk4UZqZHrKXWC-4xf7vcfB5kWjpNEgAjb7TZhnuPpOKqM2tiG3hQhv-oMQMnBIQ9ZJVkVLEp29be9Zn2vpr0lG9EKBiwC2aJT1qCdAf6p7iKpPXrlADC_thMcVWwqk8zx2dlX5oe3EwUwaFGUmZbM24GmLKDxeTkOQ6QUNSaj5yKo",
};

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"hirer" | "worker" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || loading) return;

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return router.replace("/auth/login");
      }

      // Map 'hirer' to 'customer' for backend
      const backendRole = selectedRole === "hirer" ? "customer" : "worker";

      await fetch(`${CONFIG.BACKEND_URL}/auth/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: backendRole }),
      });

      setLoading(false);
      if (selectedRole === "hirer") {
        router.push("/customer/setlocation");
      } else {
        router.push("/worker/setlocation");
      }
    } catch (error) {
      setLoading(false);
      console.log("Save role error:", error);
      // Fallback navigation
      if (selectedRole === "hirer") {
        router.push("/customer/setlocation");
      } else {
        router.push("/worker/setlocation");
      }
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="construct-outline" size={26} color="#34D399" />
            <Text style={styles.logoText}>The Make Connect</Text>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <Text style={styles.title}>Welcome! How will you be using the app?</Text>

        <View style={styles.cardsContainer}>
          {/* Hirer card */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.card,
              selectedRole === "hirer" && styles.cardSelected,
            ]}
            onPress={() => setSelectedRole("hirer")}
          >
            <View style={styles.cardImageWrapper}>
              <ImageBackground
                source={HIRER_IMAGE}
                style={styles.cardImage}
                imageStyle={styles.cardImageBorderRadius}
              >
                <View style={styles.cardImageOverlay} />
              </ImageBackground>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I Want to Hire</Text>
              <Text style={styles.cardSubtitle}>
                Find and book skilled professionals near you.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Worker card */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.card,
              selectedRole === "worker" && styles.cardSelected,
            ]}
            onPress={() => setSelectedRole("worker")}
          >
            <View style={styles.cardImageWrapper}>
              <ImageBackground
                source={WORKER_IMAGE}
                style={styles.cardImage}
                imageStyle={styles.cardImageBorderRadius}
              >
                <View style={styles.cardImageOverlay} />
              </ImageBackground>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I am a Worker</Text>
              <Text style={styles.cardSubtitle}>
                Find local jobs and manage your work.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !selectedRole && styles.primaryButtonDisabled]}
            disabled={!selectedRole}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log("Help choosing role")}>
            <Text style={styles.helperText}>Which one should I choose?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    width: "60%",
    marginTop: 24,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(52, 211, 153, 0.2)",
  },
  progressDotActive: {
    backgroundColor: "#34D399",
  },
  title: {
    marginTop: 32,
    marginBottom: 24,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#F9FAFB",
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#34D399",
    shadowColor: "#34D399",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  cardImageWrapper: {
    height: 140,
    width: "100%",
  },
  cardImage: {
    flex: 1,
  },
  cardImageBorderRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  footer: {
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#34D399",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  helperText: {
    marginTop: 4,
    fontSize: 14,
    textAlign: "center",
    color: "#34D399",
    textDecorationLine: "underline",
  },
});
