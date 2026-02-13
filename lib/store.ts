
import { User, Trip } from '../types';

// Используем прокси для обхода CORS при чтении публичного превью канала
const CORS_PROXY = "https://api.allorigins.win/get?url=";

/**
 * TelegramDB - Драйвер "базы данных" на базе канала.
 * Каждое сообщение в канале = Запись в таблице.
 */
class TelegramDB {
  private botToken: string = "";
  private channelId: string = ""; // username канала без @

  constructor() {
    this.botToken = localStorage.getItem('tg_db_token') || "";
    this.channelId = localStorage.getItem('tg_db_channel') || "";
  }

  async testConnection(): Promise<boolean> {
    if (!this.botToken || !this.channelId) return false;
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getChat?chat_id=@${this.channelId}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  setCredentials(token: string, channel: string) {
    this.botToken = token;
    this.channelId = channel.replace('@', '');
    localStorage.setItem('tg_db_token', token);
    localStorage.setItem('tg_db_channel', this.channelId);
  }

  /**
   * SELECT * FROM Trips
   * Парсит историю канала и собирает все валидные записи рейсов.
   */
  async selectTrips(): Promise<Trip[]> {
    if (!this.botToken || !this.channelId) return [];

    try {
      // Telegram предоставляет веб-превью для публичных каналов (даже если у них случайное имя)
      const targetUrl = encodeURIComponent(`https://t.me/s/${this.channelId}`);
      const response = await fetch(`${CORS_PROXY}${targetUrl}`);
      const data = await response.json();
      const html = data.contents;

      const trips: Trip[] = [];
      // Ищем блоки данных: #TRIP_JSON{...}
      const regex = /#TRIP_JSON({.*?})/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        try {
          const trip = JSON.parse(match[1]);
          // Базовая валидация данных
          if (trip.id && trip.price) {
            trips.push(trip);
          }
        } catch (e) {
          console.error("Ошибка парсинга строки БД:", e);
        }
      }

      // Возвращаем уникальные записи (последняя по времени имеет приоритет)
      const uniqueTrips = Array.from(new Map(trips.map(t => [t.id, t])).values());
      
      return uniqueTrips
        .filter(t => new Date(t.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (err) {
      console.error("Критическая ошибка БД:", err);
      return [];
    }
  }

  /**
   * INSERT INTO Trips
   * Отправляет новую запись в лог канала.
   */
  async insertTrip(trip: Trip): Promise<boolean> {
    const message = `🛠 **DB_TRANSACTION: INSERT_TRIP**\n` +
                    `📍 ${trip.from} ➔ ${trip.to}\n` +
                    `📅 ${new Date(trip.date).toLocaleDateString('ru')}\n` +
                    `🆔 ID: ${trip.id}\n\n` +
                    `#TRIP_JSON${JSON.stringify(trip)}`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: `@${this.channelId}`,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async updateUserProfile(user: User): Promise<void> {
    localStorage.setItem('kavkaz_user_local', JSON.stringify(user));
  }

  // Локальное удаление (для MVP), так как удаление из канала через API требует MessageID
  async deleteTrip(id: string): Promise<void> {
    const deleted = JSON.parse(localStorage.getItem('db_deleted_ids') || '[]');
    deleted.push(id);
    localStorage.setItem('db_deleted_ids', JSON.stringify(deleted));
  }
}

export const db = new TelegramDB();
