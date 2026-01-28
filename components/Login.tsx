
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, User, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '01111848813') {
      onLogin(UserRole.ADMIN);
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 p-4 font-['Cairo']" dir="rtl">
      <div className="w-[300px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        {/* Container on its size + 0.5cm padding (20px) */}
        <div className="p-[20px] bg-white text-center">
          <Logo className="w-full" />
        </div>
        
        <div className="p-6 pt-0">
          {!isAdminMode ? (
            <div className="space-y-3">
              <button 
                onClick={() => onLogin(UserRole.SALES)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <User className="text-slate-600 group-hover:text-orange-600" size={18} />
                  </div>
                  <p className="font-black text-slate-800 text-sm">دخول المبيعات</p>
                </div>
              </button>

              <button 
                onClick={() => setIsAdminMode(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <ShieldCheck className="text-slate-600 group-hover:text-orange-600" size={18} />
                  </div>
                  <p className="font-black text-slate-800 text-sm">دخول الإدارة</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none text-center font-black text-lg"
                    placeholder="••••"
                  />
                </div>
                {error && <p className="text-red-500 text-[9px] font-black text-center mt-1">{error}</p>}
              </div>
              
              <div className="flex flex-col gap-2 pt-1">
                <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg active:scale-95">تأكيد</button>
                <button type="button" onClick={() => { setIsAdminMode(false); setError(''); }} className="text-slate-400 font-bold hover:text-slate-900 text-[10px]">رجوع</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
