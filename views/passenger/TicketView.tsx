
import React from 'react';
import { Booking, Trip } from '../../types';

interface TicketViewProps {
  booking: Booking;
  trip: Trip;
  onBack: () => void;
}

const TicketView: React.FC<TicketViewProps> = ({ booking, trip, onBack }) => {
  return (
    <div className="flex-1 bg-primary safe-top flex flex-col p-6 animate-slide-in">
        <header className="flex items-center justify-between text-white mb-8">
            <button onClick={onBack} className="size-10 rounded-full bg-white/20 flex items-center justify-center btn-press">
                <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-bold text-lg">Электронный билет</h2>
            <div className="size-10"></div>
        </header>

        <div className="bg-white rounded-[40px] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Маршрут</p>
                        <h3 className="text-xl font-extrabold text-slate-900">{trip.from} — {trip.to}</h3>
                    </div>
                    <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <p className="text-[10px] font-black text-primary uppercase">Рассадка</p>
                        <span className="material-symbols-outlined text-primary">event_seat</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Выезд</p>
                        <p className="text-lg font-bold">{trip.departureTime}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase">{new Date(trip.date).toLocaleDateString('ru')}</p>
                    </div>
                    <div className="size-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <span className="material-symbols-outlined text-lg">trending_flat</span>
                    </div>
                    <div className="flex-1 text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Прибытие</p>
                        <p className="text-lg font-bold">{trip.arrivalTime}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase">След. день</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                        <span className="material-symbols-outlined text-2xl">directions_bus</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trip.busModel}</p>
                        <p className="text-sm font-extrabold uppercase">{trip.busPlate}</p>
                    </div>
                </div>
            </div>

            <div className="relative h-10 flex items-center">
                <div className="absolute left-[-15px] size-10 bg-primary rounded-full"></div>
                <div className="absolute right-[-15px] size-10 bg-primary rounded-full"></div>
                <div className="w-full h-[1.5px] border-t-2 border-dashed border-slate-100 mx-8 opacity-50"></div>
            </div>

            <div className="p-8 flex flex-col items-center space-y-6">
                <div className="size-52 bg-slate-50 rounded-[40px] border border-slate-100 p-6 flex items-center justify-center relative shadow-inner">
                    <div className="size-full bg-white rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-[100px] text-slate-900 opacity-90">qr_code_2</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Бронь №</p>
                    <p className="font-mono text-sm font-black text-slate-900">{booking.id.toUpperCase()}</p>
                </div>
            </div>
        </div>

        <button 
            onClick={onBack}
            className="mt-8 w-full py-4 rounded-2xl bg-white/20 text-white font-extrabold text-xs uppercase tracking-widest btn-press"
        >
            Вернуться назад
        </button>
    </div>
  );
};

export default TicketView;
