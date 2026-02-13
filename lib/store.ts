
import { getSupabase } from './supabase';
import { User, Trip, Booking, BookingStatus } from '../types';

class SupabaseStore {
  private get client() {
    const s = getSupabase();
    if (!s) throw new Error("Supabase is not initialized. Please configure credentials.");
    return s;
  }

  async selectTrips(): Promise<Trip[]> {
    try {
      const { data, error } = await this.client
        .from('trips')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching trips:', e);
      return [];
    }
  }

  async selectBookings(userId?: string, role?: string): Promise<Booking[]> {
    try {
      let query = this.client.from('bookings').select('*');
      
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
    try {
      const { error } = await this.client
        .from('trips')
        .upsert(trip);
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error saving trip:', e);
      return false;
    }
  }

  async insertBooking(booking: Booking): Promise<boolean> {
    try {
      const { error } = await this.client
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
    try {
      const { error } = await this.client
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
    try {
      const { error } = await this.client
        .from('trips')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting trip:', e);
    }
  }

  async updateUserProfile(user: User): Promise<void> {
    try {
      const { error } = await this.client
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          phone_number: user.phoneNumber,
          full_name: user.fullName,
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          middle_name: user.middleName
        });
      
      if (error) throw error;
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.from('trips').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const db = new SupabaseStore();
