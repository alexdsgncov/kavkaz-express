
import React, { useState } from 'react';
import { Trip } from '../../types';

interface PassengerTripListProps {
  trips: Trip[];
  onBook: (tripId: string, info: { fullName: string, phoneNumber: string }) => void;
  onBack: () => void;
  selectedDate: string;
  initialUserData?: { fullName: string, phoneNumber: string };
}

const PassengerTripList: React.FC<PassengerTripListProps> = ({ trips, onBook, onBack, selectedDate, initialUserData }) => {
  const [bookingTripId, setBookingTripId] = useState<string | null>(null);
  const [fullName, setFullName] = useState(initialUserData?.fullName || '');
  const [phone, setPhone] = useState(initialUserData?.phoneNumber || '+7 9');

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith('+7 9')) val = '+7 9';
    const rest = val.slice(4).replace(/\D/g, '').slice(0, 9);
    setPhone('+7 9' + rest);
  };

  const handleConfirmBooking = () => {
    if (fullName.trim().length < 3 || phone.length < 13) {
      alert("Пожалуйста, заполните корректно ФИО и Телефон.");
      return;
    }
    if (bookingTripId) {
      onBook(bookingTripId, { fullName, phoneNumber: phone });
      setBookingTripId(null);
    }
  };

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
            <div key={trip.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
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
                <div className="flex-[2] flex flex-col items-center px-4">
                  <div className="w-full h-[1px] bg-slate-200 dashed relative">
                     <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <span className="material-symbols-outlined text-slate-300 text-sm">trending_flat</span>
                     </span>
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-lg font-black leading-none">{trip.arrivalTime}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Москва</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Свободно</p>
                  <p className="text-sm font-black text-slate-700">{trip.availableSeats} мест</p>
                </div>
                <button 
                  onClick={() => setBookingTripId(trip.id)}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Забронировать
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Модалка оформления */}
      {bookingTripId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">Данные для поездки</h3>
              <button onClick={() => setBookingTripId(null)} className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ваше ФИО</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Телефон</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Эти данные увидит только водитель для подтверждения брони.</p>
              
              <button 
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                Подтвердить бронь
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerTripList;
