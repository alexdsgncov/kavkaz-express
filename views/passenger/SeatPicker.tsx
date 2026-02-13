
import React from 'react';

interface SeatPickerProps {
  totalSeats: number;
  occupiedSeats: number[];
  selectedSeat: number | null;
  onSelect: (seat: number) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const SeatPicker: React.FC<SeatPickerProps> = ({ totalSeats, occupiedSeats, selectedSeat, onSelect, onBack, onConfirm }) => {
  // Генерация схемы для Mercedes Sprinter (типовая 18 мест)
  // 1-2 |   | 
  // 3-4 |   | 5
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  return (
    <div className="flex-1 bg-white flex flex-col safe-top animate-slide-in">
      <header className="p-4 flex items-center justify-between border-b border-slate-50">
        <button onClick={onBack} className="size-10 rounded-full bg-slate-50 flex items-center justify-center btn-press text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-extrabold text-lg">Выбор места</h2>
        <div className="size-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="flex justify-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-white border border-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Свободно</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Занято</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-primary"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Выбрано</span>
          </div>
        </div>

        {/* Схема автобуса */}
        <div className="max-w-[240px] mx-auto bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 relative">
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-200 rounded-full text-[8px] font-black uppercase text-slate-500 tracking-widest">Лобовое стекло</div>
          
          <div className="grid grid-cols-4 gap-4">
            {/* Водительское место */}
            <div className="col-span-1 size-10 flex items-center justify-center text-slate-200">
                <span className="material-symbols-outlined text-3xl">airline_seat_recline_normal</span>
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-1 size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-xl">person</span>
            </div>

            {/* Пассажирские места */}
            {seats.map(num => {
              const isOccupied = occupiedSeats.includes(num);
              const isSelected = selectedSeat === num;
              
              return (
                <button
                  key={num}
                  disabled={isOccupied}
                  onClick={() => onSelect(num)}
                  className={`
                    size-10 rounded-xl flex items-center justify-center text-xs font-black transition-all btn-press
                    ${isOccupied ? 'bg-slate-200 text-slate-400 grayscale' : 
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 
                      'bg-white border-2 border-slate-100 text-slate-400 hover:border-primary/30'}
                  `}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-100 safe-bottom">
        <button
          onClick={onConfirm}
          disabled={!selectedSeat}
          className="w-full bg-secondary py-5 rounded-2xl text-white font-extrabold text-sm uppercase tracking-widest shadow-xl disabled:bg-slate-200 btn-press"
        >
          {selectedSeat ? `Выбрать место ${selectedSeat}` : 'Выберите место'}
        </button>
      </div>
    </div>
  );
};

export default SeatPicker;
