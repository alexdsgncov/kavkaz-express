
import { User, Trip, Booking, BookingStatus } from '../types';

// Прокси для обхода CORS
const PROXY_URL = "https://api.allorigins.win/get?url=";
const DEFAULT_CHANNEL = "sjshsgakqngceiddibwbwghsidiicheb";
const DEFAULT_BOT_TOKEN = "8463215901:AAEZBfBEI4HVJfS9WnofZx3z1-e6U2cKXX4";

class TelegramSupabase {
  private botToken: string = "";
  private channelId: string = "";

  constructor() {
    this.botToken = localStorage.getItem('tg_db_token') || DEFAULT_BOT_TOKEN;
    this.channelId = localStorage.getItem('tg_db_channel') || DEFAULT_CHANNEL;
    
    if (!localStorage.getItem('tg_db_token')) {
      localStorage.setItem('tg_db_token', DEFAULT_BOT_TOKEN);
    }
    if (!localStorage.getItem('tg_db_channel')) {
      localStorage.setItem('tg_db_channel', DEFAULT_CHANNEL);
    }
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
    this.botToken = token.trim();
    this.channelId = channel.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim() || DEFAULT_CHANNEL;
    localStorage.setItem('tg_db_token', this.botToken);
    localStorage.setItem('tg_db_channel', this.channelId);
  }

  async selectTrips(): Promise<Trip[]> {
    if (!this.channelId) return [];
    try {
      const target = encodeURIComponent(`https://t.me/s/${this.channelId}`);
      const response = await fetch(`${PROXY_URL}${target}`);
      const data = await response.json();
      const html = data.contents;

      const results: Trip[] = [];
      const regex = /#TRIP_JSON({.*?})/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        try {
          const trip = JSON.parse(match[1]);
          if (trip.id) results.push(trip);
        } catch (e) { console.error("Trip parse error", e); }
      }

      const unique = Array.from(new Map(results.map(t => [t.id, t])).values());
      return unique
        .filter(t => new Date(t.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (err) {
      console.error("DB Read Error:", err);
      return [];
    }
  }

  async selectBookings(): Promise<Booking[]> {
    if (!this.channelId) return [];
    try {
      const target = encodeURIComponent(`https://t.me/s/${this.channelId}`);
      const response = await fetch(`${PROXY_URL}${target}`);
      const data = await response.json();
      const html = data.contents;

      const results: Booking[] = [];
      const regex = /#BOOKING_JSON({.*?})/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        try {
          const booking = JSON.parse(match[1]);
          if (booking.id) results.push(booking);
        } catch (e) { console.error("Booking parse error", e); }
      }
      return results;
    } catch (err) {
      return [];
    }
  }

  async insertTrip(trip: Trip): Promise<boolean> {
    if (!this.botToken || !this.channelId) return false;
    const payload = `#TRIP_JSON${JSON.stringify(trip)}`;
    const text = `🚀 **НОВЫЙ РЕЙС**\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 `📍 **${trip.from} ➔ ${trip.to}**\n` +
                 `📅 Дата: ${new Date(trip.date).toLocaleDateString('ru')}\n` +
                 `💰 Цена: ${trip.price} ₽\n` +
                 `🚌 Номер: ${trip.busPlate.toUpperCase()}\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 payload;

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: `@${this.channelId}`, text, parse_mode: 'Markdown' })
      });
      return res.ok;
    } catch (e) { return false; }
  }

  async insertBooking(booking: Booking, trip: Trip): Promise<boolean> {
    if (!this.botToken || !this.channelId) return false;
    const payload = `#BOOKING_JSON${JSON.stringify(booking)}`;
    const text = `🔔 **НОВОЕ БРОНИРОВАНИЕ**\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 `👤 Пассажир: ${booking.passengerName}\n` +
                 `📞 Тел: ${booking.passengerPhone || 'не указан'}\n` +
                 `🚍 Рейс: ${trip.from} ➔ ${trip.to}\n` +
                 `📅 Дата: ${new Date(trip.date).toLocaleDateString('ru')}\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 payload;

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: `@${this.channelId}`, text, parse_mode: 'Markdown' })
      });
      return res.ok;
    } catch (e) { return false; }
  }

  async updateUserProfile(user: User): Promise<void> {
    localStorage.setItem('kavkaz_user_local', JSON.stringify(user));
  }

  async deleteTrip(id: string): Promise<void> {
    const deleted = JSON.parse(localStorage.getItem('db_deleted_ids') || '[]');
    deleted.push(id);
    localStorage.setItem('db_deleted_ids', JSON.stringify(deleted));
  }
}

export const db = new TelegramSupabase();
