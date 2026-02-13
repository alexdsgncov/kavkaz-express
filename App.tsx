
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Trip, Booking, BookingStatus } from './types';
import { db } from './lib/store';
import { sendTelegramNotification } from './lib/telegram';
import PassengerHome from './views/passenger/Home';
import PassengerTripList from './views/passenger/TripList';
import MyBookings from './views/passenger/MyBookings';
import TicketView from './views/passenger/TicketView';
import DriverDashboard from './views/driver/Dashboard';
import CreateTrip from './views/driver/CreateTrip';
import ManageRequests from './views/driver/ManageRequests';

const SESSION_KEY = 'kx_prod_session_v2';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'passenger' | 'driver'>('passenger');
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allTrips = await db.getTrips();
      setTrips(allTrips);
      if (user) {
        const myBookings = await db.getMyBookings(user.id);
        setBookings(myBookings);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) setUser(JSON.parse(session));
    loadData();
  }, [loadData]);

  const handleBook = async (tripId: string, info: { fullName: string, phoneNumber: string }) => {
    setIsLoading(true);
    try {
        const newUser: User = user || {
            id: 'u_' + Math.random().toString(36).substr(2, 9),
            fullName: info.fullName,
            phoneNumber: info.phoneNumber,
            email: '',
            role: UserRole.PASSENGER
        };
        
        if (!user) {
            setUser(newUser);
            localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
            await db.syncUser(newUser);
        }

        const booking = await db.createBooking({
            tripId,
            passengerId: newUser.id,
            passengerName: newUser.fullName,
            passengerPhone: newUser.phoneNumber
        });

        const trip = trips.find(t => t.id === tripId);
        if (trip) {
            await sendTelegramNotification(`
🆕 <b>БРОНЬ!</b>
👤 ${booking.passengerName}
📞 <code>${booking.passengerPhone}</code>
📍 ${trip.from} → ${trip.to}
📅 ${new Date(trip.date).toLocaleDateString('ru')}
            `);
        }

        await loadData();
        setSelectedBooking(booking);
        setSelectedTrip(trip || null);
        setActiveScreen('ticket');
    } catch (e) { 
        console.error(e);
        alert("Ошибка бронирования."); 
    }
    finally { setIsLoading(false); }
  };

  const handleAdminAuth = () => {
    const pin = prompt("Введите PIN-код доступа:");
    if (pin === "0606") {
        const driver: User = {
            id: 'd_admin',
            fullName: 'Адам Темирканов',
            phoneNumber: '+7 928 000 00 06',
            email: 'driver@kavkaz-express.ru',
            role: UserRole.DRIVER
        };
        setUser(driver);
        localStorage.setItem(SESSION_KEY, JSON.stringify(driver));
        setView('driver');
        setActiveScreen('home');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-bg-soft shadow-2xl relative flex flex-col overflow-hidden">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary animate-[shimmer_1.5s_infinite] w-1/4 rounded-full shadow-[0_0_10px_rgba(19,127,236,0.5)]"></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
          {view === 'passenger' ? (
            <>
                {activeScreen === 'home' && (
                    <PassengerHome 
                        user={user || { id: '', fullName: '', phoneNumber: '', email: '', role: UserRole.PASSENGER }} 
                        onSearch={(d) => { setSelectedDate(d); setActiveScreen('trips'); }}
                        onNavigateBookings={() => setActiveScreen('bookings')}
                        onAdminClick={handleAdminAuth}
                    />
                )}
                {activeScreen === 'trips' && (
                    <PassengerTripList 
                        trips={trips.filter(t => t.date.startsWith(selectedDate))}
                        selectedDate={selectedDate}
                        onBack={() => setActiveScreen('home')}
                        onBook={handleBook}
                        initialUserData={user || undefined}
                    />
                )}
                {activeScreen === 'bookings' && (
                    <MyBookings 
                        bookings={bookings}
                        trips={trips}
                        onBack={() => setActiveScreen('home')}
                        onCancelBooking={async (id) => { if(confirm("Отменить?")) { await db.updateBookingStatus(id, BookingStatus.CANCELLED); loadData(); } }}
                    />
                )}
                {activeScreen === 'ticket' && selectedBooking && selectedTrip && (
                    <TicketView 
                        booking={selectedBooking} 
                        trip={selectedTrip} 
                        onBack={() => setActiveScreen('home')} 
                    />
                )}
            </>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              {activeScreen === 'home' && (
                <DriverDashboard 
                    user={user!} 
                    unreadNotifications={0}
                    onOpenNotifications={() => {}}
                    trips={trips} 
                    bookings={bookings} 
                    onCreateTrip={() => setActiveScreen('create-trip')}
                    onManageTrip={(t) => { setSelectedTrip(t); setActiveScreen('manage'); }}
                    onEditTrip={() => {}}
                    onDeleteTrip={async (id) => { await db.deleteTrip(id); loadData(); }}
                    onLogout={() => { localStorage.removeItem(SESSION_KEY); setView('passenger'); setUser(null); }}
                />
              )}
              {activeScreen === 'create-trip' && (
                  <CreateTrip 
                    driverId={user!.id}
                    onSave={async (t) => { await db.createTrip(t); loadData(); setActiveScreen('home'); }}
                    onCancel={() => setActiveScreen('home')}
                  />
              )}
              {activeScreen === 'manage' && selectedTrip && (
                  <ManageRequests 
                    trip={selectedTrip}
                    bookings={bookings.filter(b => b.tripId === selectedTrip.id)}
                    allUsers={[]}
                    onUpdateStatus={async (id, s) => { await db.updateBookingStatus(id, s); loadData(); }}
                    onBack={() => setActiveScreen('home')}
                  />
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default App;
