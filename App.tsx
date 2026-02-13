
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Trip, Booking, BookingStatus } from './types';
import { db } from './lib/store';
import Login from './views/Login';
import RoleSelection from './views/RoleSelection';
import ProfileSetup from './views/ProfileSetup';
import PassengerHome from './views/passenger/Home';
import PassengerTripList from './views/passenger/TripList';
import DriverDashboard from './views/driver/Dashboard';
import CreateTrip from './views/driver/CreateTrip';

const SESSION_KEY = 'kavkaz_session_v5';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('loading');
  const [subView, setSubView] = useState<string>('home');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const tg = (window as any).Telegram?.WebApp;

  const updateTrips = useCallback(() => {
    setTrips(db.getData().trips);
  }, []);

  useEffect(() => {
    updateTrips();
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      // Настройка цветов под тему Telegram
      const isDark = tg.colorScheme === 'dark';
      document.body.style.backgroundColor = tg.backgroundColor || (isDark ? '#1c1c1d' : '#f6f7f8');
      
      if (tg.initDataUnsafe?.user) {
        const tgu = tg.initDataUnsafe.user;
        const existing = localStorage.getItem(SESSION_KEY);
        
        if (existing) {
          const u = JSON.parse(existing);
          setUser(u);
          if (u.role === UserRole.UNSET) setView('role-selection');
          else if (!u.firstName) setView('profile-setup');
          else setView('main');
        } else {
          const newUser: User = {
            id: `tg_${tgu.id}`,
            email: tgu.username ? `@${tgu.username}` : `id${tgu.id}`,
            phoneNumber: '',
            role: UserRole.UNSET,
            fullName: `${tgu.first_name} ${tgu.last_name || ''}`.trim(),
            firstName: tgu.first_name,
            lastName: tgu.last_name || ''
          };
          setUser(newUser);
          setView('role-selection');
        }
      } else {
        const sess = localStorage.getItem(SESSION_KEY);
        if (sess) {
          const u = JSON.parse(sess);
          setUser(u);
          setView('main');
        } else {
          setView('login');
        }
      }
    }
    setView(prev => prev === 'loading' ? 'login' : prev);
  }, [tg, updateTrips]);

  useEffect(() => {
    if (!tg) return;
    const isHome = (view === 'main' && subView === 'home');
    if (isHome) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      const handleBack = () => {
        if (subView !== 'home') setSubView('home');
        else if (view === 'profile-setup') setView('role-selection');
        else if (view === 'role-selection') setView('login');
        tg.HapticFeedback.impactOccurred('light');
      };
      tg.BackButton.onClick(handleBack);
      return () => tg.BackButton.offClick(handleBack);
    }
  }, [view, subView, tg]);

  const handleShare = () => {
    if (tg) {
      tg.switchInlineQuery("Поехали со мной в Москву! Забронируй место в Kavkaz Express", ["users", "groups", "channels"]);
    }
  };

  const handleBooking = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip || !user) return;
    const msg = `Бронь: ${trip.from}-${trip.to}\nДата: ${new Date(trip.date).toLocaleDateString()}\nПассажир: ${user.fullName}\nТел: ${user.phoneNumber || 'не указан'}`;
    const url = `https://wa.me/79280000000?text=${encodeURIComponent(msg)}`;
    tg?.showConfirm("Отправить заявку водителю в WhatsApp?", (ok: boolean) => {
      if (ok) tg.openLink(url);
    });
  };

  if (view === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
       <div className="animate-pulse flex flex-col items-center">
          <span className="material-symbols-outlined text-primary text-6xl mb-4">directions_bus</span>
          <p className="font-black text-primary animate-bounce">ЗАГРУЗКА...</p>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto relative overflow-x-hidden">
      {/* Offline Badge */}
      <div className="fixed top-2 right-2 z-[100] bg-amber-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full shadow-sm">
        MVP MODE (LOCAL)
      </div>

      {view === 'login' && <Login onLogin={(e, p) => {
        const u = { id: 'u_'+Date.now(), email: e, phoneNumber: p, role: UserRole.UNSET, fullName: '' };
        setUser(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setView('role-selection');
      }} allUsers={[]} />}
      
      {view === 'role-selection' && <RoleSelection onSelectRole={(role) => {
        if (!user) return;
        const updated = { ...user, role };
        setUser(updated);
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setView('profile-setup');
        tg?.HapticFeedback.impactOccurred('medium');
      }} />}

      {view === 'profile-setup' && <ProfileSetup onSave={(f, l, m) => {
        if (!user) return;
        const updated = { ...user, firstName: f, lastName: l, middleName: m, fullName: `${l} ${f}` };
        setUser(updated);
        db.updateUser(updated);
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setView('main');
        tg?.HapticFeedback.notificationOccurred('success');
      }} />}
      
      {view === 'main' && user && (
        <div className="flex-1 flex flex-col">
          {user.role === UserRole.PASSENGER ? (
            <>
              {subView === 'home' && (
                <PassengerHome user={user} unreadNotifications={0} onOpenNotifications={() => {}} onSearch={(d) => { setSelectedDate(d); setSubView('trip-list'); }} onNavigateBookings={() => {}} onShare={handleShare} />
              )}
              {subView === 'trip-list' && (
                <PassengerTripList trips={trips.filter(t => t.date.startsWith(selectedDate))} allUsers={[]} onBook={handleBooking} onBack={() => setSubView('home')} selectedDate={selectedDate} />
              )}
            </>
          ) : (
            <>
              {subView === 'home' && (
                <DriverDashboard user={user} unreadNotifications={0} onOpenNotifications={() => {}} trips={trips} bookings={[]} onCreateTrip={() => { setEditingTrip(null); setSubView('create-trip'); }} onManageTrip={() => {}} onEditTrip={(t) => { setEditingTrip(t); setSubView('create-trip'); }} onDeleteTrip={(id) => { db.deleteTrip(id); updateTrips(); }} />
              )}
              {subView === 'create-trip' && (
                <CreateTrip driverId={user.id} initialTrip={editingTrip} onSave={(trip) => {
                  db.addTrip(trip);
                  updateTrips();
                  setSubView('home');
                  tg?.HapticFeedback.notificationOccurred('success');
                }} onCancel={() => setSubView('home')} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
