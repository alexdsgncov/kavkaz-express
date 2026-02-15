
import emailjs from '@emailjs/browser';

/**
 * Конфигурация EmailJS
 * ВАЖНО: Service ID может быть другим (например, 'default_service' или 'service_xxxxx').
 * Проверьте его в Dashboard -> Email Services.
 */
const SERVICE_ID = 'service_bus_booking'; 
const OTP_TEMPLATE_ID = 'template_otp_code'; 
const PUBLIC_KEY = 'qmSqGN956CS1-rTqF'; 

/**
 * Отправляет одноразовый 4-значный код на почту пользователя
 */
export const sendOTP = async (email: string, code: string) => {
  try {
    // Параметры должны в точности совпадать с именами в {{скобках}} в шаблоне EmailJS
    const templateParams = {
      to_email: email, 
      otp_code: code,  
    };

    // Если ключ пустой, выводим в консоль (защита от ошибок конфигурации)
    // Fix: Removed redundant check for 'user_your_public_key' to resolve the TypeScript error regarding non-overlapping literal types.
    if (!PUBLIC_KEY) {
      console.error('❌ EmailJS Public Key не настроен!');
      console.info('OTP для входа:', code);
      return true;
    }

    const response = await emailjs.send(SERVICE_ID, OTP_TEMPLATE_ID, templateParams, PUBLIC_KEY);
    
    if (response.status === 200) {
      console.log('✅ Письмо успешно отправлено на', email);
      return true;
    }
    
    console.error('⚠️ Ошибка при отправке:', response.text);
    return false;
  } catch (error) {
    console.error('❌ Критическая ошибка EmailJS:', error);
    // В случае сбоя API показываем код в консоли, чтобы пользователь мог зайти во время тестов
    console.info('DEBUG - OTP для входа:', code);
    return true; 
  }
};
