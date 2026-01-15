
'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import Inventory from '../components/Inventory';
import Clients from '../components/Clients';
import Employees from '../components/Employees';
import Sidebar from '../components/Sidebar';
import SalesHistory from '../components/SalesHistory';
import Purchases from '../components/Purchases';
import Invoices from '../components/Invoices';
import Reports from '../components/Reports';

type Role = 'admin' | 'sales' | null;
export type Tab = 'dashboard' | 'inventory' | 'purchases' | 'sales-history' | 'invoices' | 'clients' | 'employees' | 'reports';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userRole, setUserRole] = useState<Role>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logoUrl = "https://scontent.faly1-2.fna.fbcdn.net/v/t39.30808-1/518327138_1244906727646012_8662475096945791827_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=We9R9jSetugQ7kNvwEoJa9o&_nc_oc=AdkidbQ8pmV5D1zQ56nQFj6DGEKjFUEcSTgDMF-HZpBHgF_ELDJLkhYwx5ugk9eU34U&_nc_zt=24&_nc_ht=scontent.faly1-2.fna&_nc_gid=9VJWPZ_jzj7o0QT7d17kaA&oh=00_AfoojzV10jM-c_w1wp9H2aNrntnyELub43mpuG6yWC-2tg&oe=6969B030";

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as Role;
    if (savedRole) setUserRole(savedRole);
    
    // تهيئة قاعدة البيانات السحابية عند أول فتح
    fetch('/api/setup-db').catch(err => console.error("DB Setup fail:", err));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '01111848813') {
      setUserRole('admin');
      localStorage.setItem('userRole', 'admin');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const enterSalesMode = () => {
    setUserRole('sales');
    localStorage.setItem('userRole', 'sales');
    setActiveTab('inventory');
  };

  const logout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-[#1e293b] p-12 text-center text-white relative">
            <div className="w-28 h-28 mx-auto mb-6 p-1 bg-gradient-to-tr from-orange-500 to-amber-200 rounded-[2rem] shadow-2xl">
              <div className="w-full h-full rounded-[1.8rem] border-2 border-white overflow-hidden bg-white">
                <img src={logoUrl} alt="أبناء الغالي" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight">أبناء الغالي</h1>
            <p className="text-orange-400 text-[10px] mt-2 font-bold tracking-[0.3em] uppercase opacity-80">لاستيراد وتجارة الأخشاب</p>
          </div>
          
          <div className="p-10 space-y-8 bg-white">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">دخول المسؤول</label>
                 <input 
                  type="password"
                  placeholder="كلمة المرور"
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-black text-xl tracking-widest transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-rose-500 text-[10px] font-black text-center animate-bounce">{error}</p>}
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-600 transition-all active:scale-95">
                دخول المدير
              </button>
            </form>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
               <span className="relative bg-white px-4">أو</span>
            </div>
            <button onClick={enterSalesMode} className="w-full bg-slate-50 text-slate-600 py-5 rounded-2xl font-black border border-slate-100 hover:bg-slate-100 transition-all active:scale-95">
              دخول سريع للمبيعات
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="flex h-screen bg-[#0f172a] text-right font-sans overflow-hidden" dir="rtl">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole as 'admin' | 'sales'} 
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc] lg:my-2 lg:mr-2 lg:rounded-[3rem] shadow-2xl border-l border-white/5">
        <header className="flex items-center justify-between bg-white px-8 py-6 shadow-sm border-b border-gray-50 z-30 lg:rounded-tr-[3rem]">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">
              {activeTab === 'dashboard' && 'الرئيسية'}
              {activeTab === 'inventory' && 'إدارة المخزن'}
              {activeTab === 'purchases' && 'المشتريات'}
              {activeTab === 'sales-history' && 'سجل المبيعات'}
              {activeTab === 'invoices' && 'الفواتير'}
              {activeTab === 'clients' && 'العملاء'}
              {activeTab === 'employees' && 'الموظفين'}
              {activeTab === 'reports' && 'التقارير المالية'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden xl:flex flex-col items-end">
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest mb-1">اتصال سحابي آمن</span>
                <span className="text-[10px] font-bold text-slate-400">نظام Turso - SQLite</span>
             </div>
             <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.8rem] border-4 border-white overflow-hidden shadow-xl bg-white">
               <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'inventory' && <Inventory isAdmin={isAdmin} />}
            {activeTab === 'purchases' && <Purchases isAdmin={isAdmin} />}
            {activeTab === 'sales-history' && <SalesHistory isAdmin={isAdmin} />}
            {activeTab === 'invoices' && <Invoices isAdmin={isAdmin} />}
            {activeTab === 'clients' && <Clients isAdmin={isAdmin} />}
            {activeTab === 'employees' && <Employees isAdmin={isAdmin} />}
            {activeTab === 'reports' && <Reports isAdmin={isAdmin} />}
          </div>
        </div>
      </main>
    </div>
  );
}
