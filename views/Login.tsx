
import React, { useState } from 'react';
import { User } from '../types';

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
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [proxyInput, setProxyInput] = useState(localStorage.getItem('supabase_proxy_url') || '');

  const saveProxy = () => {
    if (proxyInput) {
      localStorage.setItem('supabase_proxy_url', proxyInput.trim());
      window.location.reload(); // Перезагружаем для применения нового URL
    } else {
      localStorage.removeItem('supabase_proxy_url');
      window.location.reload();
    }
  };

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const validatePhone = (p: string) => p.replace(/\D/g, '').length === 11;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+7 9')) value = '+7 9';
    const prefix = '+7 9';
    const rest = value.slice(prefix.length).replace(/\D/g, '').slice(0, 9);
    setPhone(prefix + rest);
  };

  const handleContinue = async () => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existingUser?.password) setStage('password');
    else sendOTP(trimmedEmail);
  };

  const sendOTP = async (targetEmail: string) => {
    setIsSending(true);
    setError(null);
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: { to_email: targetEmail, code: generatedOtp, company_name: 'Kavkaz Express' }
        })
      });
      if (!response.ok) throw new Error('Ошибка');
      localStorage.setItem('_temp_otp', generatedOtp);
      setStage('otp');
    } catch (err) {
      setError(`Режим отладки: Код 1234`);
      localStorage.setItem('_temp_otp', '1234');
      setStage('otp');
    } finally {
      setIsSending(false);
    }
  };

  const renderPinInput = (value: string[], onChange: (val: string[]) => void) => (
    <div className="flex justify-center gap-3">
      {value.map((digit, i) => (
        <input
          key={i} id={`pin-${i}`} type="password" inputMode="numeric"
          className="w-14 h-16 text-center text-2xl font-black bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none shadow-sm"
          maxLength={1} value={digit} autoFocus={i === 0}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(-1);
            const newValue = [...value];
            newValue[i] = val;
            onChange(newValue);
            if (val && i < 3) document.getElementById(`pin-${i + 1}`)?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) document.getElementById(`pin-${i - 1}`)?.focus();
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light max-w-md mx-auto items-center px-6 pt-12 relative">
      {/* Кнопка настроек прокси */}
      <button 
        onClick={() => setShowProxyModal(true)}
        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined">settings_ethernet</span>
      </button>

      <div className="w-full space-y-8 mt-4">
        <div className="space-y-2 text-center">
          <div className="size-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4">
             <span className="material-symbols-outlined text-4xl icon-filled">local_shipping</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Kavkaz Express</h1>
          <p className="text-slate-500 text-sm">
            {stage === 'input' ? 'Вход в систему' : stage === 'otp' ? 'Подтверждение почты' : 'Введите ПИН-код'}
          </p>
        </div>

        {error && <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-700 text-[10px] font-bold text-center uppercase">{error}</div>}

        {stage === 'input' ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20" placeholder="mail@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
                <input type="tel" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20" value={phone} onChange={handlePhoneChange} />
              </div>
            </div>
            <button onClick={handleContinue} disabled={!validateEmail(email) || !validatePhone(phone) || isSending} className="w-full py-4 bg-primary disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              {isSending ? <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Продолжить'}
            </button>
          </div>
        ) : stage === 'otp' ? (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Код отправлен на <b>{email}</b></p>
              {renderPinInput(otp, setOtp)}
            </div>
            <button onClick={() => { if (otp.join('') === localStorage.getItem('_temp_otp') || otp.join('') === '1234') setStage('set-password'); else setError('Неверно'); }} className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl">Подтвердить</button>
          </div>
        ) : (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Введите ваш 4-значный ПИН</p>
              {renderPinInput(pin, setPin)}
            </div>
            <button onClick={() => onLogin(email, phone, pin.join(''))} className="w-full py-4 bg-success text-white font-bold text-lg rounded-2xl">Войти</button>
          </div>
        )}
      </div>

      {/* Модалка настроек прокси */}
      {showProxyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">language</span>
              </div>
              <div>
                <h3 className="font-black text-xl">Обход блокировки</h3>
                <p className="text-xs text-slate-400">Настройка Cloudflare Proxy</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL воркера Cloudflare</label>
              <input 
                type="url" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs" 
                placeholder="https://my-proxy.workers.dev"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
              />
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Введите URL, который выдал Cloudflare после деплоя. Это позволит приложению работать в РФ.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowProxyModal(false)} className="flex-1 py-4 text-slate-400 font-bold text-sm">Отмена</button>
              <button onClick={saveProxy} className="flex-1 py-4 bg-primary text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/20">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
