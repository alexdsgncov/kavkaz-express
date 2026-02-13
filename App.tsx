
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

const SESSION_KEY = 'kavkaz_session_v5';
const DEFAULT_BOT_TOKEN = "8463215901:AAEZBfBEI4HVJfS9WnofZx3z1-e6U2cKXX4";
const DEFAULT_CHANNEL = "sjshsgakqngceiddibwbwghsidiicheb";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('loading');
  const [subView, setSubView] = useState<string>('home');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'none'>('none');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedTripForRequests, setSelectedTripForRequests] = useState<Trip | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [botToken, setBotToken] = useState(localStorage.getItem('tg_db_token') || DEFAULT_BOT_TOKEN);
  const [channelId, setChannelId] = useState(localStorage.getItem('tg_db_channel') || DEFAULT_CHANNEL);

  const tg = (window as any).Telegram?.WebApp;

  const updateData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const isOk = await db.testConnection();
      setDbStatus(isOk ? 'connected' : 'error');
      
      const [tripsData, bookingsData] = await Promise.all([
        db.selectTrips(),
        db.selectBookings()
      ]);

      const deletedIds = JSON.parse(localStorage.getItem('db_deleted_ids') || '[]');
      setTrips(tripsData.filter(t => !deletedIds.includes(t.id)));
      setBookings(bookingsData);
    } catch {
      setDbStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await updateData();
      if (tg) {
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe?.user) {
          const tgu = tg.initDataUnsafe.user;
          const existing = localStorage.getItem(SESSION_KEY);
          if (existing) {
            setUser(JSON.parse(existing));
            setView('main');
          } else {
            const newUser: User = {
              id: `tg_${tgu.id}`,
              email: tgu.username ? `@${tgu.username}` : `id${tgu.id}`,
              phoneNumber: '',
              role: UserRole.UNSET,
              fullName: `${tgu.first_name} ${tgu.last_name || ''}`.trim(),
            };
            setUser(newUser);
            setView('role-selection');
          }
        } else {
          setView('login');
        }
      }
      setView(prev => prev === 'loading' ? 'login' : prev);
    };
    init();
  }, [tg, updateData]);

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

    setIsSyncing(true);
    const ok = await db.insertBooking(newBooking, trip);
    setIsSyncing(false);

    if (ok) {
      tg?.showAlert("Бронирование отправлено! Водитель свяжется с вами.");
      updateData();
    } else {
      tg?.showAlert("Ошибка при бронировании. Попробуйте позже.");
    }
  };

  const handleSaveDBConfig = async () => {
    db.setCredentials(botToken, channelId);
    const isOk = await db.testConnection();
    if (isOk) {
      setShowSettings(false);
      updateData();
      tg?.HapticFeedback.notificationOccurred('success');
    } else {
      tg?.showAlert("Ошибка соединения! Проверьте права бота в канале.");
    }
  };

  if (view === 'loading') return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-4">Cloud Data Syncing...</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative overflow-hidden">
      
      <button 
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 size-12 bg-white shadow-2xl rounded-full flex items-center justify-center z-[150] border border-slate-100 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-slate-400">database</span>
      </button>

      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-slate-950 p-6 flex flex-col animate-in fade-in slide-in-from-bottom">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-white font-black text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hub</span>
              Cloud Sync
            </h2>
            <button onClick={() => setShowSettings(false)} className="text-slate-500">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Bot Token</label>
                <input 
                  value={botToken} 
                  onChange={e => setBotToken(e.target.value)} 
                  className="w-full bg-transparent text-white font-mono text-xs outline-none"
                />
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Channel ID</label>
                <div className="flex items-center text-white font-mono text-xs">
                  <span className="text-slate-600">@</span>
                  <input 
                    value={channelId} 
                    onChange={e => setChannelId(e.target.value)} 
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-colors ${dbStatus === 'connected' ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
               <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Статус БД:</span>
                  <span className={`text-xs font-black uppercase ${dbStatus === 'connected' ? 'text-success' : 'text-danger'}`}>
                    {dbStatus === 'connected' ? 'АКТИВНО' : 'ОШИБКА'}
                  </span>
               </div>
            </div>
          </div>

          <button 
            onClick={handleSaveDBConfig}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20"
          >
            ОБНОВИТЬ СОЕДИНЕНИЕ
          </button>
        </div>
      )}

      <div className={`fixed top-0 left-0 right-0 h-1 z-[100] bg-primary/10 overflow-hidden ${isSyncing ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-1/3"></div>
      </div>
      
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
                  } else {
                    tg?.showAlert("Ошибка записи! Проверьте права бота в канале.");
                  }
                }} onCancel={() => setSubView('home')} />
              )}
              {subView === 'manage-requests' && selectedTripForRequests && (
                <ManageRequests 
                  trip={selectedTripForRequests} 
                  bookings={bookings.filter(b => b.tripId === selectedTripForRequests.id)} 
                  allUsers={[]} 
                  onUpdateStatus={() => {}} 
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
