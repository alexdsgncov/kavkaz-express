
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Trip, Booking, BookingStatus } from './types';
import { db } from './lib/store';
import { sendBookingNotification } from './lib/email';
import { sendTelegramNotification } from './lib/telegram';
import PassengerHome from './views/passenger/Home';
import PassengerTripList from './views/passenger/TripList';
import MyBookings from './views/passenger/MyBookings';
import DriverDashboard from './views/driver/Dashboard';
import CreateTrip from './views/driver/CreateTrip';
import ManageRequests from './views/driver/ManageRequests';

const SESSION_KEY = 'kavkaz_express_session_v3';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'passenger' | 'driver'>('passenger');
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
      setTrips(tripsData || []);
      setBookings(bookingsData || []);
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
        try {
            const userData = JSON.parse(existing);
            setUser(userData);
            if (userData.role === UserRole.DRIVER) {
              setView('driver');
            }
        } catch (e) {
            console.error("Session parse error", e);
        }
      }
    };
    init();
  }, [updateData]);

  const handleBook = async (tripId: string, passengerInfo: { fullName: string, phoneNumber: string }) => {
    setIsLoading(true);
    try {
      const trip = trips.find(t => t.id === tripId);
      
      const userData: User = {
        id: user?.id || 'u_' + Math.random().toString(36).substr(2, 9),
        fullName: passengerInfo.fullName,
        phoneNumber: passengerInfo.phoneNumber,
        email: user?.email || '',
        role: UserRole.PASSENGER
      };
      
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));

      const newBooking: Booking = {
        id: 'b_' + Math.random().toString(36).substr(2, 9),
        tripId: tripId,
        passengerId: userData.id,
        passengerName: userData.fullName,
        passengerPhone: userData.phoneNumber,
        status: BookingStatus.PENDING,
        timestamp: new Date().toISOString()
      };

      const dbOk = await db.insertBooking(newBooking);
      
      if (dbOk) {
        // Формируем сообщение для Telegram
        if (trip) {
          const message = `
<b>🆕 Новая заявка на рейс!</b>

👤 <b>Пассажир:</b> ${newBooking.passengerName}
📞 <b>Телефон:</b> <code>${newBooking.passengerPhone}</code>

📍 <b>Маршрут:</b> ${trip.from} — ${trip.to}
📅 <b>Дата:</b> ${new Date(trip.date).toLocaleDateString('ru-RU')}
🕒 <b>Время:</b> ${trip.departureTime}
🚌 <b>Автобус:</b> ${trip.busPlate.toUpperCase()}

<i>Подтвердите заявку в приложении.</i>
          `.trim();
          
          await sendTelegramNotification(message);
        }

        await sendBookingNotification(newBooking);
        alert("Заявка успешно отправлена! Водитель получит уведомление и перезвонит вам.");
        await updateData();
        setSubView('my-bookings');
      } else {
        alert("Ошибка при сохранении заявки. Попробуйте снова.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Произошла ошибка при бронировании.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToDriver = async () => {
    const pin = prompt("Введите код доступа водителя:");
    if (pin === "0606") {
      setIsLoading(true);
      const driverData: User = {
        id: 'd_admin',
        fullName: 'Администратор Кавказ-Экспресс',
        phoneNumber: '+7 999 000 00 00',
        email: 'admin@kavkaz.express',
        role: UserRole.DRIVER
      };
      
      try {
        await db.updateUserProfile(driverData);
        setUser(driverData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(driverData));
        setView('driver');
        setSubView('home');
      } catch (err) {
        console.error("Failed to sync driver profile:", err);
        alert("Ошибка авторизации водителя в базе данных.");
      } finally {
        setIsLoading(false);
      }
    } else if (pin !== null) {
      alert("Неверный код доступа.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setView('passenger');
    setSubView('home');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-primary/10 overflow-hidden">
          <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-1/3"></div>
        </div>
      )}

      {view === 'passenger' && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {subView === 'home' && (
            <PassengerHome 
              user={user || { id: '', fullName: 'Гость', phoneNumber: '', email: '', role: UserRole.PASSENGER }} 
              unreadNotifications={0} 
              onOpenNotifications={() => {}} 
              onSearch={(d) => { setSelectedDate(d); setSubView('trip-list'); }} 
              onNavigateBookings={() => setSubView('my-bookings')} 
              onAdminClick={handleSwitchToDriver}
            />
          )}
          {subView === 'trip-list' && (
            <PassengerTripList 
              trips={trips.filter(t => t.date.startsWith(selectedDate))} 
              onBook={handleBook} 
              onBack={() => setSubView('home')} 
              selectedDate={selectedDate}
              initialUserData={user ? { fullName: user.fullName, phoneNumber: user.phoneNumber } : undefined}
            />
          )}
          {subView === 'my-bookings' && (
            <MyBookings 
              bookings={bookings.filter(b => b.passengerId === user?.id)} 
              trips={trips} 
              onBack={() => setSubView('home')} 
              onCancelBooking={async (id) => {
                  if(confirm("Отменить бронирование?")) {
                      await db.updateBookingStatus(id, BookingStatus.REJECTED);
                      updateData();
                  }
              }} 
            />
          )}
        </div>
      )}

      {view === 'driver' && user && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
              onDeleteTrip={async (id) => { if(confirm("Удалить рейс?")) { await db.deleteTrip(id); updateData(); } }} 
              onLogout={handleLogout}
            />
          )}
          {subView === 'create-trip' && (
            <CreateTrip 
              driverId={user.id} 
              initialTrip={editingTrip} 
              onSave={async (t) => { 
                setIsLoading(true);
                try {
                  const ok = await db.insertTrip(t);
                  if (ok) {
                    await updateData(); 
                    setSubView('home'); 
                  } else {
                    alert("Ошибка при сохранении рейса.");
                  }
                } catch (err) {
                  console.error("Insert trip exception:", err);
                  alert("Критическая ошибка при сохранении рейса.");
                } finally {
                  setIsLoading(false);
                }
              }} 
              onCancel={() => setSubView('home')} 
            />
          )}
          {subView === 'manage-requests' && selectedTripForRequests && (
            <ManageRequests 
              trip={selectedTripForRequests} 
              bookings={bookings.filter(b => b.tripId === selectedTripForRequests.id)} 
              allUsers={[]} 
              onUpdateStatus={async (id, status) => {
                await db.updateBookingStatus(id, status);
                updateData();
              }} 
              onBack={() => setSubView('home')} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
