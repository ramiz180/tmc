import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CONFIG } from "../../constants/Config";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendOtp = async () => {
    if (phone.length !== 10) {
      return Alert.alert("Invalid number", "Enter valid 10-digit number");
    }

    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }), // Assuming Indian region for now
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        router.push({
          pathname: "/auth/otp",
          params: { phone: `+91${phone}` },
        });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      Alert.alert("Error", "Check your internet or backend server");
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header Logo */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="construct-outline" size={24} color="#00E5A0" />
            </View>
            <Text style={styles.brandName}>The Make Connect</Text>
          </View>

          <View style={styles.spacer} />

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Your City, Your Experts. Connect Instantly.</Text>
            <Text style={styles.subtitle}>
              From home repairs to creative projects, find verified local talent for every need.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              autoFocus={false}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
              onPress={sendOtp}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Connect Now</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By continuing, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    marginBottom: 40,
    gap: 8,
  },
  logoIcon: {
    // width: 32,
    // height: 32,
    // borderRadius: 16,
    // backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1, // Pushes content down but ensures it doesn't get hidden behind keyboard easily if we adjusted justify content
  },
  content: {
    width: "100%",
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 38,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    lineHeight: 24,
    marginBottom: 40,
    textAlign: "left",
  },
  input: {
    backgroundColor: "#1F2937", // Dark grey input
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  button: {
    backgroundColor: "#00E5A0",
    borderRadius: 30, // Pill shape
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#00E5A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#D1D5DB",
    textDecorationLine: "underline",
  },
});
