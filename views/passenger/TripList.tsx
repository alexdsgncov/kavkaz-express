
import React from 'react';
import { Trip, User } from '../../types';

interface PassengerTripListProps {
  trips: Trip[];
  allUsers: User[];
  onBook: (tripId: string) => void;
  onBack: () => void;
  selectedDate: string;
}

const PassengerTripList: React.FC<PassengerTripListProps> = ({ trips, onBook, onBack, selectedDate }) => {
  return (
    <div className="flex-1 pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-primary p-2">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg">Назрань — Москва</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-4">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <span className="material-symbols-outlined text-6xl">directions_bus</span>
            <p className="mt-4 font-bold">Рейсов на эту дату не найдено</p>
            <button onClick={onBack} className="mt-4 text-primary font-bold text-sm">Выбрать другую дату</button>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">airport_shuttle</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{trip.type} Express</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trip.busPlate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{trip.price} ₽</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Оплата при посадке</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <p className="text-lg font-black leading-none">{trip.departureTime}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Назрань</p>
                </div>
                <div className="flex-[2] flex flex-col items-center px-4 relative">
                  <div className="w-full h-[1px] bg-slate-200 dashed relative">
                     <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <span className="material-symbols-outlined text-slate-300 text-sm">trending_flat</span>
                     </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase">~18-20 часов</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-lg font-black leading-none">{trip.arrivalTime}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Москва</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Свободно</p>
                  <p className="text-sm font-black text-slate-700">{trip.availableSeats} из {trip.totalSeats} мест</p>
                </div>
                <button 
                  onClick={() => onBook(trip.id)}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Забронировать
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default PassengerTripList;
