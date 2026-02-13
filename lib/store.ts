
import { supabase } from './supabase';
import { User, Trip, Booking, BookingStatus } from '../types';

class SupabaseStore {
  async selectTrips(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching trips:', error);
      return [];
    }
    return data || [];
  }

  async selectBookings(userId?: string, role?: string): Promise<Booking[]> {
    let query = supabase.from('bookings').select('*');
    
    if (userId && role === 'passenger') {
      query = query.eq('passengerId', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
    return data || [];
  }

  async insertTrip(trip: Trip): Promise<boolean> {
    const { error } = await supabase
      .from('trips')
      .upsert(trip);
    
    if (error) {
      console.error('Error saving trip:', error);
      return false;
    }
    return true;
  }

  async insertBooking(booking: Booking): Promise<boolean> {
    const { error } = await supabase
      .from('bookings')
      .insert(booking);

    if (error) {
      console.error('Error creating booking:', error);
      return false;
    }
    return true;
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating status:', error);
      return false;
    }
    return true;
  }

  async deleteTrip(id: string): Promise<void> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);
    
    if (error) console.error('Error deleting trip:', error);
  }

  async updateUserProfile(user: User): Promise<void> {
    const { error } = await supabase
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
    
    if (error) console.error('Error updating profile:', error);
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('trips').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const db = new SupabaseStore();
