
import emailjs from '@emailjs/browser';

// Замените эти ID на свои из аккаунта EmailJS (emailjs.com)
const SERVICE_ID = 'service_bus_booking';
const TEMPLATE_ID = 'template_booking_notify';
const PUBLIC_KEY = 'user_your_public_key'; // Если нет ключа, вызов просто вернет успех для MVP

export const sendBookingNotification = async (bookingData: any) => {
  try {
    const templateParams = {
      to_name: 'Администратор Kavkaz Express',
      passenger_name: bookingData.passengerName,
      passenger_phone: bookingData.passengerPhone,
      trip_info: `Рейс: ${bookingData.tripId} | Дата: ${new Date().toLocaleDateString()}`,
      booking_id: bookingData.id
    };

    // Для MVP, если ключи не настроены, просто имитируем задержку
    if (PUBLIC_KEY.includes('your_public_key')) {
        console.log('EmailJS not configured, skipping email send...', templateParams);
        return true;
    }

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return response.status === 200;
  } catch (error) {
    console.error('EmailJS Error:', error);
    return false;
  }
};
