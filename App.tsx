
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Trip, Booking, BookingStatus } from './types';
import { db } from './lib/store';
import Login from './views/Login';
import RoleSelection from './views/RoleSelection';
import ProfileSetup from './views/ProfileSetup';
import PassengerHome from './views/passenger/Home';
import PassengerTripList from './views/passenger/TripList';
import MyBookings from './views/passenger/MyBookings';
import DriverDashboard from './views/driver/Dashboard';
import CreateTrip from './views/driver/CreateTrip';
import ManageRequests from './views/driver/ManageRequests';

const SESSION_KEY = 'kavkaz_session_v1';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('loading');
  const [subView, setSubView] = useState<string>('home');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedTripForRequests, setSelectedTripForRequests] = useState<Trip | null>(null);

  const updateData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tripsData, bookingsData] = await Promise.all([
        db.selectTrips(),
        db.selectBookings()
      ]);
      setTrips(tripsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await updateData();
      const existing = localStorage.getItem(SESSION_KEY);
      if (existing) {
        setUser(JSON.parse(existing));
        setView('main');
      } else {
        setView('login');
      }
    };
    init();
  }, [updateData]);

  const handleBook = async (tripId: string) => {
    if (!user) return;
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const newBooking: Booking = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      tripId: trip.id,
      passengerId: user.id,
      passengerName: user.fullName || user.email,
      passengerPhone: user.phoneNumber,
      status: BookingStatus.PENDING,
      timestamp: new Date().toISOString()
    };

    setIsLoading(true);
    const ok = await db.insertBooking(newBooking);
    setIsLoading(false);

    if (ok) {
      alert("Бронирование успешно отправлено водителю!");
      updateData();
      setSubView('my-bookings');
    } else {
      alert("Ошибка при бронировании.");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setIsLoading(true);
    const ok = await db.updateBookingStatus(bookingId, status);
    if (ok) {
      await updateData();
    } else {
      alert("Не удалось обновить статус");
    }
    setIsLoading(false);
  };

  if (view === 'loading') return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center">
      <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-primary/10 overflow-hidden">
          <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-1/3"></div>
        </div>
      )}
      
      {view === 'login' && <Login onLogin={(e, p) => {
        const u = { id: 'u_'+Date.now(), email: e, phoneNumber: p, role: UserRole.UNSET, fullName: '' };
        setUser(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setView('role-selection');
      }} allUsers={[]} />}

      {view === 'role-selection' && <RoleSelection onSelectRole={(r) => {
        setUser(prev => prev ? {...prev, role: r} : null);
        setView('profile-setup');
      }} />}

      {view === 'profile-setup' && <ProfileSetup onSave={async (f, l, m) => {
        if (!user) return;
        const updated = { ...user, firstName: f, lastName: l, middleName: m, fullName: `${l} ${f}` };
        setUser(updated);
        await db.updateUserProfile(updated);
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setView('main');
      }} />}

      {view === 'main' && user && (
        <div className="flex-1 flex flex-col">
          {user.role === UserRole.PASSENGER ? (
            <>
              {subView === 'home' && (
                <PassengerHome 
                  user={user} 
                  unreadNotifications={0} 
                  onOpenNotifications={() => {}} 
                  onSearch={(d) => { setSelectedDate(d); setSubView('trip-list'); }} 
                  onNavigateBookings={() => setSubView('my-bookings')} 
                />
              )}
              {subView === 'trip-list' && (
                <PassengerTripList trips={trips.filter(t => t.date.startsWith(selectedDate))} allUsers={[]} onBook={handleBook} onBack={() => setSubView('home')} selectedDate={selectedDate} />
              )}
              {subView === 'my-bookings' && (
                <MyBookings bookings={bookings.filter(b => b.passengerId === user.id)} trips={trips} onBack={() => setSubView('home')} onCancelBooking={() => {}} />
              )}
            </>
          ) : (
            <>
              {subView === 'home' && (
                <DriverDashboard 
                  user={user} 
                  unreadNotifications={0} 
                  onOpenNotifications={() => {}} 
                  trips={trips} 
                  bookings={bookings} 
                  onCreateTrip={() => { setEditingTrip(null); setSubView('create-trip'); }} 
                  onManageTrip={(trip) => { setSelectedTripForRequests(trip); setSubView('manage-requests'); }} 
                  onEditTrip={(t) => { setEditingTrip(t); setSubView('create-trip'); }} 
                  onDeleteTrip={async (id) => { await db.deleteTrip(id); updateData(); }} 
                />
              )}
              {subView === 'create-trip' && (
                <CreateTrip driverId={user.id} initialTrip={editingTrip} onSave={async (t) => { 
                  const ok = await db.insertTrip(t);
                  if (ok) {
                    await updateData(); 
                    setSubView('home'); 
                  }
                }} onCancel={() => setSubView('home')} />
              )}
              {subView === 'manage-requests' && selectedTripForRequests && (
                <ManageRequests 
                  trip={selectedTripForRequests} 
                  bookings={bookings.filter(b => b.tripId === selectedTripForRequests.id)} 
                  allUsers={[]} 
                  onUpdateStatus={handleUpdateBookingStatus} 
                  onBack={() => setSubView('home')} 
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
