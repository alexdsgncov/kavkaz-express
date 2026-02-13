
import { getSupabase } from './supabase';
import { User, Trip, Booking, BookingStatus } from '../types';

class SupabaseStore {
  private get client() {
    return getSupabase();
  }

  private mapTripFromDb(t: any): Trip {
    return {
      id: t.id,
      driverId: t.driver_id,
      date: t.date,
      price: t.price,
      totalSeats: t.total_seats,
      availableSeats: t.available_seats,
      from: t.from,
      to: t.to,
      departureAddress: t.departure_address,
      arrivalAddress: t.arrival_address,
      departureTime: t.departure_time,
      arrivalTime: t.arrival_time,
      busPlate: t.bus_plate,
      type: t.type
    };
  }

  private mapTripToDb(t: Trip) {
    return {
      id: t.id,
      driver_id: t.driverId,
      date: t.date,
      price: t.price,
      total_seats: t.totalSeats,
      available_seats: t.availableSeats,
      from: t.from,
      to: t.to,
      departure_address: t.departureAddress,
      arrival_address: t.arrivalAddress,
      departure_time: t.departureTime,
      arrival_time: t.arrivalTime,
      bus_plate: t.busPlate,
      type: t.type
    };
  }

  async selectTrips(): Promise<Trip[]> {
    const c = this.client;
    if (!c) return [];
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await c
        .from('trips')
        .select('*')
        .gte('date', today.toISOString().split('T')[0]) // Сравнение только дат
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching trips:', error);
        return [];
      }
      return (data || []).map(this.mapTripFromDb);
    } catch (e) {
      console.error('Error fetching trips exception:', e);
      return [];
    }
  }

  async selectBookings(userId?: string, role?: string): Promise<Booking[]> {
    const c = this.client;
    if (!c) return [];
    try {
      let query = c.from('bookings').select('*');
      
      if (userId && role === 'passenger') {
        query = query.eq('passengerId', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching bookings:', e);
      return [];
    }
  }

  async insertTrip(trip: Trip): Promise<boolean> {
    const c = this.client;
    if (!c) return false;
    try {
      const dbTrip = this.mapTripToDb(trip);
      console.log("Upserting to Supabase:", dbTrip);
      const { error } = await c
        .from('trips')
        .upsert(dbTrip);
      
      if (error) {
        console.error('Supabase error during upsert:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error saving trip exception:', e);
      return false;
    }
  }

  async insertBooking(booking: Booking): Promise<boolean> {
    const c = this.client;
    if (!c) return false;
    try {
      const { error } = await c
        .from('bookings')
        .insert(booking);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error creating booking:', e);
      return false;
    }
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
    const c = this.client;
    if (!c) return false;
    try {
      const { error } = await c
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error updating status:', e);
      return false;
    }
  }

  async deleteTrip(id: string): Promise<void> {
    const c = this.client;
    if (!c) return;
    try {
      const { error } = await c
        .from('trips')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting trip:', e);
    }
  }

  async updateUserProfile(user: User): Promise<void> {
    const c = this.client;
    if (!c) return;
    try {
      const { error } = await c
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          phone_number: user.phoneNumber,
          full_name: user.fullName,
          role: user.role
        });
      
      if (error) throw error;
    } catch (e) {
      console.error('Error updating profile:', e);
      throw e;
    }
  }

  async testConnection(): Promise<boolean> {
    const c = this.client;
    if (!c) return false;
    try {
      const { error } = await c.from('trips').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const db = new SupabaseStore();
