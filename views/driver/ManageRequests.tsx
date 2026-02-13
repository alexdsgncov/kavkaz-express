
import React, { useState } from 'react';
import { Trip, Booking, BookingStatus, StatusLabels, User, TripStatus, TripStatusLabels } from '../../types';

interface ManageRequestsProps {
  trip: Trip;
  bookings: Booking[];
  allUsers: User[];
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  onUpdateTripStatus: (tripId: string, status: TripStatus) => void;
  onBack: () => void;
}

const RussianPlate: React.FC<{ plate: string }> = ({ plate }) => {
  const p = plate.toUpperCase();
  const main = p.slice(0, 6);
  const region = p.slice(6);
  return (
    <div className="inline-flex items-center bg-white border-[1px] border-slate-900 rounded-[2px] px-1 h-5 font-mono font-bold text-slate-900 text-[9px] leading-none shrink-0 shadow-sm">
      <div className="px-1 border-r-[1px] border-slate-900 h-full flex items-center gap-1">
        <span>{main.slice(0,1)}</span>
        <span className="text-[11px]">{main.slice(1,4)}</span>
        <span>{main.slice(4,6)}</span>
      </div>
      <div className="flex flex-col items-center justify-center px-1 min-w-[14px]">
        <span>{region}</span>
        <div className="flex items-center gap-[0.5px] mt-[-1px]">
          <span className="text-[3.5px]">RUS</span>
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

const ManageRequests: React.FC<ManageRequestsProps> = ({ trip, bookings, onUpdateStatus, onUpdateTripStatus, onBack }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  
  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const approvedCount = bookings.filter(b => b.status === BookingStatus.APPROVED).length;

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="flex-1 bg-bg-soft flex flex-col h-full overflow-hidden">
      <header className="sticky top-0 bg-white z-40 border-b border-slate-100 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="size-10 rounded-full bg-slate-50 flex items-center justify-center btn-press">
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
          </button>
          <div className="text-center">
             <h2 className="font-black text-lg text-slate-900">Список пассажиров</h2>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Рейс на {trip.departureTime}</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Управление рейсом */}
        <div className="bg-slate-900 p-5 rounded-4xl text-white space-y-4 shadow-xl shadow-slate-900/20">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-[9px] font-bold uppercase opacity-50 mb-1">Текущий этап</p>
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-success animate-pulse"></span>
                        <h4 className="font-extrabold text-sm">{TripStatusLabels[trip.status]}</h4>
                    </div>
                </div>
                <RussianPlate plate={trip.busPlate} />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {trip.status === TripStatus.SCHEDULED && (
                    <button 
                        onClick={() => onUpdateTripStatus(trip.id, TripStatus.BOARDING)}
                        className="col-span-2 py-3 bg-primary text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-primary/20 btn-press"
                    >
                        Открыть посадку
                    </button>
                )}
                {trip.status === TripStatus.BOARDING && (
                    <button 
                        onClick={() => onUpdateTripStatus(trip.id, TripStatus.EN_ROUTE)}
                        className="col-span-2 py-3 bg-success text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-success/20 btn-press"
                    >
                        Рейс отправлен
                    </button>
                )}
                {trip.status === TripStatus.EN_ROUTE && (
                    <button 
                        onClick={() => onUpdateTripStatus(trip.id, TripStatus.ARRIVED)}
                        className="col-span-2 py-3 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase btn-press"
                    >
                        Завершить поездку
                    </button>
                )}
                {trip.status === TripStatus.ARRIVED && (
                    <div className="col-span-2 text-center text-white/50 text-[10px] font-bold uppercase py-2">Рейс успешно завершен</div>
                )}
            </div>
        </div>

        {/* Tabs Filter */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            <button onClick={() => setFilter('all')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${filter === 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>Все ({bookings.length})</button>
            <button onClick={() => setFilter('pending')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${filter === 'pending' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>Заявки ({bookings.filter(b=>b.status==='pending').length})</button>
            <button onClick={() => setFilter('approved')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${filter === 'approved' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>На борту ({approvedCount})</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        {filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-slate-300">
             <span className="material-symbols-outlined text-5xl">person_off</span>
             <p className="font-bold text-sm mt-2">Пассажиров не найдено</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 animate-slide-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-sm">{booking.passengerName}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{booking.passengerPhone}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                        booking.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-600' :
                        booking.status === BookingStatus.REJECTED ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                    }`}>
                        {StatusLabels[booking.status]}
                    </span>
                </div>

                <div className="flex gap-2">
                    <a 
                        href={`tel:${booking.passengerPhone}`}
                        className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center gap-2 btn-press"
                    >
                        <span className="material-symbols-outlined text-sm">call</span>
                        <span className="text-[9px] font-black uppercase">Позвонить</span>
                    </a>
                    <button 
                        onClick={() => handleWhatsApp(booking.passengerPhone)}
                        className="flex-1 py-2.5 bg-green-50 text-green-600 rounded-xl flex items-center justify-center gap-2 btn-press"
                    >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span className="text-[9px] font-black uppercase">WhatsApp</span>
                    </button>
                </div>

                {booking.status === BookingStatus.PENDING && (
                    <div className="flex gap-2 border-t border-slate-50 pt-4">
                        <button 
                            onClick={() => onUpdateStatus(booking.id, BookingStatus.REJECTED)}
                            className="flex-1 py-3 text-[9px] font-black uppercase text-red-400 btn-press"
                        >
                            Отказать
                        </button>
                        <button 
                            onClick={() => onUpdateStatus(booking.id, BookingStatus.APPROVED)}
                            className="flex-1 py-3 bg-success text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-success/20 btn-press"
                        >
                            Подтвердить
                        </button>
                    </div>
                )}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default ManageRequests;
