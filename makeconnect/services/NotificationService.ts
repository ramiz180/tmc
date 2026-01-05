import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/Config';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('booking-notifications', {
                name: 'Booking Notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#00E5A0',
                sound: 'default',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Push notification permission not granted');
                return null;
            }

            // Try to get push token - this might fail if Firebase is not configured
            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: 'your-project-id', // Optional - can work without this
                })).data;

                console.log('Push token:', token);
            } catch (tokenError) {
                console.log('Could not get push token. This is normal in development without Firebase setup.');
                console.log('Error:', tokenError);
                return null;
            }
        } else {
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        return token;
    } catch (error) {
        console.error('Error in registerForPushNotificationsAsync:', error);
        return null;
    }
}

export async function savePushTokenToBackend(userId: string, pushToken: string) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pushToken }),
        });

        const data = await response.json();
        if (data.success) {
            console.log('Push token saved to backend');
            await AsyncStorage.setItem('pushToken', pushToken);
        }
    } catch (error) {
        console.error('Error saving push token:', error);
    }
}

export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
    // Listener for when notification is received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        if (onNotificationTapped) {
            onNotificationTapped(response);
        }
    });

    return {
        notificationListener,
        responseListener,
    };
}

export function removeNotificationListeners(listeners: {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
}) {
    listeners.notificationListener.remove();
    listeners.responseListener.remove();
}
