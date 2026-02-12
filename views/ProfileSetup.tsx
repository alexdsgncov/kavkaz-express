
import React, { useState } from 'react';

interface ProfileSetupProps {
  onSave: (firstName: string, lastName: string, middleName: string) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const isValid = firstName.trim().length > 1 && lastName.trim().length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSave(firstName.trim(), lastName.trim(), middleName.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto px-6 pt-20">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Ваш профиль</h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Пожалуйста, укажите ваши настоящие данные, чтобы водитель мог вас идентифицировать.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Фамилия</label>
            <input 
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Иванов"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Имя</label>
            <input 
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Иван"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Отчество (если есть)</label>
            <input 
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Иванович"
            />
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={!isValid}
              className="w-full bg-primary py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
            >
              Завершить регистрацию
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
