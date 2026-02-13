
import { User, Trip, Booking, UserRole } from '../types';

interface AppData {
  users: User[];
  trips: Trip[];
  bookings: Booking[];
}

const LOCAL_KEY = 'kavkaz_v5_local_db';

const INITIAL_TRIPS: Trip[] = [
  {
    id: 't_1',
    driverId: 'd_demo',
    date: new Date().toISOString(),
    price: 4500,
    totalSeats: 18,
    availableSeats: 4,
    from: 'Назрань',
    to: 'Москва',
    departureAddress: 'Автовокзал',
    arrivalAddress: 'ТЦ "Ханой-Москва"',
    departureTime: '09:00',
    arrivalTime: '06:00',
    busPlate: 'в777ее06',
    type: 'Sprinter'
  }
];

class Store {
  private data: AppData = {
    users: [],
    trips: INITIAL_TRIPS,
    bookings: []
  };

  constructor() {
    this.load();
    // Fix: Cast window to any to access the Telegram WebApp API.
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.ready();
    }
  }

  private load() {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.data = {
          users: parsed.users || [],
          trips: parsed.trips || INITIAL_TRIPS,
          bookings: parsed.bookings || []
        };
      } catch (e) {
        this.data.trips = INITIAL_TRIPS;
      }
    }
  }

  private save() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(this.data));
  }

  getData() { return this.data; }

  updateUser(user: User) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx > -1) this.data.users[idx] = user;
    else this.data.users.push(user);
    this.save();
  }

  addTrip(trip: Trip) {
    this.data.trips = [trip, ...this.data.trips.filter(t => t.id !== trip.id)];
    this.save();
  }

  deleteTrip(id: string) {
    this.data.trips = this.data.trips.filter(t => t.id !== id);
    this.save();
  }

  addBooking(booking: Booking) {
    this.data.bookings = [booking, ...this.data.bookings];
    this.save();
  }
}

export const db = new Store();
