
import React, { useState, useEffect } from 'react';
import { User, UserRole, Trip, Booking, BookingStatus, Notification, NotificationType } from './types';
import { supabase } from './lib/supabase';
import Login from './views/Login';
import RoleSelection from './views/RoleSelection';
import ProfileSetup from './views/ProfileSetup';
import PassengerHome from './views/passenger/Home';
import PassengerTripList from './views/passenger/TripList';
import MyBookings from './views/passenger/MyBookings';
import DriverDashboard from './views/driver/Dashboard';
import CreateTrip from './views/driver/CreateTrip';
import ManageRequests from './views/driver/ManageRequests';
import NotificationsView from './views/Notifications';

const SESSION_KEY = 'kavkaz_express_session_v4';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [view, setView] = useState<string>('login'); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengerSubView, setPassengerSubView] = useState<string>('home');
  const [driverSubView, setDriverSubView] = useState<string>('dashboard');
  const [globalSubView, setGlobalSubView] = useState<string | null>(null); 
  const [selectedTripForManage, setSelectedTripForManage] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // --- Мапперы данных ---
  const mapUser = (u: any): User => ({
    id: u.id, email: u.email, phoneNumber: u.phone_number, role: u.role, fullName: u.full_name,
    password: u.password, firstName: u.first_name, lastName: u.last_name, middleName: u.middle_name,
    avatarUrl: u.avatar_url, carInfo: u.car_info
  });

  const mapTrip = (t: any): Trip => ({
    id: t.id, driverId: t.driver_id, date: t.date, price: t.price, totalSeats: t.total_seats,
    availableSeats: t.available_seats, from: t.from, to: t.to, departureAddress: t.departure_address,
    arrivalAddress: t.arrival_address, departureTime: t.departure_time, arrivalTime: t.arrival_time,
    busPlate: t.bus_plate, type: t.type
  });

  // --- Загрузка данных из БД ---
  const fetchData = async () => {
    try {
      const { data: u, error: ue } = await supabase.from('users').select('*');
      if (ue) throw ue;
      const { data: t, error: te } = await supabase.from('trips').select('*').order('date', { ascending: true });
      const { data: b, error: be } = await supabase.from('bookings').select('*').order('timestamp', { ascending: false });
      const { data: n, error: ne } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });

      setAllUsers((u || []).map(mapUser));
      setTrips((t || []).map(mapTrip));
      setBookings((b || []).map(item => ({
        id: item.id, tripId: item.trip_id, passengerId: item.passenger_id, 
        passengerName: item.passenger_name, status: item.status as BookingStatus, timestamp: item.timestamp
      })));
      setNotifications((n || []).map(item => ({
        id: item.id, userId: item.user_id, title: item.title, message: item.message,
        type: item.type as NotificationType, timestamp: item.timestamp, isRead: item.is_read, relatedId: item.related_id
      })));
      setErrorStatus(null);
    } catch (error: any) {
      console.error("Database Error:", error);
      setErrorStatus(error.message || "Ошибка подключения к БД. Проверьте таблицы.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchData();
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const activeUser = JSON.parse(sessionData);
        // Проверяем актуальность пользователя в БД
        const { data: dbUser } = await supabase.from('users').select('*').eq('id', activeUser.id).maybeSingle();
        if (dbUser) {
          const mapped = mapUser(dbUser);
          setUser(mapped);
          if (mapped.role === UserRole.UNSET) setView('role-selection');
          else if (!mapped.firstName) setView('profile-setup');
          else setView('main');
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // --- ЛОГИКА АВТОРИЗАЦИИ ---
  const handleLogin = async (email: string, phone: string, password?: string) => {
    setIsLoading(true);
    try {
      const trimmedEmail = email.toLowerCase().trim();
      const { data: existing } = await supabase.from('users').select('*').eq('email', trimmedEmail).maybeSingle();
      
      let finalUser: User;
      if (existing) {
        const { data: updated, error } = await supabase.from('users').update({ 
          phone_number: phone, 
          password: password || existing.password 
        }).eq('id', existing.id).select().single();
        if (error) throw error;
        finalUser = mapUser(updated);
      } else {
        const { data: newUser, error } = await supabase.from('users').insert([{ 
          email: trimmedEmail, 
          phone_number: phone, 
          role: UserRole.UNSET, 
          password 
        }]).select().single();
        if (error) throw error;
        finalUser = mapUser(newUser);
      }

      setUser(finalUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
      setView(finalUser.role === UserRole.UNSET ? 'role-selection' : (!finalUser.firstName ? 'profile-setup' : 'main'));
      await fetchData();
    } catch (e: any) {
      alert("Ошибка входа: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ЛОГИКА ПРОФИЛЯ ---
  const handleRoleSelect = async (role: UserRole) => {
    if (!user) return;
    const { data, error } = await supabase.from('users').update({ role }).eq('id', user.id).select().single();
    if (error) return alert(error.message);
    const updated = mapUser(data);
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setView('profile-setup');
  };

  const handleProfileSave = async (firstName: string, lastName: string, middleName: string) => {
    if (!user) return;
    const fullName = `${lastName} ${firstName} ${middleName}`.trim();
    const { data, error } = await supabase.from('users').update({ 
      first_name: firstName, last_name: lastName, middle_name: middleName, full_name: fullName 
    }).eq('id', user.id).select().single();
    if (error) return alert(error.message);
    const updated = mapUser(data);
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setView('main');
    await fetchData();
  };

  // --- ЛОГИКА ПАССАЖИРА ---
  const handleRequestBooking = async (tripId: string) => {
    if (!user) return;
    const trip = trips.find(t => t.id === tripId);
    if (!trip || trip.availableSeats <= 0) return alert("Мест нет");

    // Создаем бронь
    const { data: newBooking, error: bError } = await supabase.from('bookings').insert([{
      trip_id: tripId,
      passenger_id: user.id,
      passenger_name: user.fullName || user.email,
      status: BookingStatus.PENDING
    }]).select().single();

    if (bError) return alert(bError.message);

    // Уведомляем водителя
    await supabase.from('notifications').insert([{
      user_id: trip.driverId,
      title: 'Новая заявка 🚌',
      message: `${user.firstName} хочет забронировать место на рейс ${trip.departureTime}.`,
      type: NotificationType.BOOKING_REQUEST,
      related_id: newBooking.id
    }]);

    await fetchData();
    setPassengerSubView('bookings');
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) return alert(error.message);

    // Если бронь была одобрена, возвращаем место
    if (booking.status === BookingStatus.APPROVED) {
      const trip = trips.find(t => t.id === booking.tripId);
      if (trip) {
        await supabase.from('trips').update({ available_seats: trip.availableSeats + 1 }).eq('id', trip.id);
      }
    }

    await fetchData();
  };

  // --- ЛОГИКА ВОДИТЕЛЯ ---
  const handleSaveTrip = async (tripData: Trip) => {
    const dbData = {
      driver_id: tripData.driverId,
      date: tripData.date,
      price: tripData.price,
      total_seats: tripData.totalSeats,
      available_seats: tripData.availableSeats,
      from: tripData.from,
      to: tripData.to,
      departure_address: tripData.departureAddress,
      arrival_address: tripData.arrivalAddress,
      departure_time: tripData.departureTime,
      arrival_time: tripData.arrivalTime,
      bus_plate: tripData.busPlate,
      type: tripData.type
    };

    let error;
    if (tripData.id.startsWith('trip_')) {
      const { error: resError } = await supabase.from('trips').insert([dbData]);
      error = resError;
    } else {
      const { error: resError } = await supabase.from('trips').update(dbData).eq('id', tripData.id);
      error = resError;
    }

    if (error) return alert(error.message);
    setDriverSubView('dashboard');
    await fetchData();
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const booking = bookings.find(b => b.id === bookingId);
    const trip = trips.find(t => t.id === booking?.tripId);
    if (!booking || !trip) return;

    if (status === BookingStatus.APPROVED && trip.availableSeats <= 0) {
      return alert("Нет свободных мест!");
    }

    // Обновляем статус
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) return alert(error.message);

    // Если одобрено — списываем место
    if (status === BookingStatus.APPROVED) {
      await supabase.from('trips').update({ available_seats: trip.availableSeats - 1 }).eq('id', trip.id);
    }

    // Уведомляем пассажира
    await supabase.from('notifications').insert([{
      user_id: booking.passengerId,
      title: status === BookingStatus.APPROVED ? 'Поездка подтверждена! ✅' : 'Заявка отклонена ❌',
      message: status === BookingStatus.APPROVED 
        ? `Водитель подтвердил ваше место на ${trip.departureTime}. Ждем вас!`
        : `К сожалению, водитель не смог подтвердить вашу заявку.`,
      type: status === BookingStatus.APPROVED ? NotificationType.BOOKING_APPROVED : NotificationType.BOOKING_REJECTED,
      related_id: booking.id
    }]);

    await fetchData();
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm('Удалить рейс? Все бронирования также будут удалены.')) return;
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) alert(error.message);
    await fetchData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    setView('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light gap-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kavkaz Express</p>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-10 text-center gap-6">
        <span className="material-symbols-outlined text-6xl text-danger">database_off</span>
        <h2 className="text-xl font-bold">Ошибка базы данных</h2>
        <p className="text-sm text-slate-500">{errorStatus}</p>
        <div className="bg-white p-4 rounded-xl text-left text-[10px] font-mono border border-slate-200">
          Убедитесь, что вы создали таблицы в SQL Editor (Supabase).
        </div>
        <button onClick={() => window.location.reload()} className="w-full py-3 bg-primary text-white rounded-xl font-bold">Обновить страницу</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {view === 'login' && <Login onLogin={handleLogin} allUsers={allUsers} />}
      {view === 'role-selection' && <RoleSelection onSelectRole={handleRoleSelect} />}
      {view === 'profile-setup' && <ProfileSetup onSave={handleProfileSave} />}
      
      {view === 'main' && user && (
        <>
          {globalSubView === 'notifications' ? (
            <NotificationsView 
              notifications={notifications.filter(n => n.userId === user.id)} 
              onBack={() => setGlobalSubView(null)} 
              onMarkAsRead={async (id) => {
                await supabase.from('notifications').update({is_read: true}).eq('id', id);
                fetchData();
              }} 
              onClearAll={async () => {
                await supabase.from('notifications').delete().eq('user_id', user.id);
                fetchData();
              }} 
            />
          ) : user.role === UserRole.PASSENGER ? (
            <div className="flex-1 flex flex-col pb-20 overflow-hidden">
              {passengerSubView === 'home' && (
                <PassengerHome 
                  user={user} 
                  unreadNotifications={notifications.filter(n => n.userId === user.id && !n.isRead).length} 
                  onOpenNotifications={() => setGlobalSubView('notifications')} 
                  onSearch={(date) => { setSelectedDate(date); setPassengerSubView('trip-list'); }} 
                  onNavigateBookings={() => setPassengerSubView('bookings')} 
                />
              )}
              {passengerSubView === 'trip-list' && (
                <PassengerTripList trips={trips.filter(t => t.date.split('T')[0] === selectedDate)} allUsers={allUsers} onBook={handleRequestBooking} onBack={() => setPassengerSubView('home')} selectedDate={selectedDate} />
              )}
              {passengerSubView === 'bookings' && (
                <MyBookings bookings={bookings.filter(b => b.passengerId === user.id)} trips={trips} onBack={() => setPassengerSubView('home')} onCancelBooking={handleCancelBooking} />
              )}
              <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 flex justify-around p-3 z-50">
                <button onClick={() => setPassengerSubView('home')} className={`flex flex-col items-center gap-1 ${passengerSubView !== 'bookings' ? 'text-primary' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-bold">explore</span>
                  <span className="text-[10px] font-bold">Поиск</span>
                </button>
                <button onClick={() => setPassengerSubView('bookings')} className={`flex flex-col items-center gap-1 ${passengerSubView === 'bookings' ? 'text-primary' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-bold">confirmation_number</span>
                  <span className="text-[10px] font-bold">Билеты</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-300">
                  <span className="material-symbols-outlined font-bold">logout</span>
                  <span className="text-[10px] font-bold">Выход</span>
                </button>
              </nav>
            </div>
          ) : (
            <div className="flex-1 flex flex-col pb-20 overflow-hidden">
              {driverSubView === 'dashboard' && (
                <DriverDashboard 
                  user={user} 
                  unreadNotifications={notifications.filter(n => n.userId === user.id && !n.isRead).length} 
                  onOpenNotifications={() => setGlobalSubView('notifications')} 
                  trips={trips.filter(t => t.driverId === user.id)} 
                  bookings={bookings} 
                  onCreateTrip={() => { setEditingTrip(null); setDriverSubView('create-trip'); }} 
                  onManageTrip={(trip) => { setSelectedTripForManage(trip); setDriverSubView('manage-requests'); }} 
                  onEditTrip={(trip) => { setEditingTrip(trip); setDriverSubView('create-trip'); }} 
                  onDeleteTrip={handleDeleteTrip} 
                />
              )}
              {driverSubView === 'create-trip' && (
                <CreateTrip driverId={user.id} initialTrip={editingTrip} onSave={handleSaveTrip} onCancel={() => setDriverSubView('dashboard')} />
              )}
              {driverSubView === 'manage-requests' && selectedTripForManage && (
                <ManageRequests 
                  trip={selectedTripForManage} 
                  bookings={bookings.filter(b => b.tripId === selectedTripForManage.id)} 
                  allUsers={allUsers} 
                  onUpdateStatus={handleUpdateBookingStatus} 
                  onBack={() => setDriverSubView('dashboard')} 
                />
              )}
              <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 flex justify-around p-3 z-50">
                <button onClick={() => setDriverSubView('dashboard')} className={`flex flex-col items-center gap-1 ${driverSubView === 'dashboard' ? 'text-primary' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-bold">dashboard</span>
                  <span className="text-[10px] font-bold">Рейсы</span>
                </button>
                <button onClick={() => { setEditingTrip(null); setDriverSubView('create-trip'); }} className={`flex flex-col items-center gap-1 ${driverSubView === 'create-trip' ? 'text-primary' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-bold">add_box</span>
                  <span className="text-[10px] font-bold">Новый</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-300">
                  <span className="material-symbols-outlined font-bold">logout</span>
                  <span className="text-[10px] font-bold">Выход</span>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
