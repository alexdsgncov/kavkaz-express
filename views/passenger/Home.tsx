
import React, { useState } from 'react';
import { User } from '../../types';

interface PassengerHomeProps {
  user: User;
  onSearch: (date: string) => void;
  onNavigateBookings: () => void;
  onAdminClick: () => void;
}

const PassengerHome: React.FC<PassengerHomeProps> = ({ user, onSearch, onNavigateBookings, onAdminClick }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="flex-1 flex flex-col bg-bg-soft safe-top overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div onClick={onAdminClick} className="size-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary btn-press cursor-pointer">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Ваш профиль</p>
            <h2 className="text-sm font-bold text-slate-900">{user.fullName || 'Гость'}</h2>
          </div>
        </div>
        <button 
          onClick={onNavigateBookings}
          className="size-12 rounded-2xl glass flex items-center justify-center text-slate-900 shadow-sm btn-press"
        >
          <span className="material-symbols-outlined">confirmation_number</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-6 py-6">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
          Куда отправимся <br/><span className="text-primary">сегодня?</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">Безопасные рейсы Ингушетия — Москва</p>
      </div>

      {/* Booking Card */}
      <div className="mx-6 p-6 bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-8 animate-slide-in">
        <div className="flex items-center justify-between relative">
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Откуда</p>
                <p className="text-xl font-extrabold">Назрань</p>
            </div>
            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 z-10">
                <span className="material-symbols-outlined text-xl">swap_horiz</span>
            </div>
            <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Куда</p>
                <p className="text-xl font-extrabold">Москва</p>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-100 -translate-y-1/2"></div>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Дата выезда</label>
                <div className="relative">
                    <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none border border-slate-100 focus:border-primary/40 focus:bg-white transition-all appearance-none"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">calendar_today</span>
                </div>
            </div>

            <button 
                onClick={() => onSearch(date)}
                className="w-full group relative overflow-hidden bg-primary py-5 rounded-2xl text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-primary/25 btn-press"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Найти билеты
                    <span className="material-symbols-outlined text-lg">search</span>
                </span>
            </button>
        </div>
      </div>

      {/* Info Sections */}
      <div className="mt-10 px-6 space-y-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Преимущества</p>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            <div className="min-w-[140px] p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">verified</span>
                </div>
                <p className="text-[11px] font-bold leading-tight">Проверенные водители</p>
            </div>
            <div className="min-w-[140px] p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined">airline_seat_recline_extra</span>
                </div>
                <p className="text-[11px] font-bold leading-tight">Комфортные автобусы</p>
            </div>
            <div className="min-w-[140px] p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-success">
                    <span className="material-symbols-outlined">payments</span>
                </div>
                <p className="text-[11px] font-bold leading-tight">Оплата при посадке</p>
            </div>
        </div>
      </div>

      <div className="mt-4 mx-6 p-6 bg-secondary rounded-4xl text-white relative overflow-hidden group btn-press mb-10 cursor-pointer">
          <div className="relative z-10">
              <h4 className="font-extrabold text-lg mb-1">Бизнес-класс</h4>
              <p className="text-xs text-white/70 font-medium mb-4">VIP Спринтеры с Wi-Fi, розетками и климат-контролем.</p>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Подробнее
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>
          </div>
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">airport_shuttle</span>
      </div>
    </div>
  );
};

export default PassengerHome;
