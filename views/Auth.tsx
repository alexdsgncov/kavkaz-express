
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { sendOTP } from '../lib/email';

enum AuthStep {
  EMAIL = 'email',
  VERIFY = 'verify',
  PROFILE = 'profile',
  PIN_LOGIN = 'pin_login'
}

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<AuthStep>(AuthStep.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+7 9');
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data } = await supabase.from('profiles').select('id').eq('email_link', email).maybeSingle();
    
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    
    const sent = await sendOTP(email, code);
    if (sent) {
      setIsNewUser(!data);
      setStep(AuthStep.VERIFY);
    } else {
      alert("Ошибка сервиса почты. Пожалуйста, проверьте настройки EmailJS или консоль разработчика.");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  useEffect(() => {
    if (otp.every(v => v !== '') && step === AuthStep.VERIFY) {
      const entered = otp.join('');
      if (entered === generatedOtp) {
        setStep(isNewUser ? AuthStep.PROFILE : AuthStep.PIN_LOGIN);
      } else {
        alert("Неверный код верификации");
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
      }
    }
  }, [otp]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = pin.join('');
    if (pinStr.length < 4) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
          email, 
          password: `pin_${pinStr}`,
          options: { data: { full_name: fullName, phone_number: phone, role } }
      });
      if (error) throw error;
      
      if (data.user) {
          await supabase.from('profiles').insert({
              id: data.user.id,
              full_name: fullName,
              phone_number: phone,
              role: role,
              email_link: email 
          });
      }
      onAuthSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 3) pinRefs[index + 1].current?.focus();
  };

  useEffect(() => {
    if (pin.every(v => v !== '') && step === AuthStep.PIN_LOGIN) {
      handlePinLogin();
    }
  }, [pin]);

  const handlePinLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: `pin_${pin.join('')}` 
    });
    if (error) {
      alert("Неверный ПИН-код");
      setPin(['', '', '', '']);
      pinRefs[0].current?.focus();
    } else {
      onAuthSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 bg-white flex flex-col px-6 pt-12 animate-slide-in overflow-y-auto no-scrollbar pb-10">
      <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
        <span className="material-symbols-outlined text-4xl">lock_open</span>
      </div>

      {step === AuthStep.EMAIL && (
        <div className="animate-slide-in">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Авторизация</h1>
          <p className="text-slate-400 font-medium mb-10">Введите email для получения кода</p>
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email адрес</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all" placeholder="example@mail.ru" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 btn-press disabled:bg-slate-300">
              {loading ? 'Отправка...' : 'Получить код'}
            </button>
          </form>
        </div>
      )}

      {step === AuthStep.VERIFY && (
        <div className="animate-slide-in">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Код подтверждения</h1>
          <p className="text-slate-400 font-medium mb-4">Мы отправили 4-значный код на <b>{email}</b></p>
          <div className="flex justify-between gap-3 mb-8">
            {otp.map((digit, i) => (
              <input key={i} ref={otpRefs[i]} type="tel" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} className="size-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-black focus:border-primary focus:bg-white outline-none transition-all" />
            ))}
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
            <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
              <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
              Если письмо не приходит более 1 минуты, проверьте папку "Спам" или посмотрите код в консоли браузера (F12).
            </p>
          </div>
          <button onClick={() => setStep(AuthStep.EMAIL)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Изменить почту</button>
        </div>
      )}

      {step === AuthStep.PROFILE && (
        <div className="animate-slide-in">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Регистрация</h1>
          <p className="text-slate-400 font-medium mb-8">Заполните данные для создания профиля</p>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ФИО</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all" placeholder="Иван Иванов" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Роль</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRole(UserRole.PASSENGER)} className={`py-3 rounded-xl font-bold text-[10px] uppercase border ${role === UserRole.PASSENGER ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-slate-100 text-slate-400'}`}>Пассажир</button>
                    <button type="button" onClick={() => setRole(UserRole.DRIVER)} className={`py-3 rounded-xl font-bold text-[10px] uppercase border ${role === UserRole.DRIVER ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/20' : 'bg-white border-slate-100 text-slate-400'}`}>Водитель</button>
                </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ваш 4-значный ПИН</label>
              <div className="flex justify-between gap-3">
                {pin.map((digit, i) => (
                  <input key={i} ref={pinRefs[i]} type="password" maxLength={1} value={digit} onChange={(e) => handlePinChange(i, e.target.value)} className="size-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-black focus:border-primary outline-none" />
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading || pin.join('').length < 4} className="w-full bg-success py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-success/20 btn-press mt-4 disabled:bg-slate-300">
              {loading ? 'Создание...' : 'Завершить'}
            </button>
          </form>
        </div>
      )}

      {step === AuthStep.PIN_LOGIN && (
        <div className="animate-slide-in text-center">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Введите ПИН</h1>
          <p className="text-slate-400 font-medium mb-10">Введите ваш секретный код</p>
          <div className="flex justify-center gap-4 mb-10">
            {pin.map((digit, i) => (
              <div key={i} className={`size-4 rounded-full border-2 transition-all ${digit ? 'bg-primary border-primary scale-125' : 'bg-slate-100 border-slate-200'}`}></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => {
                const idx = pin.findIndex(v => v === '');
                if (idx !== -1) handlePinChange(idx, num.toString());
              }} className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-900 active:bg-primary active:text-white transition-colors">{num}</button>
            ))}
            <button onClick={() => setPin(['', '', '', ''])} className="size-16 rounded-full flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">backspace</span>
            </button>
            <button onClick={() => {
              const idx = pin.findIndex(v => v === '');
              if (idx !== -1) handlePinChange(idx, "0");
            }} className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-900 active:bg-primary active:text-white transition-colors">0</button>
          </div>
          <button onClick={() => setStep(AuthStep.EMAIL)} className="mt-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Войти под другим Email</button>
        </div>
      )}
    </div>
  );
};

export default Auth;
