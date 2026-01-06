import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (pushToken, title, body, data = {}) => {
    try {
        // Check that the push token is valid
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            return { success: false, error: 'Invalid push token' };
        }

        // Create the notification message
        const message = {
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
            priority: 'high',
            channelId: 'booking-notifications',
        };

        // Send the notification
        const ticketChunk = await expo.sendPushNotificationsAsync([message]);
        console.log('Notification sent:', ticketChunk);

        return { success: true, ticket: ticketChunk[0] };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error: error.message };
    }
};

export const sendBookingNotification = async (workerPushToken, customerName, serviceName, bookingId, location, price) => {
    const title = '🔔 New Booking Request!';
    const body = `${customerName} wants to book ${serviceName}`;
    const data = {
        type: 'new_booking',
        bookingId: bookingId,
        screen: 'bookings',
        customerName,
        serviceName,
        location: location,
        price: price
    };

    return await sendPushNotification(workerPushToken, title, body, data);
};
