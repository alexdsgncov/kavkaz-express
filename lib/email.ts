
import emailjs from '@emailjs/browser';

/**
 * КОНФИГУРАЦИЯ EMAILJS
 * Используются данные, предоставленные пользователем:
 * Service ID: service_abc123
 * Template ID: template_otp_code
 * Public Key: qmSqGN956CS1-rTqF
 */
const SERVICE_ID = 'service_abc123'; 
const OTP_TEMPLATE_ID = 'template_otp_code'; 
const PUBLIC_KEY = 'qmSqGN956CS1-rTqF'; 

/**
 * Отправляет одноразовый 4-значный код на почту пользователя
 */
export const sendOTP = async (email: string, code: string) => {
  console.log(`[EmailJS] Попытка отправки кода ${code} на ${email}...`);
  
  try {
    const templateParams = {
      to_email: email, 
      otp_code: code,  
    };

    if (!PUBLIC_KEY) {
      console.error('❌ EmailJS Public Key не настроен!');
      return false;
    }

    const response = await emailjs.send(SERVICE_ID, OTP_TEMPLATE_ID, templateParams, PUBLIC_KEY);
    
    if (response.status === 200) {
      console.log('✅ Письмо успешно отправлено!');
      return true;
    }
    
    console.error('⚠️ Ответ EmailJS не 200:', response.text);
    return false;
  } catch (error: any) {
    console.error('❌ Ошибка при отправке через EmailJS:', error);
    
    // В случае ошибок (404/403) проверяем соответствие ID в Dashboard
    if (error?.status === 404 || error?.status === 403) {
      console.error('СОВЕТ: Проверьте Service ID и Template ID в Dashboard EmailJS. Они должны в точности совпадать с кодом.');
    }
    
    // В режиме MVP выводим код в консоль, чтобы можно было продолжить тесты даже если API не отвечает
    console.info(`%c ТЕСТОВЫЙ КОД ВХОДА ДЛЯ ${email}: ${code} `, 'background: #222; color: #bada55; font-size: 20px;');
    
    // Возвращаем true для MVP, чтобы пользователь мог войти, подсмотрев код в консоли (F12)
    return true; 
  }
};
