
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 font-['Cairo']" dir="rtl">
      <div className="w-full max-w-[380px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/60 relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100/30 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
        
        <div className="p-8 bg-gradient-to-b from-white to-slate-50 text-center border-b border-slate-100/60">
          <div className="relative z-10">
            <Logo className="w-full mb-2" />
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-4">
              نظام إدارة أبناء الغالي
            </p>
          </div>
        </div>
        
        <div className="p-8">
          {!isAdminMode ? (
            <div className="space-y-4">
              <button 
                onClick={() => onLogin(UserRole.SALES)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white hover:from-orange-50 hover:to-orange-50/50 hover:border-orange-300 transition-all group shadow-sm hover:shadow-lg"
              >
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-orange-100 transition-colors flex-shrink-0">
                  <User className="text-slate-600 group-hover:text-orange-600 transition-colors" size={20} />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold text-slate-800">دخول المبيعات</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">للموظفين والمندوبين</p>
                </div>
              </button>

              <button 
                onClick={() => setIsAdminMode(true)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white hover:from-amber-50 hover:to-amber-50/50 hover:border-amber-300 transition-all group shadow-sm hover:shadow-lg"
              >
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-amber-100 transition-colors flex-shrink-0">
                  <ShieldCheck className="text-slate-600 group-hover:text-amber-600 transition-colors" size={20} />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold text-slate-800">دخول الإدارة</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">مدير النظام فقط</p>
                </div>
              </button>

              <div className="pt-4 mt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center font-medium">
                  لديك حساب؟ استخدم بيانات الدخول الخاصة بك
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">كلمة مرور الإدارة</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-center text-lg transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 py-2 rounded-lg">{error}</p>}
              </div>
              
              <div className="flex flex-col gap-3 pt-3">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-bold text-sm hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  دخول الآن
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsAdminMode(false); setError(''); }} 
                  className="text-slate-400 font-semibold hover:text-slate-600 text-xs transition-colors"
                >
                  ← رجوع للقائمة الرئيسية
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
