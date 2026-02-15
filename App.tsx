
import React, { useState, useEffect } from 'react';
import { supabase } from "./lib/supabase";
import { User, UserRole, Trip, Booking, TripStatus, BookingStatus } from './types';
import { sendBookingNotification } from './lib/email';
import PassengerHome from './views/passenger/Home';
import PassengerTripList from './views/passenger/TripList';
import DriverDashboard from './views/driver/Dashboard';
import ManageRequests from './views/driver/ManageRequests';
import CreateTrip from './views/driver/CreateTrip';
import Auth from './views/Auth';

const App: React.FC = () => {
  const [sbUser, setSbUser] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [view, setView] = useState<'passenger' | 'driver'>('passenger');
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const mapDbTrip = (t: any): Trip => ({
    id: t.id,
    driverId: t.driver_id,
    date: t.date,
    price: t.price,
    totalSeats: t.total_seats,
    availableSeats: t.available_seats,
    from: t.from,
    to: t.to,
    departureTime: t.departure_time,
    arrivalTime: t.arrival_time,
    busPlate: t.bus_plate,
    busModel: t.bus_model,
    status: t.status as TripStatus,
    occupiedSeats: [],
    departureAddress: t.departure_address || '',
    arrivalAddress: t.arrival_address || '',
    type: t.type || 'Standard'
  });

  const mapDbBooking = (b: any): Booking => ({
    id: b.id,
    tripId: b.trip_id,
    passengerId: b.passenger_id,
    passengerName: b.passenger_name,
    passengerPhone: b.passenger_phone,
    status: b.status as BookingStatus,
    timestamp: b.created_at
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSbUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSbUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setView('passenger'); setActiveScreen('home'); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
        const userProfile: User = {
            id: data.id,
            fullName: data.full_name,
            phoneNumber: data.phone_number,
            email: sbUser?.email || '',
            role: data.role as UserRole
        };
        setProfile(userProfile);
        if (userProfile.role === UserRole.DRIVER) setView('driver');
    }
  };

  useEffect(() => {
    if (!sbUser) return;

    const fetchAllData = async () => {
        const { data: tData } = await supabase.from('trips').select('*').order('date', { ascending: true });
        if (tData) setTrips(tData.map(mapDbTrip));

        const { data: bData } = await supabase.from('bookings').select('*');
        if (bData) setBookings(bData.map(mapDbBooking));
    };

    fetchAllData();

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'trips' }, fetchAllData)
      .on('postgres_changes', { event: '*', table: 'bookings' }, fetchAllData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sbUser]);

  const handleCreateBooking = async (tripId: string, info: any) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip || trip.availableSeats <= 0) return;

    const { data: newBooking, error } = await supabase.from('bookings').insert({
        trip_id: tripId,
        passenger_id: profile?.id,
        passenger_name: info.fullName,
        passenger_phone: info.phoneNumber,
        status: 'pending'
    }).select().single();

    if (!error) {
        // Уменьшаем количество мест
        await supabase.from('trips').update({ available_seats: trip.availableSeats - 1 }).eq('id', tripId);
        
        // Отправляем уведомление на Email
        sendBookingNotification(trip, { 
            id: newBooking?.id,
            passengerName: info.fullName,
            passengerPhone: info.phoneNumber
        });

        setActiveScreen('home');
    } else {
        alert("Ошибка бронирования: " + error.message);
    }
  };

  const handleSaveTrip = async (tripData: any) => {
    const dbData = {
        driver_id: profile?.id,
        date: tripData.date,
        price: tripData.price,
        total_seats: tripData.totalSeats,
        available_seats: tripData.availableSeats,
        from: tripData.from,
        to: tripData.to,
        departure_time: tripData.departureTime,
        arrival_time: tripData.arrivalTime,
        bus_plate: tripData.busPlate,
        bus_model: tripData.busModel,
        status: tripData.status || 'scheduled',
        departure_address: tripData.departureAddress,
        arrival_address: tripData.arrivalAddress,
        type: tripData.type
    };

    let error;
    if (selectedTrip) {
        const { error: err } = await supabase.from('trips').update(dbData).eq('id', selectedTrip.id);
        error = err;
    } else {
        const { error: err } = await supabase.from('trips').insert(dbData);
        error = err;
    }

    if (!error) {
        setActiveScreen('home');
        setSelectedTrip(null);
    } else {
        alert("Ошибка сохранения: " + error.message);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    
    if (!error && (status === BookingStatus.CANCELLED || status === BookingStatus.REJECTED)) {
        const trip = trips.find(t => t.id === booking.tripId);
        if (trip) {
            await supabase.from('trips').update({ available_seats: trip.availableSeats + 1 }).eq('id', trip.id);
        }
    }
  };

  const handleUpdateTripStatus = async (id: string, status: TripStatus) => {
    await supabase.from('trips').update({ status }).eq('id', id);
  };

  if (!sbUser) return <Auth onAuthSuccess={() => {}} />;
  if (!profile) return <div className="flex-1 flex items-center justify-center bg-white"><div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-bg-soft shadow-2xl relative flex flex-col overflow-hidden">
        {view === 'passenger' ? (
            activeScreen === 'home' ? (
                <PassengerHome 
                    user={profile} 
                    onSearch={(d) => { setSelectedDate(d); setActiveScreen('trips'); }}
                    onNavigateBookings={() => setActiveScreen('bookings')}
                    onAdminClick={() => profile.role === UserRole.DRIVER && setView('driver')}
                />
            ) : activeScreen === 'trips' ? (
                <PassengerTripList 
                    trips={trips.filter(t => t.date === selectedDate)}
                    selectedDate={selectedDate}
                    onBack={() => setActiveScreen('home')}
                    onBook={handleCreateBooking}
                    initialUserData={{ fullName: profile.fullName, phoneNumber: profile.phoneNumber }}
                />
            ) : null
        ) : (
            activeScreen === 'home' ? (
                <DriverDashboard 
                    user={profile} 
                    unreadNotifications={0}
                    onOpenNotifications={() => {}}
                    trips={trips.filter(t => t.driverId === profile.id)} 
                    bookings={bookings} 
                    onCreateTrip={() => { setSelectedTrip(null); setActiveScreen('create-trip'); }}
                    onManageTrip={(t) => { setSelectedTrip(t); setActiveScreen('manage'); }}
                    onEditTrip={(t) => { setSelectedTrip(t); setActiveScreen('create-trip'); }} 
                    onDeleteTrip={async (id) => { if(confirm("Удалить?")) await supabase.from('trips').delete().eq('id', id); }}
                    onLogout={async () => { await supabase.auth.signOut(); }}
                />
            ) : activeScreen === 'create-trip' ? (
                <CreateTrip 
                    driverId={profile.id}
                    initialTrip={selectedTrip}
                    onSave={handleSaveTrip}
                    onCancel={() => { setSelectedTrip(null); setActiveScreen('home'); }}
                />
            ) : activeScreen === 'manage' && selectedTrip ? (
                <ManageRequests 
                    trip={selectedTrip}
                    bookings={bookings.filter(b => b.tripId === selectedTrip.id)}
                    allUsers={[]}
                    onUpdateStatus={handleUpdateBookingStatus}
                    onUpdateTripStatus={handleUpdateTripStatus}
                    onBack={() => setActiveScreen('home')}
                  />
            ) : null
        )}
    </div>
  );
};

export default App;
