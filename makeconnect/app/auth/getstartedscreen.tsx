import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Placeholder image for the "3 workers".
// In a real app, this would be a local asset like require("../../assets/images/workers_illustration.png")
const BACKGROUND_IMAGE_URI = "https://img.freepik.com/free-vector/construction-workers-team-flat-style_23-2147773289.jpg?w=740&t=st=1703616000~exp=1703616600~hmac=abcdef";

export default function GetStartedScreen() {
    const router = useRouter();

    const handleContinue = () => {
        router.push("/auth/login");
    };

    const handleGuest = () => {
        console.log("Browse as guest clicked");
        // Navigate to guest flow or home if applicable
        // router.push("/guest/home");
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background Image / Gradient Layer */}
            <ImageBackground
                source={{ uri: BACKGROUND_IMAGE_URI }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)", "#000000"]}
                    style={styles.gradientOverlay}
                />
            </ImageBackground>

            <SafeAreaView style={styles.safeArea}>
                {/* Header Logo */}
                <View style={styles.header}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="construct-outline" size={20} color="#00E5A0" />
                    </View>
                    <Text style={styles.brandName}>The Make Connect</Text>
                </View>

                <View style={styles.spacer} />

                {/* content */}
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>
                        Find Skilled Help,{'\n'}Right Next Door.
                    </Text>
                    <Text style={styles.subtitle}>
                        Connect with trusted local professionals for any job, big or small.
                    </Text>

                    {/* Buttons */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.8}
                        onPress={handleContinue}
                    >
                        <Text style={styles.primaryButtonText}>Continue with Phone Number</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        activeOpacity={0.6}
                        onPress={handleGuest}
                    >
                        <Text style={styles.secondaryButtonText}>Browse as guest</Text>
                    </TouchableOpacity>

                    {/* Footer Terms */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our{" "}
                            <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000000",
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20, // Adjust for status bar
        gap: 8,
    },
    logoIcon: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    spacer: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: "#D1D5DB",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    primaryButton: {
        height: 56,
        backgroundColor: "#00E5A0",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#00E5A0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000000",
    },
    secondaryButton: {
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    linkText: {
        color: '#FFFFFF',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
});
