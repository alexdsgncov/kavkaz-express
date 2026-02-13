
import { User, Trip } from '../types';

// Прокси для обхода ограничений браузера на запросы к другим сайтам
const PROXY_URL = "https://api.allorigins.win/get?url=";

class TelegramSupabase {
  private botToken: string = "";
  private channelId: string = ""; // Secret public username

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
    this.channelId = channel.replace('@', '').trim();
    localStorage.setItem('tg_db_token', token);
    localStorage.setItem('tg_db_channel', this.channelId);
  }

  /**
   * Имитация SELECT * FROM trips
   */
  async selectTrips(): Promise<Trip[]> {
    if (!this.channelId) return [];

    try {
      // Читаем публичный превью-интерфейс канала
      const target = encodeURIComponent(`https://t.me/s/${this.channelId}`);
      const response = await fetch(`${PROXY_URL}${target}`);
      const data = await response.json();
      const html = data.contents;

      const results: Trip[] = [];
      // Ищем данные внутри тегов #DB_JSON{...}
      const regex = /#DB_JSON({.*?})/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        try {
          const trip = JSON.parse(match[1]);
          if (trip.id) results.push(trip);
        } catch (e) {
          console.error("Ошибка парсинга записи:", e);
        }
      }

      // Оставляем только уникальные и актуальные записи
      const unique = Array.from(new Map(results.map(t => [t.id, t])).values());
      return unique
        .filter(t => new Date(t.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (err) {
      console.error("Ошибка чтения БД:", err);
      return [];
    }
  }

  /**
   * Имитация INSERT INTO trips
   */
  async insertTrip(trip: Trip): Promise<boolean> {
    if (!this.botToken || !this.channelId) return false;

    const payload = `#DB_JSON${JSON.stringify(trip)}`;
    const text = `📦 **NEW_TRANSACTION: TRIP_CREATED**\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 `Маршрут: ${trip.from} ➔ ${trip.to}\n` +
                 `Дата: ${new Date(trip.date).toLocaleDateString('ru')}\n` +
                 `ID: \`${trip.id}\`\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 payload;

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: `@${this.channelId}`,
          text: text,
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

  async deleteTrip(id: string): Promise<void> {
    // В No-Backend на каналах "удаление" — это запись ID в локальный бан-лист
    const deleted = JSON.parse(localStorage.getItem('db_deleted_ids') || '[]');
    deleted.push(id);
    localStorage.setItem('db_deleted_ids', JSON.stringify(deleted));
  }
}

export const db = new TelegramSupabase();
