
import React, { useState, useEffect } from 'react';
import { type Sale } from '../lib/types';

interface InvoicesProps {
  isAdmin: boolean;
}

const Invoices: React.FC<InvoicesProps> = ({ isAdmin }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);

  useEffect(() => {
    fetch('/api/sales').then(res => res.json()).then(data => {
      setSales(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">فواتير المبيعات</h3>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">أرشيف الفواتير الضريبية والمبسطة</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">تحميل الكل PDF</button>
        </div>
      </div>

      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {sales.map(sale => (
             <div key={sale.id} onClick={() => setSelectedInvoice(sale)} className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex items-center justify-between cursor-pointer hover:shadow-xl hover:bg-white transition-all group">
                <div className="flex gap-6 items-center">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-hover:bg-orange-600 group-hover:text-white transition-all">🧾</div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">فاتورة رقم #{sale.id.toString().padStart(6, '0')}</p>
                    <h4 className="font-black text-slate-800 text-lg">{sale.client_name}</h4>
                  </div>
                </div>
                <div className="text-left">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{new Date(sale.created_at).toLocaleDateString('ar-EG')}</p>
                   <p className="text-xl font-black text-emerald-600">{Number(sale.total_price).toLocaleString()} <span className="text-xs font-normal">ج.م</span></p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-slate-50 p-12 border-b flex justify-between items-start">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">أبناء الغالي</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">لاستيراد وتجارة الأخشاب</p>
                 </div>
                 <div className="text-left">
                    <div className="bg-orange-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">فاتورة مبيعات</div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تاريخ: {new Date(selectedInvoice.created_at).toLocaleString('ar-EG')}</p>
                 </div>
              </div>
              <div className="p-12 space-y-8">
                 <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-8">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">العميل</p>
                      <p className="text-xl font-black text-slate-800">{selectedInvoice.client_name}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">رقم الفاتورة</p>
                      <p className="text-xl font-black text-slate-800 font-mono">INV-{selectedInvoice.id.toString().padStart(6, '0')}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">تفاصيل البنود</p>
                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl">
                       <span className="font-black text-slate-800">{selectedInvoice.good_name}</span>
                       <span className="bg-white px-4 py-1.5 rounded-full text-xs font-black border border-slate-100">{selectedInvoice.quantity} {selectedInvoice.unit_type === 'bundle' ? 'ربطة' : 'لوح'}</span>
                       <span className="font-black text-slate-800">{Number(selectedInvoice.total_price).toLocaleString()} ج.م</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-3xl">
                    <span className="text-sm font-black uppercase tracking-[0.2em] opacity-50">الإجمالي الكلي</span>
                    <span className="text-3xl font-black">{Number(selectedInvoice.total_price).toLocaleString()} ج.م</span>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 flex justify-center gap-4">
                 <button onClick={() => window.print()} className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all">🖨️ طباعة الفاتورة</button>
                 <button onClick={() => setSelectedInvoice(null)} className="bg-white text-slate-400 px-10 py-4 rounded-2xl font-black border border-slate-100 hover:text-slate-900 transition-all">إغلاق</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
