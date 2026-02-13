
import { Trip, Booking, BookingStatus, User, TripStatus } from '../types';

const DB_PREFIX = 'kx_prod_v2_';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class ProductStore {
  private _storage = {
    get: <T>(key: string): T[] => JSON.parse(localStorage.getItem(DB_PREFIX + key) || '[]'),
    set: <T>(key: string, data: T[]) => localStorage.setItem(DB_PREFIX + key, JSON.stringify(data))
  };

  constructor() {
    this.initDemoData();
  }

  private initDemoData() {
    if (this._storage.get('trips').length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const trips: Trip[] = [
        {
          id: 't_001',
          driverId: 'd_admin',
          date: today,
          price: 5000,
          totalSeats: 18,
          availableSeats: 14,
          occupiedSeats: [1, 2, 5, 8],
          from: 'Назрань',
          to: 'Москва',
          departureAddress: 'Автовокзал Назрань, ул. Чеченская',
          arrivalAddress: 'Москва, м. Щелковская (Центральный АВ)',
          departureTime: '09:00',
          arrivalTime: '07:30',
          busPlate: 'х777хх06',
          busModel: 'Mercedes Sprinter VIP',
          type: 'Luxury',
          status: TripStatus.SCHEDULED
        }
      ];
      this._storage.set('trips', trips);
    }
  }

  async getTrips(filters?: { date?: string }): Promise<Trip[]> {
    await delay(400);
    let trips = this._storage.get<Trip>('trips');
    if (filters?.date) trips = trips.filter(t => t.date.startsWith(filters.date!));
    return trips;
  }

  async createTrip(trip: Trip): Promise<void> {
    const trips = this._storage.get<Trip>('trips');
    trips.push(trip);
    this._storage.set('trips', trips);
  }

  async deleteTrip(id: string): Promise<void> {
    const trips = this._storage.get<Trip>('trips');
    this._storage.set('trips', trips.filter(t => t.id !== id));
    const bookings = this._storage.get<Booking>('bookings');
    this._storage.set('bookings', bookings.filter(b => b.tripId !== id));
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    await delay(1000);
    const bookings = this._storage.get<Booking>('bookings');
    const newBooking: Booking = {
      id: 'bk_' + Math.random().toString(36).substr(2, 9),
      tripId: booking.tripId!,
      passengerId: booking.passengerId!,
      passengerName: booking.passengerName!,
      passengerPhone: booking.passengerPhone!,
      status: BookingStatus.PENDING,
      timestamp: new Date().toISOString(),
      qrCode: `KX-${Math.random().toString(36).toUpperCase().substr(2, 6)}`
    };
    bookings.push(newBooking);
    this._storage.set('bookings', bookings);
    
    const trips = this._storage.get<Trip>('trips');
    const tIdx = trips.findIndex(t => t.id === booking.tripId);
    if (tIdx > -1) {
        trips[tIdx].availableSeats -= 1;
        this._storage.set('trips', trips);
    }

    return newBooking;
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const bookings = this._storage.get<Booking>('bookings');
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return;

    const booking = bookings[idx];
    booking.status = status;
    this._storage.set('bookings', bookings);

    if (status === BookingStatus.CANCELLED || status === BookingStatus.REJECTED) {
      const trips = this._storage.get<Trip>('trips');
      const tIdx = trips.findIndex(t => t.id === booking.tripId);
      if (tIdx > -1) {
          trips[tIdx].availableSeats += 1;
          this._storage.set('trips', trips);
      }
    }
  }

  async updateTripStatus(tripId: string, status: TripStatus): Promise<void> {
    const trips = this._storage.get<Trip>('trips');
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx > -1) {
      trips[idx].status = status;
      this._storage.set('trips', trips);
    }
  }

  async getMyBookings(userId: string): Promise<Booking[]> {
    return this._storage.get<Booking>('bookings').filter(b => b.passengerId === userId);
  }

  async syncUser(user: User): Promise<void> {
    const users = this._storage.get<User>('users');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) users[idx] = user;
    else users.push(user);
    this._storage.set('users', users);
  }
}

export const db = new ProductStore();
