
import React from 'react';
import { Trip, User } from '../../types';

interface PassengerTripListProps {
  trips: Trip[];
  allUsers: User[];
  onBook: (tripId: string) => void;
  onBack: () => void;
  selectedDate: string;
}

const RussianPlate: React.FC<{ plate: string }> = ({ plate }) => {
  const p = plate.toUpperCase();
  const main = p.slice(0, 6);
  const region = p.slice(6);
  return (
    <div className="inline-flex items-center bg-white border-[1px] border-slate-900 rounded-[2px] px-0.5 h-5 font-mono font-bold text-slate-900 text-[9px] leading-none shrink-0 shadow-[1px_1px_0_rgba(0,0,0,0.05)]">
      <div className="px-1 border-r-[1px] border-slate-900 h-full flex items-center gap-0.5">
        <span>{main.slice(0,1)}</span>
        <span>{main.slice(1,4)}</span>
        <span>{main.slice(4,6)}</span>
      </div>
      <div className="flex flex-col items-center justify-center px-1 min-w-[14px]">
        <span>{region}</span>
        <div className="flex items-center gap-[1px] mt-[-1px]">
          <span className="text-[4px] font-sans">RUS</span>
          <div className="w-1.5 h-1 border-[0.1px] border-slate-300 flex flex-col">
            <div className="bg-white h-1/3"></div>
            <div className="bg-blue-600 h-1/3"></div>
            <div className="bg-red-600 h-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PassengerTripList: React.FC<PassengerTripListProps> = ({ trips, allUsers, onBook, onBack, selectedDate }) => {
  return (
    <div className="flex-1 pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-primary flex items-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg">Назрань — Москва</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="w-8"></div>
      </header>

      <main className="p-4 space-y-4">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <span className="material-symbols-outlined text-6xl">directions_bus</span>
            <p className="mt-4 font-bold">На эту дату рейсов пока нет.</p>
          </div>
        ) : (
          trips.map(trip => {
            const driver = allUsers.find(u => u.id === trip.driverId);
            return (
              <div key={trip.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{trip.type === 'Sprinter' ? 'airport_shuttle' : 'directions_bus'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="text-xs font-bold text-slate-500">{trip.type === 'Standard' ? 'Стандарт' : trip.type}</p>
                         <RussianPlate plate={trip.busPlate} />
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Водитель: {driver?.fullName || 'Загрузка...'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900 tracking-tight">{trip.price.toLocaleString()} ₽</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center py-1 shrink-0">
                    <div className="size-2.5 rounded-full border-2 border-primary bg-white z-10"></div>
                    <div className="w-[1.5px] flex-1 bg-slate-100 my-1"></div>
                    <div className="size-2.5 rounded-full bg-slate-300 z-10"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black leading-none">{trip.departureTime}</p>
                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Назрань</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{trip.departureAddress}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black leading-none">{trip.arrivalTime}</p>
                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Москва</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{trip.arrivalAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase ${trip.availableSeats < 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                      {trip.availableSeats < 5 ? `Осталось ${trip.availableSeats} мест!` : `Свободно: ${trip.availableSeats}`}
                    </span>
                    <a href={`tel:${driver?.phoneNumber}`} className="text-[10px] text-primary font-bold mt-1 underline">Позвонить водителю</a>
                  </div>
                  <button 
                    onClick={() => onBook(trip.id)} 
                    disabled={trip.availableSeats === 0}
                    className="bg-primary disabled:bg-slate-200 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-95"
                  >
                    Забронировать
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default PassengerTripList;
