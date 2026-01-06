
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from "../context/LanguageContext";
import { useEffect, useState } from 'react';
import { setupNotificationListeners, removeNotificationListeners } from '../services/NotificationService';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';
import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import IncomingBookingScreen from "../components/IncomingBookingScreen";

export default function RootLayout() {
  const router = useRouter();
  const [incomingBooking, setIncomingBooking] = useState<any>(null);

  useEffect(() => {
    // 1. Setup Notification Channel
    async function setupChannel() {
      await notifee.createChannel({
        id: 'booking_channel',
        name: 'Booking Requests',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });
    }
    setupChannel();

    // 2. Handle NOTIFEE events (Foreground & Background actions)
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data?.type === 'new_booking') {
        const { customerName, serviceName, location, price, bookingId } = detail.notification.data;
        setIncomingBooking({ customerName, serviceName, location, price, bookingId });
      }
    });

    // 3. Keep existing Expo listeners for compatibility or other types
    const listeners = setupNotificationListeners(
      async (notification) => {
        // Handle notification received while app is open
        console.log('Notification received:', notification);
        const data = notification.request.content.data;

        // If it's a booking, show our custom full screen UI immediately
        if (data.type === 'new_booking') {
          // Trigger local Notifee for full screen effect if needed, OR just show state
          setIncomingBooking({
            customerName: data.customerName,
            serviceName: data.serviceName,
            location: data.location,
            price: data.price || 'check details',
            bookingId: data.bookingId
          });
        }
      },
      (response) => {
        // Handle notification tap
        const data = response.notification.request.content.data;
        if (data.type === 'new_booking') {
          // If tapped from tray, show the screen
          setIncomingBooking({
            customerName: data.customerName,
            serviceName: data.serviceName,
            location: data.location,
            price: data.price || 'check details',
            bookingId: data.bookingId
          });
        } else if (data.screen === 'bookings') {
          router.push('/worker/bookings');
        }
      }
    );

    // 4. Check if app was opened by a notification (Initial Notification)
    notifee.getInitialNotification().then(initialNotification => {
      if (initialNotification?.notification.data?.type === 'new_booking') {
        const { customerName, serviceName, location, price, bookingId } = initialNotification.notification.data;
        setIncomingBooking({ customerName, serviceName, location, price, bookingId });
      }
    });

    return () => {
      removeNotificationListeners(listeners);
      unsubscribeNotifee();
    };
  }, []);

  const handleAccept = async () => {
    // Call API to accept booking
    if (incomingBooking?.bookingId) {
      try {
        await fetch(`https://gnixar-backend.onrender.com/api/bookings/${incomingBooking.bookingId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'accepted' })
        });
        setIncomingBooking(null);
        router.push('/worker/bookings');
      } catch (error) {
        console.error('Accept error', error);
      }
    }
  };

  const handleReject = async () => {
    if (incomingBooking?.bookingId) {
      try {
        await fetch(`https://gnixar-backend.onrender.com/api/bookings/${incomingBooking.bookingId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        setIncomingBooking(null);
      } catch (error) {
        console.error('Reject error', error);
        setIncomingBooking(null);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }} />

        <Modal
          visible={!!incomingBooking}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setIncomingBooking(null)}
        >
          {incomingBooking && (
            <IncomingBookingScreen
              customerName={incomingBooking.customerName || "Customer"}
              serviceName={incomingBooking.serviceName || "Service"}
              location={incomingBooking.location || "Location"}
              price={incomingBooking.price}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}
        </Modal>

      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

