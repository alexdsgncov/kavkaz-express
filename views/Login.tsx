
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (email: string, phone: string) => void;
  allUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+7 9');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+7 9')) value = '+7 9';
    const rest = value.slice(4).replace(/\D/g, '').slice(0, 9);
    setPhone('+7 9' + rest);
  };

  const canContinue = email.includes('@') && phone.length === 13;

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto items-center px-6 pt-20">
      <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
        <span className="material-symbols-outlined text-5xl icon-filled">local_shipping</span>
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">Kavkaz Express</h1>
      <p className="text-slate-500 text-center mb-10">Введите данные для быстрого входа</p>

      <div className="w-full space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
          <input 
            type="email" 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20" 
            placeholder="mail@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
          <input 
            type="tel" 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20" 
            value={phone} 
            onChange={handlePhoneChange} 
          />
        </div>
        <button 
          onClick={() => onLogin(email, phone)} 
          disabled={!canContinue}
          className="w-full py-4 bg-primary disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          Войти
        </button>
      </div>
      
      <p className="mt-auto mb-10 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Работает автономно (Россия)</p>
    </div>
  );
};

export default Login;
