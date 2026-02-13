
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

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, trips, onCreateTrip, onEditTrip, onDeleteTrip }) => {
  const tg = (window as any).Telegram?.WebApp;

  const copyTripDetails = (trip: Trip) => {
    const text = `Рейс: Назрань — Москва\nДата: ${new Date(trip.date).toLocaleDateString('ru')}\nВремя: ${trip.departureTime}\nАвтобус: ${trip.busPlate.toUpperCase()}\nЦена: ${trip.price} ₽`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      tg?.HapticFeedback.notificationOccurred('success');
      tg?.showAlert('Данные рейса скопированы в буфер обмена!');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-20">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Личный кабинет</p>
          <h1 className="text-2xl font-black">{user.fullName}</h1>
        </div>
        <button onClick={onCreateTrip} className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Ваши рейсы</span>
          <span className="text-3xl font-black text-primary">{trips.length}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Рейтинг</span>
          <span className="text-3xl font-black text-success">5.0</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Мои поездки</h3>
        <button className="text-[10px] font-black text-primary uppercase">Архив</button>
      </div>

      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="py-20 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
             <span className="material-symbols-outlined text-5xl">directions_bus</span>
             <p className="font-bold mt-2 text-sm">У вас еще нет активных рейсов</p>
             <button onClick={onCreateTrip} className="mt-4 text-primary font-black text-xs uppercase underline">Создать первый</button>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="size-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center font-black text-slate-400 border border-slate-100">
                      <span className="text-[8px] uppercase">{new Date(trip.date).toLocaleDateString('ru', {month: 'short'})}</span>
                      <span className="text-lg leading-none">{new Date(trip.date).getDate()}</span>
                   </div>
                   <div>
                      <p className="font-black text-slate-900 text-lg">Назрань — Москва</p>
                      <div className="flex items-center gap-2">
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{trip.busPlate}</p>
                         <span className="size-1 bg-slate-200 rounded-full"></span>
                         <p className="text-[10px] font-bold text-primary uppercase">{trip.type}</p>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-primary text-xl">{trip.price} ₽</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase">Оплата наличными</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                 <button onClick={() => onEditTrip(trip)} className="flex-1 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 active:bg-slate-100">
                    <span className="material-symbols-outlined text-sm">edit</span> Изменить
                 </button>
                 <button onClick={() => copyTripDetails(trip)} className="flex-1 py-4 bg-primary/5 text-primary font-bold rounded-2xl text-xs flex items-center justify-center gap-2 active:bg-primary/10">
                    <span className="material-symbols-outlined text-sm">content_copy</span> Текст
                 </button>
                 <button 
                  onClick={() => { if(confirm('Удалить рейс?')) onDeleteTrip(trip.id); }} 
                  className="px-5 py-4 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center active:bg-red-100"
                 >
                    <span className="material-symbols-outlined text-sm">delete</span>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
