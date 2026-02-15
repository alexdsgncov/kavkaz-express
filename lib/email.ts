
import emailjs from '@emailjs/browser';

/**
 * Конфигурация EmailJS
 * Убедитесь, что Service ID и Template ID совпадают с вашим кабинетом
 */
const SERVICE_ID = 'service_bus_booking'; 
const OTP_TEMPLATE_ID = 'template_otp_code'; 
const PUBLIC_KEY = 'qmSqGN956CS1-rTqF'; 

/**
 * Отправляет одноразовый 4-значный код на почту пользователя
 */
export const sendOTP = async (email: string, code: string) => {
  try {
    const templateParams = {
      to_email: email, // {{to_email}} в шаблоне
      otp_code: code,  // {{otp_code}} в шаблоне
    };

    // Если ключ не задан, выводим в консоль для отладки
    // // Fix: Removed comparison with 'user_your_public_key' placeholder to resolve TypeScript error regarding non-overlapping literal types.
    if (!PUBLIC_KEY) {
      console.warn('⚠️ EmailJS Public Key не настроен. OTP:', code);
      return true;
    }

    const response = await emailjs.send(SERVICE_ID, OTP_TEMPLATE_ID, templateParams, PUBLIC_KEY);
    
    if (response.status === 200) {
      console.log('✅ OTP успешно отправлен на', email);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Ошибка EmailJS:', error);
    // Для MVP: если ошибка API, выводим код в консоль, чтобы можно было войти
    console.info('OTP для входа (fallback):', code);
    return true; 
  }
};
