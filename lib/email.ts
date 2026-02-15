
import emailjs from '@emailjs/browser';

// Данные из EmailJS (https://dashboard.emailjs.com/)
const SERVICE_ID = 'service_bus_booking'; 
const OTP_TEMPLATE_ID = 'template_otp_code'; 
const PUBLIC_KEY = 'user_your_public_key'; 

/**
 * Отправляет одноразовый 4-значный код на почту пользователя
 */
export const sendOTP = async (email: string, code: string) => {
  try {
    const templateParams = {
      to_email: email,
      otp_code: code,
    };

    // Режим разработки: если ключи не настроены, выводим код в консоль
    if (PUBLIC_KEY === 'user_your_public_key') {
      console.log(`📧 [DEV MODE] OTP для ${email}: ${code}`);
      return true;
    }

    await emailjs.send(SERVICE_ID, OTP_TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки OTP через EmailJS:', error);
    return false;
  }
};
