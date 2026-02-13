
import React from 'react';
import { Trip, Booking, BookingStatus, StatusLabels, User } from '../../types';

interface ManageRequestsProps {
  trip: Trip;
  bookings: Booking[];
  allUsers: User[];
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  onBack: () => void;
}

const RussianPlate: React.FC<{ plate: string }> = ({ plate }) => {
  const p = plate.toUpperCase();
  const main = p.slice(0, 6);
  const region = p.slice(6);
  return (
    <div className="inline-flex items-center bg-white border-[1px] border-slate-900 rounded-[2px] px-0.5 h-4 font-mono font-bold text-slate-900 text-[8px] leading-none shrink-0">
      <div className="px-1 border-r-[1px] border-slate-900 h-full flex items-center gap-0.5">
        <span>{main.slice(0,1)}</span>
        <span>{main.slice(1,4)}</span>
        <span>{main.slice(4,6)}</span>
      </div>
      <div className="flex flex-col items-center justify-center px-1 min-w-[12px]">
        <span>{region}</span>
        <div className="flex items-center gap-[0.5px] mt-[-1px]">
          <span className="text-[3px]">RUS</span>
          <div className="w-1 h-0.5 border-[0.1px] border-slate-300 flex flex-col">
            <div className="bg-white h-1/3"></div>
            <div className="bg-blue-600 h-1/3"></div>
            <div className="bg-red-600 h-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageRequests: React.FC<ManageRequestsProps> = ({ trip, bookings, allUsers, onUpdateStatus, onBack }) => {
  const approvedCount = bookings.filter(b => b.status === BookingStatus.APPROVED).length;
  const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;

  return (
    <div className="flex-1 bg-bg-light pb-24">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="text-primary flex items-center">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="font-bold text-lg">Заявки пассажиров</h2>
          <div className="w-8"></div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">directions_bus</span>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                 {new Date(trip.date).toLocaleDateString('ru-RU')}
              </p>
              <RussianPlate plate={trip.busPlate} />
            </div>
            <p className="text-xs font-bold text-right">Занято {approvedCount}/{trip.totalSeats}<br/><span className="text-primary">{pendingCount} ожидает</span></p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 text-center">
            <span className="material-symbols-outlined text-6xl">person_search</span>
            <p className="mt-4 font-bold">Заявок пока нет.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {bookings.map(booking => {
               // Fix: Use data directly from the booking object instead of relying on allUsers lookup
               return (
                 <div key={booking.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-50 overflow-hidden text-slate-400">
                          {/* Use an icon if no avatar is present, or simple fallback */}
                          <span className="material-symbols-outlined text-2xl">account_circle</span>
                       </div>
                       <div>
                         <p className="font-bold text-sm leading-none">
                            {booking.passengerName}
                         </p>
                         <a href={`tel:${booking.passengerPhone}`} className="text-[11px] text-primary font-bold mt-1 block">
                            {booking.passengerPhone}
                         </a>
                       </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        booking.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-700' :
                        booking.status === BookingStatus.REJECTED ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {StatusLabels[booking.status]}
                      </span>
                   </div>

                   {booking.status === BookingStatus.PENDING && (
                     <div className="flex gap-2 pt-2">
                       <button onClick={() => onUpdateStatus(booking.id, BookingStatus.REJECTED)} className="flex-1 py-2.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase border border-slate-100">Отклонить</button>
                       <button onClick={() => onUpdateStatus(booking.id, BookingStatus.APPROVED)} className="flex-1 py-2.5 bg-success text-white rounded-xl font-bold text-[10px] uppercase shadow-lg transition-all active:scale-95">Принять</button>
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageRequests;
