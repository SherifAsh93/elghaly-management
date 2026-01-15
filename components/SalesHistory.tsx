
import React, { useState, useEffect } from 'react';
import { type Sale } from '../lib/types';

interface SalesHistoryProps {
  isAdmin: boolean;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ isAdmin }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend API instead of using dexie hooks
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteSale = async (id: number) => {
    if (!isAdmin) return;
    if (confirm('حذف العملية من السجل؟')) {
      try {
        const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
      } catch (err) {
        alert("فشل الحذف");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b bg-slate-50/50">
        <h3 className="text-xl font-bold text-slate-800">سجل عمليات المبيعات</h3>
        <p className="text-sm text-slate-500">إجمالي العمليات: {sales.length}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 text-[11px] font-black tracking-widest uppercase">
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">الصنف</th>
              <th className="px-6 py-4">العميل</th>
              <th className="px-6 py-4 text-center">الكمية</th>
              <th className="px-6 py-4 text-center">المبلغ</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold">جاري التحميل...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={6} className="p-20 text-center text-slate-400">لا توجد مبيعات مسجلة</td></tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{new Date(sale.created_at).toLocaleString('ar-EG')}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{sale.good_name}<div className="text-[10px] text-indigo-500 uppercase">{sale.unit_type === 'bundle' ? 'ربطة' : 'لوح'}</div></td>
                  <td className="px-6 py-4 font-bold text-slate-600">{sale.client_name}</td>
                  <td className="px-6 py-4 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg font-bold">{sale.quantity}</span></td>
                  <td className="px-6 py-4 text-center font-black text-emerald-700 text-lg">{Number(sale.total_price).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    {isAdmin && <button onClick={() => deleteSale(sale.id!)} className="text-red-500 text-xs font-black">حذف</button>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesHistory;
