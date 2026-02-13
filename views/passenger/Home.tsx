
import React, { useEffect, useState } from 'react';
import { User } from '../../types';

interface PassengerHomeProps {
  user: User;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onSearch: (date: string) => void;
  onNavigateBookings: () => void;
  onShare?: () => void;
}

const PassengerHome: React.FC<PassengerHomeProps> = ({ user, onSearch, onShare, onNavigateBookings }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    if (!tg) return;
    tg.MainButton.setText('НАЙТИ РЕЙСЫ');
    tg.MainButton.show();
    tg.MainButton.onClick(() => onSearch(date));
    return () => {
      tg.MainButton.hide();
      tg.MainButton.offClick(() => onSearch(date));
    };
  }, [tg, date, onSearch]);

  return (
    <div className="flex-1 px-6 pt-10 pb-10 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <h1 className="text-xl font-black">Привет, {user.firstName || 'друг'}!</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Куда едем сегодня?</p>
          </div>
        </div>
        <button 
          onClick={onNavigateBookings}
          className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">confirmation_number</span>
        </button>
      </header>

      <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-8">
        <div className="flex items-center justify-between relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Откуда</span>
            <span className="text-2xl font-black">Назрань</span>
          </div>
          <div className="size-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-xl">sync_alt</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Куда</span>
            <span className="text-2xl font-black">Москва</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase ml-1">Дата поездки</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-5 bg-slate-50 border-none rounded-2xl font-black text-lg text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[32px] p-6 text-white shadow-lg shadow-primary/30 relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-lg font-black leading-tight mb-2">Пригласите попутчиков</h3>
          <p className="text-xs text-white/80 font-bold mb-4">Вместе ехать веселее и надежнее. Отправьте ссылку друзьям!</p>
          <button 
            onClick={onShare}
            className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
          >
            Пригласить друзей
          </button>
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
          group_add
        </span>
      </div>

      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
        <div className="flex gap-4 items-center">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          <p className="text-xs font-bold text-slate-600 leading-tight">
            Все рейсы проверяются вручную. Оплата только при посадке водителю.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;
