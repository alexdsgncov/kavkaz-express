
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
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, trips, bookings, onCreateTrip, onEditTrip, onDeleteTrip, onManageTrip }) => {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-20">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="size-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud DB Online</p>
          </div>
          <h1 className="text-2xl font-black">{user.fullName}</h1>
        </div>
        <button onClick={onCreateTrip} className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </header>

      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] text-slate-300">
             <span className="material-symbols-outlined text-6xl">database_off</span>
             <p className="font-bold mt-2">Рейсов еще нет</p>
          </div>
        ) : (
          trips.map(trip => {
            const tripBookings = bookings.filter(b => b.tripId === trip.id);
            return (
              <div key={trip.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-5 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center font-black text-slate-400">
                         <span className="text-[8px] uppercase">{new Date(trip.date).toLocaleDateString('ru', {month: 'short'})}</span>
                         <span className="text-lg">{new Date(trip.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none">Назрань — Москва</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400">
                          <span className="material-symbols-outlined text-xs">history</span>
                          <span>{trip.busPlate.toUpperCase()}</span>
                        </div>
                      </div>
                   </div>
                   <p className="font-black text-primary text-xl">{trip.price} ₽</p>
                </div>

                <div className="flex gap-2">
                   <button 
                      onClick={() => onManageTrip(trip)}
                      className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
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
