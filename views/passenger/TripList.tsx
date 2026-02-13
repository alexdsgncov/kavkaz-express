
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

  const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } catch(e) {
        return "Дата не выбрана";
    }
  }

  return (
    <div className="flex-1 pb-24 bg-bg-soft flex flex-col h-full animate-slide-in">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-primary p-2 btn-press rounded-full hover:bg-slate-50">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg text-slate-900">Выбор рейса</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {formatDate(selectedDate)}
          </p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-4 overflow-y-auto no-scrollbar">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-24 rounded-[40px] bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                <span className="material-symbols-outlined text-5xl">event_busy</span>
            </div>
            <h3 className="font-black text-slate-900 text-lg">Рейсов не найдено</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-[200px]">К сожалению, на выбранную дату рейсов нет.</p>
            <button 
                onClick={onBack} 
                className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-primary font-bold text-sm btn-press shadow-sm"
            >
                Изменить дату
            </button>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm space-y-5 animate-slide-in">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">airport_shuttle</span>
                  </div>
                  <div>
                    {/* Исправлен потенциальный краш при отсутствии busModel */}
                    <p className="text-sm font-black text-slate-900 uppercase">
                        {(trip.busModel || 'Mercedes').split(' ')[0]}
                    </p>
                    <div className="flex items-center gap-1">
                        <span className={`size-1.5 rounded-full ${trip.availableSeats > 0 ? 'bg-success' : 'bg-danger'}`}></span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {trip.availableSeats > 0 ? `Мест: ${trip.availableSeats}` : 'Мест нет'}
                        </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{trip.price} ₽</p>
                </div>
              </div>

              <div className="flex gap-4 items-center px-2 py-4 bg-slate-50/50 rounded-3xl">
                <div className="flex-1 text-center">
                  <p className="text-xl font-black leading-none text-slate-900">{trip.departureTime}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Назрань</p>
                </div>
                <div className="flex-1 flex flex-col items-center relative h-4">
                     <div className="w-full h-[2px] bg-slate-200"></div>
                     <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 text-sm bg-slate-50 p-1">chevron_right</span>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xl font-black leading-none text-slate-900">{trip.arrivalTime}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Москва</p>
                </div>
              </div>

              <button 
                disabled={trip.availableSeats <= 0}
                onClick={() => { setSelectedTrip(trip); setStep('info'); }}
                className={`w-full py-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-widest btn-press shadow-lg transition-all ${
                    trip.availableSeats > 0 ? 'bg-secondary shadow-secondary/20' : 'bg-slate-300 shadow-none grayscale cursor-not-allowed'
                }`}
              >
                {trip.availableSeats > 0 ? 'Забронировать' : 'Мест нет'}
              </button>
            </div>
          ))
        )}
      </main>

      {/* Модалка оформления */}
      {step === 'info' && selectedTrip && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 shadow-2xl animate-slide-in mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">Бронирование</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {selectedTrip.from} → {selectedTrip.to}
                </p>
              </div>
              <button onClick={() => setStep('list')} className="size-10 rounded-full bg-slate-50 flex items-center justify-center btn-press hover:bg-slate-100">
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
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-primary/20 focus:bg-white transition-all text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон для связи</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-primary/20 focus:bg-white transition-all text-slate-900"
                />
              </div>
              
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">info</span>
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-primary uppercase">Свободная рассадка</p>
                    <p className="text-[9px] text-primary/60 mt-0.5 leading-tight">Вы сможете выбрать любое свободное место в салоне при посадке.</p>
                </div>
              </div>
              
              <button 
                onClick={handleConfirmBooking}
                className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 btn-press uppercase tracking-widest text-xs mt-2"
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
