
import React from 'react';
import { UserRole } from '../types';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto px-6 pt-10 pb-10">
      <div className="flex flex-col items-center flex-1">
        <div className="w-full h-48 bg-center bg-no-repeat bg-contain mb-8" style={{backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAcBOhWtpVhdiGnoox35Q5t6Qgt-KpwQmPatb01kDqtolA5JgvAQiXeWJw58WwQ94vJxI5DdONFfmytd9XICpHZ5SCXRIsj9UfXECRngzfgCBq5xjHzvl5E5sz6gSwEqNB28juyRAIjc8uwOcEqF5oiit6FIOpcYK_6WPLvch7YZoGnoJRkLRO_W9Km6My9gabJnns_8O_e1_Dy8KJXoo7J-4JPLTOHGeQXI1Uvyhb57rrrdAr0W5lBZuJJQGqG7JPN6DUa6M_YGnC')`}}></div>
        <h1 className="text-3xl font-extrabold text-slate-900 text-center leading-tight">Путешествуйте с комфортом</h1>
        <p className="text-slate-500 text-center mt-3 max-w-[280px]">Самый простой способ бронирования поездок Ингушетия — Москва.</p>

        <div className="w-full mt-10 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Выберите вашу роль</p>
          
          <button 
            onClick={() => onSelectRole(UserRole.PASSENGER)}
            className="w-full flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border-2 border-transparent hover:border-primary transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">person</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Я Пассажир</p>
              <p className="text-slate-400 text-sm">Ищите и бронируйте рейсы легко</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">chevron_right</span>
          </button>

          <button 
            onClick={() => onSelectRole(UserRole.DRIVER)}
            className="w-full flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border-2 border-transparent hover:border-success transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined text-3xl">directions_bus</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Я Водитель</p>
              <p className="text-slate-400 text-sm">Управляйте рейсами и пассажирами</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-success">chevron_right</span>
          </button>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-slate-400 mt-6 px-4">
        Продолжая, вы соглашаетесь с <span className="underline">Условиями использования</span> и <span className="underline">Политикой конфиденциальности</span>
      </p>
    </div>
  );
};

export default RoleSelection;
