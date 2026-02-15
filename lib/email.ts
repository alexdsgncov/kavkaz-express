
import emailjs from '@emailjs/browser';
import { Trip, Booking } from '../types';

// Данные из EmailJS (https://dashboard.emailjs.com/)
const SERVICE_ID = 'service_bus_booking'; 
const TEMPLATE_ID = 'template_booking_notify'; 
const OTP_TEMPLATE_ID = 'template_otp_code'; // Специальный шаблон для OTP
const PUBLIC_KEY = 'user_your_public_key'; 

export const sendOTP = async (email: string, code: string) => {
  try {
    const templateParams = {
      to_email: email,
      otp_code: code,
    };

    if (PUBLIC_KEY === 'user_your_public_key') {
      console.log(`📧 [DEV MODE] OTP для ${email}: ${code}`);
      return true;
    }

    await emailjs.send(SERVICE_ID, OTP_TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки OTP:', error);
    return false;
  }
};

export const sendBookingNotification = async (trip: Trip, booking: Partial<Booking>) => {
  try {
    const templateParams = {
      passenger_name: booking.passengerName,
      passenger_phone: booking.passengerPhone,
      route: `${trip.from} — ${trip.to}`,
      departure_time: `${trip.date} в ${trip.departureTime}`,
      price: `${trip.price} ₽`,
      booking_id: booking.id || 'NEW_BOOKING'
    };

    if (PUBLIC_KEY === 'user_your_public_key') {
      console.log('📧 EmailJS не настроен. Данные бронирования:', templateParams);
      return true;
    }

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('❌ Ошибка EmailJS:', error);
    return false;
  }
};
