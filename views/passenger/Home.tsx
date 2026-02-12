
import React from 'react';
import { User } from '../../types';

interface PassengerHomeProps {
  user: User;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onSearch: (date: string) => void;
  onNavigateBookings: () => void;
  travelInfo?: {text: string, links: any[]} | null;
  isLoadingInfo?: boolean;
}

const PassengerHome: React.FC<PassengerHomeProps> = ({ 
  user, 
  unreadNotifications, 
  onOpenNotifications, 
  onSearch, 
  onNavigateBookings,
  travelInfo,
  isLoadingInfo
}) => {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="flex-1 px-6 pt-12 pb-24 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
             <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="Avatar" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">С возвращением</p>
            <h1 className="text-lg font-bold">{user.firstName || 'Куда отправимся?'}</h1>
          </div>
        </div>
        <button 
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 size-4 bg-red-500 rounded-full border-2 border-bg-light text-[8px] flex items-center justify-center text-white font-black animate-pulse">
              {unreadNotifications}
            </span>
          )}
        </button>
      </header>

      {/* Поиск рейса */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Откуда</span>
              <span className="text-xl font-bold">Назрань</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
              <div className="bg-primary text-white p-2 rounded-full shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">swap_horiz</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Куда</span>
              <span className="text-xl font-bold">Москва</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm icon-filled">calendar_today</span>
            Дата выезда
          </label>
          <input 
            type="date" 
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button 
          onClick={() => onSearch(date)}
          className="w-full bg-primary py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          Найти рейсы
          <span className="material-symbols-outlined">trending_flat</span>
        </button>
      </div>

      {/* Блок актуальной информации о дороге (Gemini Grounding) */}
      <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="bg-slate-900 p-3 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm">info</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Дорожная обстановка</span>
          </div>
          {isLoadingInfo && <div className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
        </div>
        <div className="p-4 bg-white">
          {isLoadingInfo ? (
            <div className="space-y-2">
              <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-3 w-full bg-slate-100 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {travelInfo?.text || "Загружаем информацию о трассе и погоде..."}
              </p>
              {travelInfo?.links && travelInfo.links.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Источники:</span>
                  {travelInfo.links.map((chunk: any, i: number) => (
                    chunk.web && (
                      <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-[9px] text-primary font-bold underline truncate max-w-[120px]">
                        {chunk.web.title || "Подробнее"}
                      </a>
                    )
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="bg-primary/5 rounded-2xl p-5 border border-primary/10 flex items-start gap-4">
        <div className="bg-primary text-white p-2 rounded-lg">
          <span className="material-symbols-outlined">info</span>
        </div>
        <div>
          <h4 className="font-bold text-primary text-sm">Важные советы</h4>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Приходите к месту сбора за 15 минут. Оплату производите водителю при посадке. Хорошего пути!
          </p>
        </div>
      </section>
    </div>
  );
};

export default PassengerHome;
