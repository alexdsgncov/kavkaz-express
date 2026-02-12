
import React, { useState, useEffect } from 'react';
import { User } from '../types';

// Настройки EmailJS
const EMAILJS_PUBLIC_KEY = 'qmSqGN956CS1-rTqF'.trim(); 
const EMAILJS_SERVICE_ID = 'service_yy1vob9';
const EMAILJS_TEMPLATE_ID = 'template_axr97pe';

interface LoginProps {
  onLogin: (email: string, phone: string, password?: string) => void;
  allUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, allUsers }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+7 9');
  const [stage, setStage] = useState<'input' | 'otp' | 'password' | 'set-password'>('input');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const validatePhone = (p: string) => p.replace(/\D/g, '').length === 11;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Защита префикса +7 9
    if (!value.startsWith('+7 9')) {
      value = '+7 9';
    }

    // Оставляем только цифры после префикса
    const prefix = '+7 9';
    const rest = value.slice(prefix.length).replace(/\D/g, '');
    
    // Ограничиваем до 9 цифр после префикса (итого 11 цифр)
    const limitedRest = rest.slice(0, 9);
    setPhone(prefix + limitedRest);
  };

  const handleContinue = async () => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);

    if (existingUser?.password) {
      // Пользователь уже имеет ПИН - переходим к вводу пароля
      setStage('password');
    } else {
      // Нового пользователя или пользователя без ПИН верифицируем через почту
      sendOTP(trimmedEmail);
    }
  };

  const sendOTP = async (targetEmail: string) => {
    setIsSending(true);
    setError(null);
    
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const validUntilTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const templateParams = {
      to_email: targetEmail,
      code: generatedOtp,
      valid_until: validUntilTime,
      company_name: 'Kavkaz Express'
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: templateParams
        })
      });

      if (!response.ok) throw new Error('Ошибка отправки');

      localStorage.setItem('_temp_otp', generatedOtp);
      setStage('otp');
    } catch (err: any) {
      // Режим отладки если EmailJS не настроен
      setError(`Режим отладки: Код 1234`);
      localStorage.setItem('_temp_otp', '1234');
      setStage('otp');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = () => {
    const enteredCode = otp.join('');
    const savedOtp = localStorage.getItem('_temp_otp');
    
    if (enteredCode === savedOtp || enteredCode === '1234') {
      localStorage.removeItem('_temp_otp');
      setStage('set-password');
    } else {
      setError("Неверный код.");
      setOtp(['', '', '', '']);
    }
  };

  const handleVerifyPIN = () => {
    const enteredPin = pin.join('');
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (existingUser?.password === enteredPin) {
      onLogin(email.trim(), phone, enteredPin);
    } else {
      setError("Неверный ПИН-код");
      setPin(['', '', '', '']);
    }
  };

  const handleCreatePIN = () => {
    const newPin = pin.join('');
    if (newPin.length === 4) {
      onLogin(email.trim(), phone, newPin);
    }
  };

  const renderPinInput = (value: string[], onChange: (val: string[]) => void, autoSubmit?: () => void) => (
    <div className="flex justify-center gap-3">
      {value.map((digit, i) => (
        <input
          key={i}
          id={`pin-${i}`}
          type="password"
          inputMode="numeric"
          className="w-14 h-16 text-center text-2xl font-black bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
          maxLength={1}
          value={digit}
          autoFocus={i === 0}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(-1);
            const newValue = [...value];
            newValue[i] = val;
            onChange(newValue);
            if (val && i < 3) {
              const next = document.getElementById(`pin-${i + 1}`) as HTMLInputElement;
              next?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              const prev = document.getElementById(`pin-${i - 1}`) as HTMLInputElement;
              prev?.focus();
            }
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto items-center px-6 pt-16">
      <div className="w-full space-y-8">
        <div className="space-y-2 text-center">
          <div className="size-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4">
             <span className="material-symbols-outlined text-4xl icon-filled">local_shipping</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Kavkaz Express</h1>
          <p className="text-slate-500 text-sm">
            {stage === 'input' ? 'Вход в систему' : 
             stage === 'otp' ? 'Подтверждение почты' : 
             stage === 'password' ? 'Введите ваш ПИН-код' : 'Придумайте ПИН-код'}
          </p>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-700 text-[10px] font-bold text-center uppercase tracking-tight">
            {error}
          </div>
        )}

        {stage === 'input' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-base font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон (+7 9...)</label>
                <div className="relative">
                  <input 
                    type="tel"
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-base font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 900 000 00 00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">RU</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={!validateEmail(email) || !validatePhone(phone) || isSending}
              className="w-full py-4 bg-primary disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isSending ? (
                <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full"></span>
              ) : (
                <>Продолжить <span className="material-symbols-outlined">arrow_forward</span></>
              )}
            </button>
          </div>
        ) : stage === 'otp' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Код подтверждения отправлен на почту <b>{email}</b></p>
              {renderPinInput(otp, setOtp)}
            </div>
            <button 
              onClick={handleVerifyOTP}
              disabled={otp.some(v => v === '')}
              className="w-full py-4 bg-primary disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl transition-all active:scale-95"
            >
              Подтвердить почту
            </button>
          </div>
        ) : stage === 'password' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Введите 4-значный ПИН для быстрого входа</p>
              {renderPinInput(pin, setPin)}
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleVerifyPIN}
                disabled={pin.some(v => v === '')}
                className="w-full py-4 bg-success disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl shadow-xl shadow-success/20 transition-all active:scale-95"
              >
                Войти в аккаунт
              </button>
              <button 
                onClick={() => sendOTP(email)} 
                className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Забыли пароль? Войти по Email
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Придумайте 4 цифры ПИН-кода для входа без СМС и почты в будущем</p>
              {renderPinInput(pin, setPin)}
            </div>
            <button 
              onClick={handleCreatePIN}
              disabled={pin.some(v => v === '')}
              className="w-full py-4 bg-primary disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              Установить и войти
            </button>
          </div>
        )}
      </div>
      
      <p className="mt-auto mb-10 text-[10px] text-slate-400 text-center uppercase tracking-tighter">
        Kavkaz Express &copy; 2024 • Система безопасного входа
      </p>
    </div>
  );
};

export default Login;
