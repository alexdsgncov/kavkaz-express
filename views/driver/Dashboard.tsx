
import React from 'react';
import { User, Trip, Booking } from '../../types';

interface DriverDashboardProps {
  user: User;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  trips: Trip[];
  bookings: Booking[];
  onCreateTrip: () => void;
  onManageTrip: (trip: Trip) => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onLogout?: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, trips, bookings, onCreateTrip, onEditTrip, onDeleteTrip, onManageTrip, onLogout }) => {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-20">
      <header className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Панель управления</p>
          <h1 className="text-2xl font-black">{user.fullName}</h1>
          <button onClick={onLogout} className="text-[10px] text-red-500 font-bold uppercase mt-2">Выйти из режима водителя</button>
        </div>
        <button onClick={onCreateTrip} className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </header>

      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] text-slate-300">
             <span className="material-symbols-outlined text-6xl">directions_bus</span>
             <p className="font-bold mt-2">Рейсов еще нет</p>
             <button onClick={onCreateTrip} className="mt-4 text-primary font-bold text-sm">Создать первый рейс</button>
          </div>
        ) : (
          trips.map(trip => {
            const tripBookings = bookings.filter(b => b.tripId === trip.id);
            const pendingCount = tripBookings.filter(b => b.status === 'pending').length;
            
            return (
              <div key={trip.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-5">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center font-black text-slate-400">
                         <span className="text-[8px] uppercase">{new Date(trip.date).toLocaleDateString('ru', {month: 'short'})}</span>
                         <span className="text-lg">{new Date(trip.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none">Назрань — Москва</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                          <span className="material-symbols-outlined text-xs">directions_bus</span>
                          <span>{trip.busPlate}</span>
                        </div>
                      </div>
                   </div>
                   <p className="font-black text-primary text-xl">{trip.price} ₽</p>
                </div>

                <div className="flex gap-2">
                   <button 
                      onClick={() => onManageTrip(trip)}
                      className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 relative"
                   >
                      {pendingCount > 0 && <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center animate-bounce">{pendingCount}</span>}
                      <span className="material-symbols-outlined text-sm">group</span>
                      Заявки ({tripBookings.length})
                   </button>
                   <button onClick={() => onEditTrip(trip)} className="flex-1 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl text-[10px] uppercase active:bg-slate-100">
                      Ред.
                   </button>
                   <button onClick={() => onDeleteTrip(trip.id)} className="px-5 py-4 bg-red-50 text-red-500 rounded-2xl active:bg-red-100">
                      <span className="material-symbols-outlined text-lg">delete</span>
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
