import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../../constants/Config";

export default function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      return Alert.alert("Invalid OTP", "Please enter the complete 6-digit code");
    }

    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: fullOtp }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        // Store userId for subsequent profile updates
        await AsyncStorage.setItem("userId", data.user._id);
        router.replace("/auth/entername");
      } else {
        Alert.alert("Error", data.message || "Invalid code");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", "Server unreachable");
    }
  };

  const formatTime = (seconds: number) => {
    const secs = seconds % 60;
    return `00:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>The Make Connect</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              A 6-digit code has been sent to{"\n"}{phone}
            </Text>

            {/* Listening Indicator */}
            <View style={styles.listeningContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#34D399" />
              <Text style={styles.listeningText}>Listening for SMS...</Text>
            </View>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      handleBackspace(digit, index);
                    }
                  }}
                  selectionColor="#00E5A0"
                />
              ))}
            </View>

            {/* Resend Timer */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive a code? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {formatTime(timer)}</Text>
              ) : (
                <TouchableOpacity onPress={() => setTimer(59)}>
                  <Text style={[styles.timerText, { textDecorationLine: 'underline' }]}>Resend Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer Actions */}
          <View style={[styles.footer, { marginBottom: 20 }]}>
            <TouchableOpacity
              style={[styles.verifyButton, (otp.every(d => d) ? {} : styles.verifyButtonDisabled)]}
              onPress={verifyOtp}
              disabled={!otp.every(d => d) || loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.changeNumberText}>Change Number?</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  listeningText: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "500",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 360,
    marginBottom: 32,
  },
  otpInput: {
    width: "14%", // Relative width
    aspectRatio: 0.9,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#00E5A0",
    backgroundColor: "rgba(0, 229, 160, 0.05)",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  timerText: {
    color: "#00E5A0",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: "flex-end",
  },
  verifyButton: {
    backgroundColor: "#10B981",
    width: "100%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#065F46",
  },
  verifyButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  changeNumberText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});
