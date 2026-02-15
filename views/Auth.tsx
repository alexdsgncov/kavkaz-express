
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
  const [dbError, setDbError] = useState<string | null>(null);

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Проверяем статус при загрузке: если юзер уже есть в Auth, но мы тут, значит нужен профиль или пин
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || '');
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle();
        if (!profile) {
          setStep(AuthStep.PROFILE);
          setIsNewUser(true);
        } else {
          // Если профиль есть, но мы всё еще в Auth, значит сессия истекла или это ПИН-вход
          setStep(AuthStep.PIN_LOGIN);
        }
      }
    };
    checkStatus();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setDbError(null);
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('email_link', email.toLowerCase().trim())
        .maybeSingle();
      
      if (profileErr && profileErr.message.includes('not found')) {
        setDbError("Таблица 'profiles' не найдена. Создайте её в SQL Editor.");
        setLoading(false);
        return;
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      
      const sent = await sendOTP(email, code);
      if (sent) {
        setIsNewUser(!profile);
        setStep(AuthStep.VERIFY);
      } else {
        alert("Не удалось отправить код.");
      }
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  useEffect(() => {
    if (otp.every(v => v !== '') && step === AuthStep.VERIFY) {
      if (otp.join('') === generatedOtp) {
        setStep(isNewUser ? AuthStep.PROFILE : AuthStep.PIN_LOGIN);
      } else {
        alert("Неверный код");
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
      }
    }
  }, [otp]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = pin.join('');
    if (pinStr.length < 4 || !fullName.trim()) return;
    
    setLoading(true);
    try {
      // 1. Регистрация
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email: email.toLowerCase().trim(), 
          password: `pin_${pinStr}`
      });

      let userId = authData?.user?.id;

      if (authError) {
        if (authError.message.includes('already registered')) {
            const { data: signInData, error: loginErr } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password: `pin_${pinStr}`
            });
            if (loginErr) throw new Error("Этот email уже занят другим ПИН-кодом.");
            userId = signInData?.user?.id;
        } else {
            throw authError;
        }
      }

      if (!userId) {
        // Если email confirmation включен, пользователь может быть создан, но сессии нет
        const { data: { user: retryUser } } = await supabase.auth.getUser();
        userId = retryUser?.id;
      }

      if (userId) {
          // 2. Создаем профиль. Upsert гарантирует, что мы не упадем, если запись уже есть
          const { error: profError } = await supabase.from('profiles').upsert({
              id: userId,
              full_name: fullName.trim(),
              phone_number: phone,
              role: role,
              email_link: email.toLowerCase().trim() 
          });

          if (profError) throw profError;
          
          // Вызываем успех. App.tsx увидит и sbUser и Profile и переключит экран
          onAuthSuccess();
      } else {
        alert("Пожалуйста, проверьте почту для подтверждения (если это настроено в Supabase).");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password: `pin_${pin.join('')}` 
      });
      if (error) {
        alert("Неверный ПИН-код");
        setPin(['', '', '', '']);
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pin.every(v => v !== '') && step === AuthStep.PIN_LOGIN) {
      handlePinLogin();
    }
  }, [pin]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 3) pinRefs[index + 1].current?.focus();
  };

  return (
    <div className="flex-1 bg-white flex flex-col px-6 pt-12 animate-slide-in overflow-y-auto no-scrollbar pb-10 relative h-screen">
      <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 shrink-0">
        <span className="material-symbols-outlined text-4xl">lock_open</span>
      </div>

      {dbError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl shrink-0">
          <p className="text-red-600 text-xs font-bold">{dbError}</p>
        </div>
      )}

      {step === AuthStep.EMAIL && (
        <div className="animate-slide-in">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Авторизация</h1>
          <p className="text-slate-400 font-medium mb-10">Введите email для доступа</p>
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email адрес</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all shadow-sm" placeholder="example@mail.ru" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 btn-press disabled:bg-slate-300">
              {loading ? 'Проверка...' : 'Продолжить'}
            </button>
          </form>
        </div>
      )}

      {step === AuthStep.VERIFY && (
        <div className="animate-slide-in">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Код из письма</h1>
          <p className="text-slate-400 font-medium mb-8">Отправлен на {email}</p>
          <div className="flex justify-between gap-3 mb-10">
            {otp.map((digit, i) => (
              <input key={i} ref={otpRefs[i]} type="tel" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} className="size-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-black focus:border-primary outline-none" />
            ))}
          </div>
          <button onClick={() => setStep(AuthStep.EMAIL)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center">Изменить почту</button>
        </div>
      )}

      {step === AuthStep.PROFILE && (
        <div className="animate-slide-in">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Создать профиль</h1>
          <p className="text-slate-400 font-medium mb-8">Заполните данные для поездок</p>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ФИО</label>
                <input type="text" required placeholder="Иван Иванов" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
                <input type="tel" required placeholder="+7 999 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole(UserRole.PASSENGER)} className={`py-3 rounded-xl font-bold text-[10px] uppercase border transition-all ${role === UserRole.PASSENGER ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>Пассажир</button>
                <button type="button" onClick={() => setRole(UserRole.DRIVER)} className={`py-3 rounded-xl font-bold text-[10px] uppercase border transition-all ${role === UserRole.DRIVER ? 'bg-secondary border-secondary text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>Водитель</button>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Придумайте 4-значный ПИН</label>
              <div className="flex justify-between gap-3">
                {pin.map((digit, i) => (
                  <input key={i} ref={pinRefs[i]} type="password" maxLength={1} value={digit} onChange={(e) => handlePinChange(i, e.target.value)} className="size-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-black focus:border-primary outline-none" />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || pin.join('').length < 4} className="w-full bg-success py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-success/20 btn-press mt-4">
              {loading ? 'Создание...' : 'Завершить'}
            </button>
          </form>
        </div>
      )}

      {step === AuthStep.PIN_LOGIN && (
        <div className="animate-slide-in text-center">
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">Введите ПИН</h1>
          <p className="text-slate-400 font-medium mb-10">Для входа в аккаунт {email}</p>
          <div className="flex justify-center gap-4 mb-10">
            {pin.map((digit, i) => (
              <div key={i} className={`size-4 rounded-full border-2 transition-all ${digit ? 'bg-primary border-primary scale-125' : 'bg-slate-100 border-slate-200'}`}></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map(val => (
              <button key={val} onClick={() => {
                if (val === 'C') setPin(['', '', '', '']);
                else if (val === '←') {
                    const lastIdx = [...pin].reverse().findIndex(x => x !== '');
                    if (lastIdx !== -1) {
                        const newPin = [...pin];
                        newPin[3 - lastIdx] = '';
                        setPin(newPin);
                    }
                } else {
                    const idx = pin.findIndex(v => v === '');
                    if (idx !== -1) {
                      const newPin = [...pin];
                      newPin[idx] = val.toString();
                      setPin(newPin);
                    }
                }
              }} className="size-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-900 active:bg-primary active:text-white transition-colors">
                  {val === '←' ? <span className="material-symbols-outlined">backspace</span> : val}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
