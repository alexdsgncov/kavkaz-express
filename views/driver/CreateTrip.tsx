
import React, { useState, useRef } from 'react';
import { Trip } from '../../types';

interface CreateTripProps {
  driverId: string;
  initialTrip?: Trip | null;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
}

const CreateTrip: React.FC<CreateTripProps> = ({ driverId, initialTrip, onSave, onCancel }) => {
  const [date, setDate] = useState(initialTrip?.date.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [price, setPrice] = useState(initialTrip?.price.toString() || '4500');
  const [seats, setSeats] = useState(initialTrip?.totalSeats.toString() || '18');
  const [type, setType] = useState(initialTrip?.type || 'Standard');
  const [depAddress, setDepAddress] = useState(initialTrip?.departureAddress || 'Автовокзал Назрань');
  const [arrAddress, setArrAddress] = useState(initialTrip?.arrivalAddress || 'м. Щелковская, Москва');
  const [depTime, setDepTime] = useState(initialTrip?.departureTime || '08:00');
  const [arrTime, setArrTime] = useState(initialTrip?.arrivalTime || '02:30');
  const [busPlate, setBusPlate] = useState(initialTrip?.busPlate || 'х777хх06');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Разрешенные буквы по ГОСТ (А, В, Е, К, М, Н, О, Р, С, Т, У, Х)
  const allowedLetters = 'авекмнорстухАВЕКМНОРСТУХabekmhopctyxABEKMHOPCTYX';
  
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toLowerCase();
    // Оставляем только разрешенные символы
    val = val.split('').filter(char => {
      return /[0-9]/.test(char) || allowedLetters.includes(char);
    }).join('');
    
    if (val.length > 9) val = val.slice(0, 9);
    setBusPlate(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busPlate.length < 8) {
      alert("Введите корректный госномер");
      return;
    }
    onSave({
      id: initialTrip?.id || 'trip_' + Math.random().toString(36).substr(2, 9),
      driverId,
      date: new Date(date).toISOString(),
      price: parseInt(price),
      totalSeats: parseInt(seats),
      availableSeats: initialTrip ? initialTrip.availableSeats : parseInt(seats),
      from: 'Ингушетия',
      to: 'Москва',
      departureAddress: depAddress,
      arrivalAddress: arrAddress,
      departureTime: depTime,
      arrivalTime: arrTime,
      busPlate: busPlate.toLowerCase(),
      type
    });
  };

  const focusInput = () => inputRef.current?.focus();

  // Визуализация ввода номера
  const renderPlateInput = () => {
    const p = busPlate.toUpperCase();
    const part1 = p.slice(0, 1);     // Буква
    const part2 = p.slice(1, 4);     // 3 Цифры
    const part3 = p.slice(4, 6);     // 2 Буквы
    const region = p.slice(6, 9);    // Регион (2-3 цифры)
    
    return (
      <div 
        onClick={focusInput}
        className="relative group cursor-text select-none flex items-center justify-center py-4"
      >
        {/* Основная табличка */}
        <div className="flex items-center bg-white border-2 border-slate-900 rounded-[6px] h-16 shadow-[0_4px_0_0_#000000] active:translate-y-[2px] active:shadow-[0_2px_0_0_#000000] transition-all overflow-hidden">
          {/* Левая часть (А 123 БВ) */}
          <div className="flex items-center px-4 h-full border-r-2 border-slate-900 min-w-[180px] justify-between">
            <span className={`text-3xl font-mono font-bold w-8 text-center ${!part1 ? 'text-slate-200' : 'text-slate-900'}`}>
              {part1 || 'X'}
            </span>
            <span className={`text-4xl font-mono font-black tracking-tight ${!part2 ? 'text-slate-200' : 'text-slate-900'}`}>
              {part2.padEnd(3, '0')}
            </span>
            <div className="flex gap-1">
              <span className={`text-3xl font-mono font-bold w-7 text-center ${!part3[0] ? 'text-slate-200' : 'text-slate-900'}`}>
                {part3[0] || 'X'}
              </span>
              <span className={`text-3xl font-mono font-bold w-7 text-center ${!part3[1] ? 'text-slate-200' : 'text-slate-900'}`}>
                {part3[1] || 'X'}
              </span>
            </div>
          </div>
          
          {/* Правая часть (Регион + RUS + Флаг) */}
          <div className="flex flex-col items-center justify-center px-3 min-w-[60px] h-full bg-slate-50/50">
            <span className={`text-2xl font-mono font-black leading-none ${!region ? 'text-slate-200' : 'text-slate-900'}`}>
              {region || '00'}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[8px] font-bold text-slate-900">RUS</span>
              <div className="flex flex-col w-3.5 h-2.5 border-[0.5px] border-slate-300">
                <div className="bg-white h-1/3"></div>
                <div className="bg-blue-600 h-1/3"></div>
                <div className="bg-red-600 h-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Скрытое реальное поле ввода */}
        <input 
          ref={inputRef}
          type="text"
          value={busPlate}
          onChange={handlePlateChange}
          className="absolute inset-0 opacity-0 cursor-default"
          autoFocus
        />
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar">
      <header className="sticky top-0 bg-white z-10 p-4 border-b border-slate-100 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-bold text-lg">{initialTrip ? 'Редактировать рейс' : 'Новый рейс'}</h2>
        <div className="w-8"></div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Госномер автобуса</label>
            {renderPlateInput()}
            <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Нажмите на номер, чтобы начать ввод</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Дата выезда</label>
            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Выезд</label>
              <input type="time" required value={depTime} onChange={(e) => setDepTime(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Прибытие</label>
              <input type="time" required value={arrTime} onChange={(e) => setArrTime(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Пункт отправления</label>
            <input type="text" required value={depAddress} onChange={(e) => setDepAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="г. Назрань, Автовокзал" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Пункт прибытия</label>
            <input type="text" required value={arrAddress} onChange={(e) => setArrAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="г. Москва, ст.м. Щелковская" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Цена за место (₽)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Кол-во мест</label>
              <input type="number" required value={seats} onChange={(e) => setSeats(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Класс поездки</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {id: 'Standard', label: 'Стандарт', icon: 'directions_bus'},
                {id: 'Comfort', label: 'Комфорт', icon: 'airline_seat_recline_extra'},
                {id: 'Sprinter', label: 'Спринтер', icon: 'airport_shuttle'}
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${
                    type === t.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{t.icon}</span>
                  <span className="text-[10px] font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 pb-10">
          <button type="submit" className="w-full bg-success py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-success/20 transition-all active:scale-[0.98]">
            {initialTrip ? 'Сохранить изменения' : 'Запустить рейс'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
