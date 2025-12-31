import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    console.log("Navigating to login...");
    router.replace("/auth/getstartedscreen");   // replace is safer for first screen
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <ImageBackground
            source={require("../assets/images/welcome-bg.jpg")}
            style={styles.image}
            imageStyle={styles.imageRadius}
            resizeMode="cover"
          >
            <View style={styles.imageOverlay} />
          </ImageBackground>
        </View>

        <View style={styles.iconCircleWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="git-network-outline" size={26} color="#00E5A0" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>The Make Connect</Text>
          <Text style={styles.subtitle}>Connecting you with skilled workers nearby.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleStart}>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  imageWrapper: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 32,
  },
  image: {
    flex: 1,
  },
  imageRadius: {
    borderRadius: 20,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  iconCircleWrapper: {
    alignItems: "center",
    marginTop: -46,
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#020617",
    borderWidth: 2,
    borderColor: "#00E5A0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5A0",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  content: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
  },
  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#00E5A0",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});
