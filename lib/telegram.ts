
/**
 * Настройка уведомлений в Telegram:
 * Бот: 8568660026:AAHO2d0PIzqO8xe0PAvFkxUKJcF4PqA4hEU
 * ID получателя: 7975371720
 */
const BOT_TOKEN = '8568660026:AAHO2d0PIzqO8xe0PAvFkxUKJcF4PqA4hEU'; 
const CHAT_ID = '7975371720'; 

export const sendTelegramNotification = async (message: string) => {
  // Fix: Removed the check for 'YOUR_CHAT_ID' to resolve the TypeScript error regarding non-overlapping literal types.
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram Bot: Токен или Chat ID не настроены.');
    return true; 
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка Telegram API:', errorData);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Ошибка сети при отправке в Telegram:', error);
    return false;
  }
};
