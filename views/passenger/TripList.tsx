
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
  const [step, setStep] = useState<'list' | 'info'>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [fullName, setFullName] = useState(initialUserData?.fullName || '');
  const [phone, setPhone] = useState(initialUserData?.phoneNumber || '+7 9');

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith('+7 9')) val = '+7 9';
    const rest = val.slice(4).replace(/\D/g, '').slice(0, 9);
    setPhone('+7 9' + rest);
  };

  const handleConfirmBooking = () => {
    if (fullName.trim().length < 3 || phone.length < 13 || !selectedTrip) {
      alert("Пожалуйста, заполните все данные корректно.");
      return;
    }
    onBook(selectedTrip.id, { fullName, phoneNumber: phone });
  };

  return (
    <div className="flex-1 pb-24 bg-bg-soft flex flex-col h-full animate-slide-in">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-primary p-2 btn-press">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg">Доступные рейсы</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-4 overflow-y-auto no-scrollbar">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <span className="material-symbols-outlined text-6xl">directions_bus</span>
            <p className="mt-4 font-bold">Рейсов на эту дату не найдено</p>
            <button onClick={onBack} className="mt-4 text-primary font-bold text-sm underline">Выбрать другую дату</button>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">airport_shuttle</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">{trip.busModel.split(' ')[0] || 'Mercedes'}</p>
                    <div className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-success"></span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Мест: {trip.availableSeats}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{trip.price} ₽</p>
                </div>
              </div>

              <div className="flex gap-4 items-center px-2 py-4 bg-slate-50/50 rounded-3xl">
                <div className="flex-1 text-center">
                  <p className="text-xl font-black leading-none">{trip.departureTime}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Назрань</p>
                </div>
                <div className="flex-1 flex flex-col items-center relative h-4">
                     <div className="w-full h-[2px] bg-slate-200"></div>
                     <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 text-sm bg-slate-50">chevron_right</span>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xl font-black leading-none">{trip.arrivalTime}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Москва</p>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedTrip(trip); setStep('info'); }}
                className="w-full bg-secondary py-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-widest btn-press"
              >
                Забронировать
              </button>
            </div>
          ))
        )}
      </main>

      {/* Модалка оформления */}
      {step === 'info' && selectedTrip && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-[40px] p-8 space-y-6 shadow-2xl animate-slide-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Данные пассажира</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Бронирование на {selectedTrip.departureTime}</p>
              </div>
              <button onClick={() => setStep('list')} className="size-10 rounded-full bg-slate-50 flex items-center justify-center btn-press">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ваше ФИО</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Фамилия Имя Отчество"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-primary/20 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Контактный телефон</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-primary/20 focus:bg-white"
                />
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <p className="text-[10px] font-bold uppercase">Свободная рассадка</p>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 leading-tight">Занимайте любое свободное место при посадке в автобус.</p>
              </div>
              
              <button 
                onClick={handleConfirmBooking}
                className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 btn-press uppercase tracking-widest text-xs"
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
