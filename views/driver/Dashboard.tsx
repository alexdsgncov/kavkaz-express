
import React from 'react';
import { User, Trip, Booking, BookingStatus } from '../../types';

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

const RussianPlate: React.FC<{ plate: string }> = ({ plate }) => {
  const p = plate.toUpperCase();
  const main = p.slice(0, 6);
  const region = p.slice(6);
  return (
    <div className="inline-flex items-center bg-white border-[1px] border-slate-900 rounded-[2px] px-0.5 h-4 font-mono font-bold text-slate-900 text-[8px] leading-none shrink-0">
      <div className="px-1 border-r-[1px] border-slate-900 h-full flex items-center gap-0.5">
        <span>{main.slice(0,1)}</span>
        <span>{main.slice(1,4)}</span>
        <span>{main.slice(4,6)}</span>
      </div>
      <div className="flex flex-col items-center justify-center px-1 min-w-[12px]">
        <span>{region}</span>
        <div className="flex items-center gap-[0.5px] mt-[-1px]">
          <span className="text-[3px]">RUS</span>
          <div className="w-1 h-0.5 border-[0.1px] border-slate-300 flex flex-col">
            <div className="bg-white h-1/3"></div>
            <div className="bg-blue-600 h-1/3"></div>
            <div className="bg-red-600 h-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, unreadNotifications, onOpenNotifications, trips, bookings, onCreateTrip, onManageTrip, onEditTrip, onDeleteTrip }) => {
  const getPendingForTrip = (tripId: string) => 
    bookings.filter(b => b.tripId === tripId && b.status === BookingStatus.PENDING).length;

  const getOccupiedSeats = (tripId: string) =>
    bookings.filter(b => b.tripId === tripId && b.status === BookingStatus.APPROVED).length;

  return (
    <div className="flex-1 p-4 pb-24 space-y-6 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-100 border-2 border-primary/20 overflow-hidden">
             <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="Avatar" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Водитель</p>
            <h1 className="text-lg font-bold">{user.fullName}</h1>
          </div>
        </div>
        <button onClick={onOpenNotifications} className="relative p-2 text-slate-600 active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 size-4 bg-red-500 rounded-full border-2 border-bg-light text-[8px] flex items-center justify-center text-white font-black">
              {unreadNotifications}
            </span>
          )}
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-success mb-2">
            <span className="material-symbols-outlined text-lg">event_available</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Рейсы</span>
          </div>
          <p className="text-2xl font-black">{trips.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined text-lg">group</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Пассажиры</span>
          </div>
          <p className="text-2xl font-black">
            {bookings.filter(b => b.status === BookingStatus.APPROVED).length}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <button onClick={onCreateTrip} className="w-full flex items-center gap-4 bg-primary p-5 rounded-2xl shadow-xl shadow-primary/20 text-white transition-all active:scale-95">
          <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-lg leading-none">Создать рейс</p>
            <p className="text-white/60 text-xs mt-1">Добавьте новый маршрут</p>
          </div>
        </button>

        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 ml-1">Ваши активные рейсы</h3>

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 border-dashed text-center">
            <span className="material-symbols-outlined text-slate-200 text-5xl">route</span>
            <p className="text-slate-400 font-medium text-sm">Нет созданных рейсов.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => {
              const pending = getPendingForTrip(trip.id);
              const occupied = getOccupiedSeats(trip.id);
              return (
                <div key={trip.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-black shrink-0 border border-slate-100">
                      <span className="text-[10px] uppercase">{new Date(trip.date).toLocaleDateString('ru-RU', { month: 'short' })}</span>
                      <span className="text-lg leading-none">{new Date(trip.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate text-sm">Назрань → Москва</p>
                        <RussianPlate plate={trip.busPlate} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{trip.departureTime} — {trip.arrivalTime}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrip(trip.id);
                        }}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                       >
                         <span className="material-symbols-outlined text-lg">delete</span>
                       </button>
                       <p className="text-xs font-black text-success mt-auto">{trip.price} ₽</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => onEditTrip(trip)} className="flex-1 py-2.5 rounded-xl border border-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Изменить
                    </button>
                    <button onClick={() => onManageTrip(trip)} className="flex-[2] py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                      <span className="material-symbols-outlined text-sm">group</span>
                      Заявки {pending > 0 && <span className="ml-2 bg-red-500 text-white text-[9px] size-4 rounded-full flex items-center justify-center">{pending}</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DriverDashboard;
