
import React from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onBack, onMarkAsRead, onClearAll }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BOOKING_APPROVED: return 'check_circle';
      case NotificationType.BOOKING_REJECTED: return 'cancel';
      case NotificationType.BOOKING_REQUEST: return 'person_add';
      case NotificationType.TRIP_UPDATED: return 'edit_calendar';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BOOKING_APPROVED: return 'text-success bg-success/10';
      case NotificationType.BOOKING_REJECTED: return 'text-danger bg-danger/10';
      case NotificationType.BOOKING_REQUEST: return 'text-primary bg-primary/10';
      case NotificationType.TRIP_UPDATED: return 'text-warning bg-warning/10';
      default: return 'text-slate-400 bg-slate-100';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-primary flex items-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-bold text-lg">Уведомления</h2>
        <button onClick={onClearAll} className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Очистить
        </button>
      </header>

      <main className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <span className="material-symbols-outlined text-6xl">notifications_off</span>
            <p className="mt-4 font-bold text-sm">Уведомлений нет</p>
          </div>
        ) : (
          notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notif => (
            <div 
              key={notif.id}
              onClick={() => onMarkAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.isRead ? 'bg-white border-slate-100 opacity-80' : 'bg-white border-primary/20 shadow-md shadow-primary/5'
              }`}
            >
              <div className="flex gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getIconColor(notif.type)}`}>
                  <span className="material-symbols-outlined text-xl">{getIcon(notif.type)}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold leading-none">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatTime(notif.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <div className="size-2 rounded-full bg-primary mt-1"></div>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Notifications;
