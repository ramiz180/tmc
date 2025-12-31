import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../../constants/Config";

export default function EnterName() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const saveName = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return router.replace("/auth/login");
      }

      await fetch(`${CONFIG.BACKEND_URL}/auth/name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name }),
      });

      setLoading(false);
      router.replace("/auth/roleselectionscreen");
    } catch (error) {
      setLoading(false);
      router.replace("/auth/roleselectionscreen"); // Proceed anyway for dev, but log error
      console.log("Save name error:", error);
    }
  };

  const isDisabled = !name.trim();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrapper}>
            <Ionicons name="construct-outline" size={28} color="#00E5A0" />
          </View>
          <Text style={styles.logoText}>THE MAKE CONNECT</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>What is your name?</Text>

          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={saveName}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#00E5A0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#E5E7EB",
    fontWeight: "600",
  },
  content: {
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#1F2933",
    paddingVertical: 10,
    color: "#F9FAFB",
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#00E5A0",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});
