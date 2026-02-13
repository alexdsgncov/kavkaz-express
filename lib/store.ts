
import { User, Trip, Booking } from '../types';

const KEYS = {
  TRIPS: 'kavkaz_trips_local',
  BOOKINGS: 'kavkaz_bookings_local',
  USER: 'kavkaz_user_local'
};

class LocalStore {
  async selectTrips(): Promise<Trip[]> {
    const data = localStorage.getItem(KEYS.TRIPS);
    const trips: Trip[] = data ? JSON.parse(data) : [];
    // Фильтруем только будущие рейсы
    return trips
      .filter(t => new Date(t.date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async selectBookings(): Promise<Booking[]> {
    const data = localStorage.getItem(KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  }

  async insertTrip(trip: Trip): Promise<boolean> {
    const trips = await this.selectTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    if (existingIndex > -1) {
      trips[existingIndex] = trip;
    } else {
      trips.push(trip);
    }
    localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
    return true;
  }

  async insertBooking(booking: Booking): Promise<boolean> {
    const bookings = await this.selectBookings();
    bookings.push(booking);
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
    return true;
  }

  async deleteTrip(id: string): Promise<void> {
    const trips = await this.selectTrips();
    const filtered = trips.filter(t => t.id !== id);
    localStorage.setItem(KEYS.TRIPS, JSON.stringify(filtered));
  }

  async updateUserProfile(user: User): Promise<void> {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  async testConnection(): Promise<boolean> {
    return true; // Локальное хранилище всегда "подключено"
  }
}

export const db = new LocalStore();
