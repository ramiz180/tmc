import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from "../context/LanguageContext";
import { useEffect } from 'react';
import { setupNotificationListeners, removeNotificationListeners } from '../services/NotificationService';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Set up notification listeners
    const listeners = setupNotificationListeners(
      (notification) => {
        // Handle notification received while app is open
        console.log('Notification received:', notification);
      },
      (response) => {
        // Handle notification tap
        const data = response.notification.request.content.data;
        if (data.type === 'new_booking' && data.screen === 'bookings') {
          router.push('/worker/bookings');
        }
      }
    );

    return () => {
      // Clean up listeners
      removeNotificationListeners(listeners);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
