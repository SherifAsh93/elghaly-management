
import React, { useState, useEffect } from 'react';

interface ReportsProps {
  isAdmin: boolean;
}

const Reports: React.FC<ReportsProps> = ({ isAdmin }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div className="p-32 flex flex-col items-center justify-center">
       <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-8 font-black text-slate-400 animate-pulse uppercase tracking-[0.2em]">جاري تحليل البيانات المالية...</p>
    </div>
  );

  const maxMonthly = Math.max(...(stats.monthlyIncome?.map((m: any) => m.income) || [1]));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-4xl font-black tracking-tight mb-2 uppercase">المركز المالي الشامل</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">تحليلات الأداء المالي لمجموعة أبناء الغالي</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
               <span className="text-[10px] font-black text-slate-500 block mb-1">تحديث التقرير</span>
               <span className="text-sm font-bold">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
             <div className="space-y-2 group">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">إجمالي المبيعات المحققة</p>
                <p className="text-4xl font-black text-emerald-400 group-hover:scale-105 transition-transform origin-right">{stats.totalSales.toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                <div className="h-1 w-12 bg-emerald-600/30 rounded-full"></div>
             </div>
             <div className="space-y-2 border-r border-white/5 pr-12 group">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">إجمالي الأرباح المتوقعة</p>
                <p className="text-4xl font-black text-orange-500 group-hover:scale-105 transition-transform origin-right">{stats.expectedIncome.toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                <div className="h-1 w-12 bg-orange-600/30 rounded-full"></div>
             </div>
             <div className="space-y-2 border-r border-white/5 pr-12 group">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">رأس مال المخزون الحالي</p>
                <p className="text-4xl font-black text-indigo-400 group-hover:scale-105 transition-transform origin-right">{(stats.totalInventory * 1250).toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                <div className="h-1 w-12 bg-indigo-600/30 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h4 className="text-xl font-black text-slate-800 mb-10 flex items-center justify-between">
               <span>إحصائيات الدخل الشهري</span>
               <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">آخر 6 أشهر</span>
            </h4>
            
            <div className="flex items-end justify-between h-48 gap-4 px-4">
              {stats.monthlyIncome?.length > 0 ? stats.monthlyIncome.map((m: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                   <div className="relative w-full flex flex-col justify-end h-32">
                      <div 
                        className="w-full bg-slate-100 rounded-t-xl transition-all duration-700 group-hover:bg-orange-500 group-hover:shadow-[0_-5px_15px_rgba(249,115,22,0.2)]" 
                        style={{ height: `${(m.income / maxMonthly) * 100}%` }}
                      ></div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md font-black pointer-events-none">
                        {m.income.toLocaleString()}
                      </div>
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate w-full text-center">{m.month}</span>
                </div>
              )) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">لا توجد مبيعات مسجلة حتى الآن</div>
              )}
            </div>
         </div>

         <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <h4 className="text-xl font-black text-slate-800 mb-6 w-full">كفاءة التوزيع</h4>
            <div className="relative h-48 w-48 mb-6">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-50" />
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * 0.82)} strokeLinecap="round" className="text-emerald-500 transition-all duration-1000 ease-out" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900">82%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نشاط المخزن</span>
               </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl w-full">
               <p className="text-xs text-emerald-700 font-black">أداء المخازن مستقر وممتاز لهذا الشهر</p>
            </div>
         </div>
      </div>
      
      <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
         <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">إحصائيات الموظفين والعملاء</h4>
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">🖨️ طباعة الميزانية</button>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">العملاء النشطون</p><p className="text-2xl font-black text-violet-600">{stats.clientCount}</p></div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">سلف الموظفين</p><p className="text-2xl font-black text-rose-600">{stats.pendingAdvances.toLocaleString()} ج.م</p></div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">المخزون (ربطة)</p><p className="text-2xl font-black text-amber-600">{stats.totalInventory}</p></div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">متوسط الربح</p><p className="text-2xl font-black text-emerald-600">{(stats.totalSales / (stats.clientCount || 1)).toLocaleString()} ج.م</p></div>
         </div>
      </div>
    </div>
  );
};

export default Reports;
