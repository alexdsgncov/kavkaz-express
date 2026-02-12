
import React, { useState } from 'react';
import { Booking, Trip, BookingStatus, StatusLabels } from '../../types';

interface MyBookingsProps {
  bookings: Booking[];
  trips: Trip[];
  onBack: () => void;
  onCancelBooking: (id: string) => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ bookings, trips, onBack, onCancelBooking }) => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const getTripForBooking = (tripId: string) => trips.find(t => t.id === tripId);

  const filteredBookings = bookings.filter(booking => {
    const trip = getTripForBooking(booking.tripId);
    if (!trip) return false;
    const tripDate = new Date(trip.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tab === 'upcoming') {
      return tripDate >= today;
    } else {
      return tripDate < today;
    }
  });

  return (
    <div className="flex-1 pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-primary flex items-center">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="font-bold text-lg">Мои бронирования</h2>
          <div className="w-8"></div>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button 
            onClick={() => setTab('upcoming')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'upcoming' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Предстоящие
          </button>
          <button 
            onClick={() => setTab('past')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'past' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Прошлые
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <span className="material-symbols-outlined text-6xl">confirmation_number</span>
            <p className="mt-4 font-bold">Бронирований пока нет.</p>
          </div>
        ) : (
          filteredBookings.map(booking => {
            const trip = getTripForBooking(booking.tripId);
            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-lg">directions_bus</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {trip?.type === 'Standard' ? 'Стандарт' : trip?.type} Express
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      booking.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-700' :
                      booking.status === BookingStatus.REJECTED ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {StatusLabels[booking.status]}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 py-1">
                      <div className="size-2 rounded-full bg-primary"></div>
                      <div className="w-[1px] flex-1 bg-slate-100"></div>
                      <div className="size-2 rounded-full border-2 border-primary"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">{trip?.from || 'Назрань'}</span>
                        <span className="text-xs text-slate-400 font-medium">Выезд {trip?.departureTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">{trip?.to || 'Москва'}</span>
                        <span className="text-xs text-slate-400 font-medium">Прибытие {trip?.arrivalTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">Дата</p>
                      <p className="text-xs font-bold">{trip ? new Date(trip.date).toLocaleDateString('ru-RU') : ''}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="text-primary font-bold text-xs flex items-center active:scale-95 transition-transform"
                    >
                      Детали
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Модальное окно деталей */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-t-[32px] p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Детали поездки</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {(() => {
              const trip = getTripForBooking(selectedBooking.tripId);
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Маршрут</p>
                      <p className="font-bold text-sm">{trip?.from} — {trip?.to}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Статус</p>
                      <p className={`font-bold text-sm ${
                        selectedBooking.status === BookingStatus.APPROVED ? 'text-green-600' :
                        selectedBooking.status === BookingStatus.REJECTED ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {StatusLabels[selectedBooking.status]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center py-1">
                        <div className="size-2 rounded-full bg-primary"></div>
                        <div className="w-[1px] h-8 bg-slate-200"></div>
                        <div className="size-2 rounded-full border-2 border-primary"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Отправление ({trip?.departureTime})</p>
                          <p className="text-sm font-medium">{trip?.departureAddress}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Прибытие ({trip?.arrivalTime})</p>
                          <p className="text-sm font-medium">{trip?.arrivalAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Стоимость</span>
                        <span className="font-black text-lg">{trip?.price} ₽</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Автобус</span>
                        <span className="font-bold text-sm uppercase">{trip?.busPlate}</span>
                     </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    {tab === 'upcoming' && (
                      <button 
                        onClick={() => {
                          onCancelBooking(selectedBooking.id);
                          setSelectedBooking(null);
                        }}
                        className="w-full py-4 border-2 border-red-500 text-red-500 font-bold rounded-2xl active:scale-95 transition-transform"
                      >
                        Отменить бронирование
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
