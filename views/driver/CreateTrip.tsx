
import React, { useState, useRef } from 'react';
import { Trip, TripStatus } from '../../types';

interface CreateTripProps {
  driverId: string;
  initialTrip?: Trip | null;
  onSave: (trip: Partial<Trip>) => void;
  onCancel: () => void;
}

const CreateTrip: React.FC<CreateTripProps> = ({ driverId, initialTrip, onSave, onCancel }) => {
  const [date, setDate] = useState(initialTrip?.date || new Date().toISOString().split('T')[0]);
  const [price, setPrice] = useState(initialTrip?.price.toString() || '4500');
  const [seats, setSeats] = useState(initialTrip?.totalSeats.toString() || '18');
  const [type, setType] = useState(initialTrip?.type || 'Standard');
  const [busModel, setBusModel] = useState(initialTrip?.busModel || 'Mercedes Sprinter');
  const [depAddress, setDepAddress] = useState(initialTrip?.departureAddress || 'Автовокзал Назрань');
  const [arrAddress, setArrAddress] = useState(initialTrip?.arrivalAddress || 'м. Щелковская, Москва');
  const [depTime, setDepTime] = useState(initialTrip?.departureTime || '08:00');
  const [arrTime, setArrTime] = useState(initialTrip?.arrivalTime || '02:30');
  const [busPlate, setBusPlate] = useState(initialTrip?.busPlate || 'х777хх06');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const allowedLetters = 'авекмнорстухАВЕКМНОРСТУХabekmhopctyxABEKMHOPCTYX';
  
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toLowerCase();
    val = val.split('').filter(char => /[0-9]/.test(char) || allowedLetters.includes(char)).join('');
    if (val.length > 9) val = val.slice(0, 9);
    setBusPlate(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busPlate.length < 6) {
      alert("Введите корректный госномер");
      return;
    }
    onSave({
      driverId,
      date,
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
      busModel: busModel,
      type: type,
      status: initialTrip?.status || TripStatus.SCHEDULED
    });
  };

  const renderPlateInput = () => {
    const p = busPlate.toUpperCase();
    const part1 = p.slice(0, 1);
    const part2 = p.slice(1, 4);
    const part3 = p.slice(4, 6);
    const region = p.slice(6, 9);
    
    return (
      <div onClick={() => inputRef.current?.focus()} className="relative flex items-center justify-center py-4 cursor-pointer">
        <div className="flex items-center bg-white border-2 border-slate-900 rounded-[6px] h-16 shadow-[0_4px_0_0_#000000] active:translate-y-[1px] transition-all">
          <div className="flex items-center px-4 h-full border-r-2 border-slate-900 min-w-[180px] justify-between">
            <span className="text-3xl font-mono font-bold w-8 text-center">{part1 || 'X'}</span>
            <span className="text-4xl font-mono font-black tracking-tight">{part2.padEnd(3, '0')}</span>
            <div className="flex gap-1">
              <span className="text-3xl font-mono font-bold w-7 text-center">{part3[0] || 'X'}</span>
              <span className="text-3xl font-mono font-bold w-7 text-center">{part3[1] || 'X'}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center px-3 min-w-[60px] h-full bg-slate-50/50">
            <span className="text-2xl font-mono font-black leading-none">{region || '06'}</span>
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
        <input ref={inputRef} type="text" value={busPlate} onChange={handlePlateChange} className="absolute inset-0 opacity-0" />
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-10">
      <header className="sticky top-0 bg-white z-10 p-4 border-b border-slate-100 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400 p-2"><span className="material-symbols-outlined">close</span></button>
        <h2 className="font-bold text-lg">{initialTrip ? 'Редактировать' : 'Новый рейс'}</h2>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Госномер</label>
            {renderPlateInput()}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Модель автобуса</label>
            <input type="text" required value={busModel} onChange={(e) => setBusModel(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Напр. Mercedes Sprinter VIP" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Дата выезда</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Время выезда</label>
              <input type="time" required value={depTime} onChange={(e) => setDepTime(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Время прибытия</label>
              <input type="time" required value={arrTime} onChange={(e) => setArrTime(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Цена (₽)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Всего мест</label>
              <input type="number" required value={seats} onChange={(e) => setSeats(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-success py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-success/20 btn-press">
          {initialTrip ? 'Сохранить изменения' : 'Создать рейс'}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
