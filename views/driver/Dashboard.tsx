
import React from 'react';
import { User, Trip, Booking, TripStatus, TripStatusLabels } from '../../types';

interface DriverDashboardProps {
  user: User;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  trips: Trip[];
  bookings: Booking[];
  onCreateTrip: () => void;
  onManageTrip: (trip: Trip) => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onLogout?: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, trips, bookings, onCreateTrip, onEditTrip, onDeleteTrip, onManageTrip, onLogout }) => {
  // Вычисляем статистику
  const activeTripsCount = trips.filter(t => t.status !== TripStatus.ARRIVED && t.status !== TripStatus.CANCELLED).length;
  const totalConfirmedPassengers = bookings.filter(b => b.status === 'approved').length;
  const totalRevenue = trips
    .filter(t => t.status === TripStatus.ARRIVED)
    .reduce((sum, t) => {
        const tripConfirmed = bookings.filter(b => b.tripId === t.id && b.status === 'approved').length;
        return sum + (tripConfirmed * t.price);
    }, 0);

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
        case TripStatus.BOARDING: return 'bg-accent text-white';
        case TripStatus.EN_ROUTE: return 'bg-success text-white';
        case TripStatus.ARRIVED: return 'bg-slate-200 text-slate-500';
        case TripStatus.CANCELLED: return 'bg-danger text-white';
        default: return 'bg-blue-50 text-primary';
    }
  };

  return (
    <div className="flex-1 bg-bg-soft flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-none">Кабинет водителя</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.fullName}</p>
        </div>
        <button onClick={onLogout} className="size-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center btn-press">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-24">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary p-4 rounded-3xl text-white shadow-lg shadow-primary/20">
                <p className="text-[9px] font-bold uppercase opacity-70">Активных рейсов</p>
                <p className="text-2xl font-black mt-1">{activeTripsCount}</p>
            </div>
            <div className="bg-secondary p-4 rounded-3xl text-white shadow-lg shadow-secondary/20">
                <p className="text-[9px] font-bold uppercase opacity-70">Пассажиров</p>
                <p className="text-2xl font-black mt-1">{totalConfirmedPassengers}</p>
            </div>
            <div className="col-span-2 bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Прибыль (завершенные)</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalRevenue} ₽</p>
                </div>
                <div className="size-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                </div>
            </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Список рейсов</h3>
            <button onClick={onCreateTrip} className="text-primary font-bold text-xs flex items-center gap-1 btn-press">
                <span className="material-symbols-outlined text-sm">add</span>
                Создать
            </button>
        </div>

        {/* Trip Cards */}
        <div className="space-y-4">
            {trips.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-[40px] border border-dashed border-slate-200 text-slate-300">
                    <span className="material-symbols-outlined text-5xl">directions_bus</span>
                    <p className="font-bold mt-2 text-sm">Нет созданных рейсов</p>
                </div>
            ) : (
                trips.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(trip => {
                    const tripBookings = bookings.filter(b => b.tripId === trip.id);
                    const pendingCount = tripBookings.filter(b => b.status === 'pending').length;
                    const approvedCount = tripBookings.filter(b => b.status === 'approved').length;
                    const fillPercent = (approvedCount / trip.totalSeats) * 100;

                    return (
                        <div key={trip.id} className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm space-y-5 animate-slide-in">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                                        <span className="text-[8px] font-bold uppercase leading-none">{new Date(trip.date).toLocaleDateString('ru', {month: 'short'})}</span>
                                        <span className="text-lg font-black leading-none mt-1">{new Date(trip.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-slate-900">Москва</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${getStatusColor(trip.status)}`}>
                                                {TripStatusLabels[trip.status] || 'Статус'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{trip.busPlate} • {trip.departureTime}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-primary">{trip.price} ₽</p>
                                    {pendingCount > 0 && (
                                        <div className="inline-flex items-center gap-1 bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-[8px] font-bold mt-1 animate-pulse">
                                            <span className="size-1 rounded-full bg-red-500"></span>
                                            {pendingCount} заявок
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                    <span>Заполнено {approvedCount}/{trip.totalSeats}</span>
                                    <span>{Math.round(fillPercent)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{width: `${fillPercent}%`}}></div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onManageTrip(trip)}
                                    className="flex-[2] py-3.5 bg-secondary text-white font-black rounded-2xl text-[10px] uppercase btn-press flex items-center justify-center gap-2"
                                >
                                    Управление пассажирами
                                </button>
                                <button 
                                    onClick={() => onEditTrip(trip)}
                                    className="size-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center btn-press"
                                >
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                                <button 
                                    onClick={() => onDeleteTrip(trip.id)}
                                    className="size-12 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center btn-press"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </main>

      {/* Floating Plus Button */}
      <button 
        onClick={onCreateTrip}
        className="fixed bottom-8 right-8 size-16 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-center btn-press z-50"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default DriverDashboard;
