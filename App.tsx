
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, UserRole, Trip, Booking, BookingStatus, Notification, NotificationType } from './types';
import { supabase, checkConnection } from './lib/supabase';
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

const SESSION_KEY = 'kavkaz_session_v6';
const SYNC_QUEUE_KEY = 'kavkaz_sync_queue';
const CACHE_KEY = 'kavkaz_cache_v6';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [view, setView] = useState<string>('login'); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('offline');
  const [isSyncing, setIsSyncing] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengerSubView, setPassengerSubView] = useState<string>('home');
  const [driverSubView, setDriverSubView] = useState<string>('dashboard');
  const [globalSubView, setGlobalSubView] = useState<string | null>(null); 
  const [selectedTripForManage, setSelectedTripForManage] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // --- МАППИНГ ---
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

  // --- ОЧЕРЕДЬ СИНХРОНИЗАЦИИ (The Heart of Global Reliability) ---
  const addToSyncQueue = (operation: any) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({ ...operation, id: Date.now(), timestamp: new Date().toISOString() });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    processSyncQueue();
  };

  const processSyncQueue = async () => {
    if (isSyncing) return;
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) {
      setSyncStatus('online');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    const item = queue[0];
    try {
      let error;
      if (item.type === 'upsert_user') {
        const { error: e } = await supabase.from('users').upsert(item.data);
        error = e;
      } else if (item.type === 'upsert_trip') {
        const { error: e } = await supabase.from('trips').upsert(item.data);
        error = e;
      } else if (item.type === 'create_booking') {
        const { error: e } = await supabase.from('bookings').insert(item.data);
        error = e;
      } else if (item.type === 'update_booking') {
        const { error: e } = await supabase.from('bookings').update(item.data).eq('id', item.targetId);
        error = e;
      }

      if (error) throw error;

      // Удаляем успешно обработанный элемент
      const newQueue = queue.slice(1);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
      setIsSyncing(false);
      // Рекурсивно обрабатываем дальше
      processSyncQueue();
    } catch (err) {
      console.warn("Sync stalled (network issue):", err);
      setIsSyncing(false);
      setSyncStatus('offline');
    }
  };

  // --- ЗАГРУЗКА И КЭШ ---
  const loadData = async () => {
    // 1. Сначала грузим из кэша (моментально)
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    if (cached.trips) setTrips(cached.trips.map(mapTrip));
    if (cached.users) setAllUsers(cached.users.map(mapUser));
    if (cached.bookings) setBookings(cached.bookings);
    if (cached.notifications) setNotifications(cached.notifications);

    // 2. Пытаемся обновиться из облака
    try {
      const conn = await checkConnection();
      if (!conn.ok) throw new Error("Offline");

      const [{ data: u }, { data: t }, { data: b }, { data: n }] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('trips').select('*').order('date', { ascending: true }),
        supabase.from('bookings').select('*').order('timestamp', { ascending: false }),
        supabase.from('notifications').select('*').order('timestamp', { ascending: false })
      ]);

      const mappedUsers = (u || []).map(mapUser);
      const mappedTrips = (t || []).map(mapTrip);
      
      setAllUsers(mappedUsers);
      setTrips(mappedTrips);
      setBookings(b || []);
      setNotifications(n || []);
      setSyncStatus('online');

      // Сохраняем в кэш
      localStorage.setItem(CACHE_KEY, JSON.stringify({ users: u, trips: t, bookings: b, notifications: n }));
    } catch (e) {
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData();
      const sess = localStorage.getItem(SESSION_KEY);
      if (sess) {
        const u = JSON.parse(sess);
        setUser(u);
        if (u.role === UserRole.UNSET) setView('role-selection');
        else if (!u.firstName) setView('profile-setup');
        else setView('main');
      }
      setIsLoading(false);
      
      // Запускаем фоновую синхронизацию каждые 30 секунд
      const interval = setInterval(processSyncQueue, 30000);
      return () => clearInterval(interval);
    };
    init();
  }, []);

  // --- ОБРАБОТЧИКИ (С поддержкой Очереди) ---
  const handleLogin = async (email: string, phone: string, password?: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    // Локально ищем пользователя или создаем временный ID
    const existing = allUsers.find(u => u.email === trimmedEmail);
    const finalUser: User = existing 
      ? { ...existing, phoneNumber: phone, password: password || existing.password }
      : { id: existing?.id || 'u_' + Date.now(), email: trimmedEmail, phoneNumber: phone, role: UserRole.UNSET, fullName: '', password };

    setUser(finalUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
    
    // В очередь на обновление в облаке
    addToSyncQueue({
      type: 'upsert_user',
      data: { id: finalUser.id, email: finalUser.email, phone_number: finalUser.phoneNumber, role: finalUser.role, password: finalUser.password }
    });

    setView(finalUser.role === UserRole.UNSET ? 'role-selection' : (!finalUser.firstName ? 'profile-setup' : 'main'));
  };

  const handleRoleSelect = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    addToSyncQueue({ type: 'upsert_user', data: { id: user.id, role } });
    setView('profile-setup');
  };

  const handleProfileSave = (f: string, l: string, m: string) => {
    if (!user) return;
    const fullName = `${l} ${f} ${m}`.trim();
    const updated = { ...user, firstName: f, lastName: l, middleName: m, fullName };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    addToSyncQueue({ 
      type: 'upsert_user', 
      data: { id: user.id, first_name: f, last_name: l, middle_name: m, full_name: fullName } 
    });
    setView('main');
  };

  const handleRequestBooking = (tripId: string) => {
    if (!user) return;
    const bookingId = 'b_' + Date.now();
    const newBooking = { id: bookingId, tripId, passengerId: user.id, passengerName: user.fullName, status: BookingStatus.PENDING, timestamp: new Date().toISOString() };
    
    setBookings([newBooking, ...bookings]);
    addToSyncQueue({
      type: 'create_booking',
      data: { id: bookingId, trip_id: tripId, passenger_id: user.id, passenger_name: user.fullName, status: BookingStatus.PENDING }
    });
    setPassengerSubView('bookings');
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
    addToSyncQueue({
      type: 'update_booking',
      targetId: bookingId,
      data: { status }
    });
  };

  const handleSaveTrip = (trip: Trip) => {
    setTrips([trip, ...trips.filter(t => t.id !== trip.id)]);
    addToSyncQueue({
      type: 'upsert_trip',
      data: {
        id: trip.id.startsWith('trip_') ? undefined : trip.id, // Supabase сгенерит если нет
        driver_id: trip.driverId, date: trip.date, price: trip.price, total_seats: trip.totalSeats,
        available_seats: trip.availableSeats, from: trip.from, to: trip.to,
        departure_address: trip.departureAddress, arrival_address: trip.arrivalAddress,
        departure_time: trip.departureTime, arrival_time: trip.arrivalTime, bus_plate: trip.busPlate, type: trip.type
      }
    });
    setDriverSubView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    setView('login');
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light gap-4">
      <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Kavkaz Express</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-100">
      {/* Светофор синхронизации */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-3 py-1 rounded-b-xl flex items-center gap-2 shadow-lg transition-all ${
        syncStatus === 'online' ? 'bg-success text-white' : 
        syncStatus === 'syncing' ? 'bg-primary text-white animate-pulse' : 'bg-danger text-white'
      }`}>
        <span className="material-symbols-outlined text-[10px]">{
          syncStatus === 'online' ? 'cloud_done' : syncStatus === 'syncing' ? 'sync' : 'cloud_off'
        }</span>
        <span className="text-[8px] font-black uppercase tracking-tighter">
          {syncStatus === 'online' ? 'В сети' : syncStatus === 'syncing' ? 'Синхронизация...' : 'Офлайн (Кэш)'}
        </span>
      </div>

      {view === 'login' && <Login onLogin={handleLogin} allUsers={allUsers} />}
      {view === 'role-selection' && <RoleSelection onSelectRole={handleRoleSelect} />}
      {view === 'profile-setup' && <ProfileSetup onSave={handleProfileSave} />}
      
      {view === 'main' && user && (
        <>
          {globalSubView === 'notifications' ? (
            <NotificationsView notifications={notifications.filter(n => n.userId === user.id)} onBack={() => setGlobalSubView(null)} onMarkAsRead={() => {}} onClearAll={() => {}} />
          ) : user.role === UserRole.PASSENGER ? (
            <div className="flex-1 flex flex-col pb-20 overflow-hidden">
              {passengerSubView === 'home' && (
                <PassengerHome user={user} unreadNotifications={notifications.filter(n => n.userId === user.id && !n.isRead).length} onOpenNotifications={() => setGlobalSubView('notifications')} onSearch={(date) => { setSelectedDate(date); setPassengerSubView('trip-list'); }} onNavigateBookings={() => setPassengerSubView('bookings')} />
              )}
              {passengerSubView === 'trip-list' && (
                <PassengerTripList trips={trips.filter(t => t.date.split('T')[0] === selectedDate)} allUsers={allUsers} onBook={handleRequestBooking} onBack={() => setPassengerSubView('home')} selectedDate={selectedDate} />
              )}
              {passengerSubView === 'bookings' && (
                <MyBookings bookings={bookings.filter(b => b.passengerId === user.id)} trips={trips} onBack={() => setPassengerSubView('home')} onCancelBooking={() => {}} />
              )}
              <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around p-3 z-50">
                <button onClick={() => setPassengerSubView('home')} className={`flex flex-col items-center gap-1 transition-all ${passengerSubView !== 'bookings' ? 'text-primary scale-110' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-black">explore</span>
                  <span className="text-[9px] font-black uppercase">Поиск</span>
                </button>
                <button onClick={() => setPassengerSubView('bookings')} className={`flex flex-col items-center gap-1 transition-all ${passengerSubView === 'bookings' ? 'text-primary scale-110' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-black">confirmation_number</span>
                  <span className="text-[9px] font-black uppercase">Билеты</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-300">
                  <span className="material-symbols-outlined font-black">logout</span>
                  <span className="text-[9px] font-black uppercase">Выход</span>
                </button>
              </nav>
            </div>
          ) : (
            <div className="flex-1 flex flex-col pb-20 overflow-hidden">
              {driverSubView === 'dashboard' && (
                <DriverDashboard user={user} unreadNotifications={notifications.filter(n => n.userId === user.id && !n.isRead).length} onOpenNotifications={() => setGlobalSubView('notifications')} trips={trips.filter(t => t.driverId === user.id)} bookings={bookings} onCreateTrip={() => { setEditingTrip(null); setDriverSubView('create-trip'); }} onManageTrip={(trip) => { setSelectedTripForManage(trip); setDriverSubView('manage-requests'); }} onEditTrip={(trip) => { setEditingTrip(trip); setDriverSubView('create-trip'); }} onDeleteTrip={() => {}} />
              )}
              {driverSubView === 'create-trip' && (
                <CreateTrip driverId={user.id} initialTrip={editingTrip} onSave={handleSaveTrip} onCancel={() => setDriverSubView('dashboard')} />
              )}
              {driverSubView === 'manage-requests' && selectedTripForManage && (
                <ManageRequests trip={selectedTripForManage} bookings={bookings.filter(b => b.tripId === selectedTripForManage.id)} allUsers={allUsers} onUpdateStatus={handleUpdateBookingStatus} onBack={() => setDriverSubView('dashboard')} />
              )}
              <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around p-3 z-50">
                <button onClick={() => setDriverSubView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${driverSubView === 'dashboard' ? 'text-primary scale-110' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-black">dashboard</span>
                  <span className="text-[9px] font-black uppercase">Рейсы</span>
                </button>
                <button onClick={() => { setEditingTrip(null); setDriverSubView('create-trip'); }} className={`flex flex-col items-center gap-1 transition-all ${driverSubView === 'create-trip' ? 'text-primary scale-110' : 'text-slate-300'}`}>
                  <span className="material-symbols-outlined font-black">add_circle</span>
                  <span className="text-[9px] font-black uppercase">Новый</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-300">
                  <span className="material-symbols-outlined font-black">logout</span>
                  <span className="text-[9px] font-black uppercase">Выход</span>
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
