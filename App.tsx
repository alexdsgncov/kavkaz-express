
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

const SESSION_KEY = 'kavkaz_express_session';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [view, setView] = useState<string>('login'); 
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengerSubView, setPassengerSubView] = useState<string>('home');
  const [driverSubView, setDriverSubView] = useState<string>('dashboard');
  const [globalSubView, setGlobalSubView] = useState<string | null>(null); 
  const [selectedTripForManage, setSelectedTripForManage] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const mapUser = (u: any): User => ({
    id: u.id,
    email: u.email,
    phoneNumber: u.phone_number,
    role: u.role,
    fullName: u.full_name,
    password: u.password,
    firstName: u.first_name,
    lastName: u.last_name,
    middleName: u.middle_name,
    avatarUrl: u.avatar_url,
    carInfo: u.car_info
  });

  const mapTrip = (t: any): Trip => ({
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
  });

  const mapBooking = (b: any): Booking => ({
    id: b.id,
    tripId: b.trip_id,
    passengerId: b.passenger_id,
    passengerName: b.passenger_name,
    status: b.status,
    timestamp: b.timestamp
  });

  const mapNotification = (n: any): Notification => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type,
    timestamp: n.timestamp,
    isRead: n.is_read,
    relatedId: n.related_id
  });

  const fetchData = async () => {
    try {
      const [{ data: u, error: ue }, { data: t, error: te }, { data: b, error: be }, { data: n, error: ne }] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('trips').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('notifications').select('*').order('timestamp', { ascending: false })
      ]);
      
      if (ue) console.error("Users fetch error:", ue);
      if (te) console.error("Trips fetch error:", te);
      if (be) console.error("Bookings fetch error:", be);
      if (ne) console.error("Notifications fetch error:", ne);

      setAllUsers((u || []).map(mapUser));
      setTrips((t || []).map(mapTrip));
      setBookings((b || []).map(mapBooking));
      setNotifications((n || []).map(mapNotification));
    } catch (error: any) {
      console.error("Critical Fetch Error:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchData();
      
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        try {
          const activeUser = JSON.parse(sessionData);
          const { data: dbUser, error: findError } = await supabase.from('users').select('*').eq('id', activeUser.id).single();
          
          if (dbUser && !findError) {
            const mapped = mapUser(dbUser);
            setUser(mapped);
            if (mapped.role === UserRole.UNSET) setView('role-selection');
            else if (!mapped.firstName) setView('profile-setup');
            else setView('main');
          } else {
            console.warn("Session user not found in DB or error:", findError);
            setView('login');
          }
        } catch(e) {
          setView('login');
        }
      }
      setIsLoading(false);
    };

    init();

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogin = async (email: string, phone: string, password?: string) => {
    try {
      const trimmedEmail = email.toLowerCase();
      const { data: existingUsers, error: findError } = await supabase.from('users').select('*').eq('email', trimmedEmail);
      
      if (findError) throw findError;
      
      const existingUser = existingUsers?.[0];
      let finalUser: User;

      if (existingUser) {
        const updateData = { phone_number: phone, password: password || existingUser.password };
        const { error: updateError } = await supabase.from('users').update(updateData).eq('id', existingUser.id);
        if (updateError) throw updateError;
        finalUser = mapUser({ ...existingUser, ...updateData });
      } else {
        const id = 'user_' + Math.random().toString(36).substr(2, 9);
        const newUserRaw = {
          id: id,
          email: trimmedEmail,
          phone_number: phone,
          full_name: email.split('@')[0],
          role: UserRole.UNSET,
          password: password
        };
        const { error: insertError } = await supabase.from('users').insert([newUserRaw]);
        if (insertError) throw insertError;
        finalUser = mapUser(newUserRaw);
      }

      setUser(finalUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
      
      if (finalUser.role === UserRole.UNSET) setView('role-selection');
      else if (!finalUser.firstName) setView('profile-setup');
      else setView('main');
    } catch (e: any) {
      console.error("Login process error:", e);
      alert(`Ошибка: ${e.message || 'Не удалось войти'}`);
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    if (!user) return;
    const { error } = await supabase.from('users').update({ role }).eq('id', user.id);
    if (error) { 
      console.error("Role update error:", error);
      alert(`Ошибка сохранения роли: ${error.message}`); 
      return; 
    }
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setView('profile-setup');
  };

  const handleProfileSave = async (firstName: string, lastName: string, middleName: string) => {
    if (!user) return;
    const fullName = `${lastName} ${firstName} ${middleName}`.trim();
    const updateDataRaw = { 
      first_name: firstName, 
      last_name: lastName, 
      middle_name: middleName, 
      full_name: fullName 
    };
    const { error } = await supabase.from('users').update(updateDataRaw).eq('id', user.id);
    if (error) { 
      console.error("Profile save error:", error);
      alert(`Ошибка сохранения профиля: ${error.message}`); 
      return; 
    }
    const updated = { ...user, firstName, lastName, middleName, fullName };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setView('main');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    setView('login');
  };

  const handleSaveTrip = async (tripData: Trip) => {
    const dbTrip = {
      id: tripData.id,
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

    const { error } = await supabase.from('trips').upsert([dbTrip]);
    
    if (error) {
      console.error("Trip save error:", error);
      alert(`Ошибка при сохранении рейса: ${error.message}`);
    } else {
      setDriverSubView('dashboard');
      setEditingTrip(null);
      fetchData();
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Удалить рейс?')) return;
    await supabase.from('bookings').delete().eq('trip_id', tripId);
    await supabase.from('trips').delete().eq('id', tripId);
    fetchData();
  };

  const handleRequestBooking = async (tripId: string) => {
    if (!user) return;
    const newBookingRaw = {
      id: 'book_' + Math.random().toString(36).substr(2, 9),
      trip_id: tripId,
      passenger_id: user.id,
      passenger_name: user.fullName,
      status: BookingStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    const { error } = await supabase.from('bookings').insert([newBookingRaw]);
    if (error) { 
      console.error("Booking request error:", error);
      alert(`Ошибка бронирования: ${error.message}`); 
      return; 
    }
    setPassengerSubView('bookings');
    fetchData();
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Отменить бронирование?')) return;
    await supabase.from('bookings').delete().eq('id', bookingId);
    fetchData();
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) { 
      console.error("Status update error:", error);
      alert(`Ошибка обновления статуса: ${error.message}`); 
      return; 
    }

    const trip = trips.find(t => t.id === booking.tripId);
    if (status === BookingStatus.APPROVED && trip) {
        await supabase.from('trips').update({ available_seats: Math.max(0, trip.availableSeats - 1) }).eq('id', trip.id);
    }
    fetchData();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Kavkaz Express',
        text: 'Бронируйте поездки Ингушетия — Москва онлайн!',
        url: window.location.href,
      });
    } else {
      alert('Скопируйте ссылку из адресной строки');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light gap-4">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {view === 'login' && <Login onLogin={handleLogin} allUsers={allUsers} />}
      {view === 'role-selection' && <RoleSelection onSelectRole={handleRoleSelect} />}
      {view === 'profile-setup' && <ProfileSetup onSave={handleProfileSave} />}
      
      {view === 'main' && (
        <>
          {globalSubView === 'notifications' ? (
            <NotificationsView 
              notifications={notifications.filter(n => n.userId === user?.id)} 
              onBack={() => setGlobalSubView(null)} 
              onMarkAsRead={(id) => supabase.from('notifications').update({is_read: true}).eq('id', id)} 
              onClearAll={() => supabase.from('notifications').delete().eq('user_id', user?.id)} 
            />
          ) : user?.role === UserRole.PASSENGER ? (
            <div className="flex-1 overflow-hidden flex flex-col pb-20">
              {passengerSubView === 'home' && (
                <PassengerHome 
                  user={user!} 
                  unreadNotifications={notifications.filter(n => n.userId === user?.id && !n.isRead).length}
                  onOpenNotifications={() => setGlobalSubView('notifications')}
                  onSearch={(date) => { setSelectedDate(date); setPassengerSubView('trip-list'); }} 
                  onNavigateBookings={() => setPassengerSubView('bookings')}
                />
              )}
              {passengerSubView === 'trip-list' && (
                <PassengerTripList trips={trips.filter(t => t.date.split('T')[0] === selectedDate)} allUsers={allUsers} onBook={handleRequestBooking} onBack={() => setPassengerSubView('home')} selectedDate={selectedDate} />
              )}
              {passengerSubView === 'bookings' && (
                <MyBookings bookings={bookings.filter(b => b.passengerId === user!.id)} trips={trips} onBack={() => setPassengerSubView('home')} onCancelBooking={handleCancelBooking} />
              )}
              <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 flex justify-around p-3 z-50">
                <button onClick={() => setPassengerSubView('home')} className={`flex flex-col items-center ${passengerSubView !== 'bookings' ? 'text-primary' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined">explore</span>
                  <span className="text-[10px] font-bold">Поиск</span>
                </button>
                <button onClick={() => setPassengerSubView('bookings')} className={`flex flex-col items-center ${passengerSubView === 'bookings' ? 'text-primary' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined">confirmation_number</span>
                  <span className="text-[10px] font-bold">Билеты</span>
                </button>
                <button onClick={handleShare} className="flex flex-col items-center text-slate-400">
                  <span className="material-symbols-outlined">share</span>
                  <span className="text-[10px] font-bold">Поделиться</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center text-slate-400">
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-[10px] font-bold">Выход</span>
                </button>
              </nav>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col pb-20">
              {driverSubView === 'dashboard' && (
                <DriverDashboard 
                  user={user!} 
                  unreadNotifications={notifications.filter(n => n.userId === user?.id && !n.isRead).length} 
                  onOpenNotifications={() => setGlobalSubView('notifications')} 
                  trips={trips.filter(t => t.driverId === user?.id)} 
                  bookings={bookings} 
                  onCreateTrip={() => { setEditingTrip(null); setDriverSubView('create-trip'); }} 
                  onManageTrip={(trip) => { setSelectedTripForManage(trip); setDriverSubView('manage-requests'); }} 
                  onEditTrip={(trip) => { setEditingTrip(trip); setDriverSubView('create-trip'); }} 
                  onDeleteTrip={handleDeleteTrip} 
                />
              )}
              {driverSubView === 'create-trip' && (
                <CreateTrip driverId={user!.id} initialTrip={editingTrip} onSave={handleSaveTrip} onCancel={() => { setEditingTrip(null); setDriverSubView('dashboard'); }} />
              )}
              {driverSubView === 'manage-requests' && selectedTripForManage && (
                <ManageRequests trip={selectedTripForManage} bookings={bookings.filter(b => b.tripId === selectedTripForManage.id)} allUsers={allUsers} onUpdateStatus={updateBookingStatus} onBack={() => setDriverSubView('dashboard')} />
              )}
              <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 flex justify-around p-3 z-50">
                <button onClick={() => setDriverSubView('dashboard')} className={`flex flex-col items-center ${driverSubView === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="text-[10px] font-bold">Рейсы</span>
                </button>
                <button onClick={() => { setEditingTrip(null); setDriverSubView('create-trip'); }} className={`flex flex-col items-center ${driverSubView === 'create-trip' ? 'text-primary' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined">add_box</span>
                  <span className="text-[10px] font-bold">Новый</span>
                </button>
                <button onClick={handleShare} className="flex flex-col items-center text-slate-400">
                  <span className="material-symbols-outlined">share</span>
                  <span className="text-[10px] font-bold">Поделиться</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center text-slate-400">
                  <span className="material-symbols-outlined">logout</span>
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
