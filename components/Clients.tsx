
import React, { useState, useEffect } from 'react';
import { type Client, type Sale } from '../lib/types';

interface ClientsProps {
  isAdmin: boolean;
}

const Clients: React.FC<ClientsProps> = ({ isAdmin }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewHistoryClient, setViewHistoryClient] = useState<Client | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', phone: '', address: '', type: 'Cash' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, salesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/sales')
      ]);
      const [clientsData, salesData] = await Promise.all([
        clientsRes.json(),
        salesRes.json()
      ]);
      setClients(clientsData);
      setSales(salesData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/clients/${formData.id}` : '/api/clients';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', phone: '', address: '', type: 'Cash' });
        fetchData();
      } else {
        alert("فشل في حفظ بيانات العميل");
      }
    } catch (err) {
      alert("خطأ في الاتصال");
    }
  };

  const deleteClient = async (id: number) => {
    if (!confirm('حذف العميل سيمسح سجلاته، هل أنت متأكد؟')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert("فشل في الحذف");
    }
  };

  const openEdit = (c: Client) => {
    setFormData({ id: c.id, name: c.name, phone: c.phone, address: c.address, type: c.type });
    setIsEditMode(true);
    setShowModal(true);
  };

  const openHistory = (client: Client) => {
    setViewHistoryClient(client);
    setShowHistoryModal(true);
  };

  const getClientSales = (clientId: number) => {
    return sales.filter(s => s.client_id === clientId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const clientSales = viewHistoryClient ? getClientSales(viewHistoryClient.id) : [];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">قاعدة بيانات العملاء</h3>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">إجمالي الحسابات المسجلة: {clients.length}</p>
        </div>
        <button onClick={() => { setFormData({name:'',phone:'',address:'',type:'Cash'}); setIsEditMode(false); setShowModal(true); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center gap-3">
          <span>➕</span>
          <span>تسجيل عميل جديد</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg animate-in zoom-in-95 overflow-hidden shadow-2xl border border-slate-100">
             <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{isEditMode ? 'تعديل الحساب' : 'إنشاء حساب عميل'}</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors">✕</button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الاسم بالكامل</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الجوال</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left focus:ring-2 focus:ring-orange-500 outline-none font-bold" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العنوان أو المنطقة</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نوع الحساب (التعامل)</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none font-black text-slate-700" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Cash">كاش (نقدي)</option>
                    <option value="Credit">كريديت (آجل)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-900/10 hover:bg-orange-700 transition-all active:scale-95">
                  {isEditMode ? 'تحديث البيانات' : 'حفظ بيانات العميل'}
                </button>
             </form>
           </div>
        </div>
      )}

      {showHistoryModal && viewHistoryClient && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 border-b bg-slate-50/80 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">👤</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{viewHistoryClient.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{viewHistoryClient.phone}</span>
                    <span className="text-xs font-black text-slate-300">|</span>
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{viewHistoryClient.type === 'Cash' ? 'نقدي' : 'آجل'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all">🖨️ طباعة التقرير</button>
                <button onClick={() => setShowHistoryModal(false)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-lg hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm">✕</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 bg-white">
              {/* Summary Stats Inside Modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">عدد الطلبيات</p>
                   <p className="text-3xl font-black text-slate-900">{clientSales.length}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                   <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest mb-1">إجمالي المشتريات</p>
                   <p className="text-3xl font-black text-emerald-700">{clientSales.reduce((a,b) => a + Number(b.total_price), 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                   <p className="text-[10px] text-orange-600/60 font-black uppercase tracking-widest mb-1">آخر معاملة</p>
                   <p className="text-lg font-black text-orange-700">{clientSales[0] ? new Date(clientSales[0].created_at).toLocaleDateString('ar-EG') : 'لا يوجد'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">سجل العمليات التفصيلي</h4>
                {clientSales.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <span className="text-6xl mb-4 grayscale opacity-10">🛒</span>
                    <p className="font-black text-lg">لا توجد سجلات مبيعات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientSales.map((sale) => (
                      <div key={sale.id} className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-orange-200 transition-all shadow-sm">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:bg-orange-500 group-hover:text-white transition-all">📦</div>
                          <div>
                            <h4 className="font-black text-slate-800">{sale.good_name}</h4>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                              {new Date(sale.created_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-8 items-center w-full md:w-auto justify-between md:justify-start">
                          <div className="text-center md:text-right">
                            <span className="text-[9px] font-black text-slate-300 block mb-1 uppercase tracking-widest">الكمية</span>
                            <div className="text-sm font-black text-slate-700">
                              {sale.quantity} {sale.unit_type === 'bundle' ? 'ربطة' : 'لوح'}
                            </div>
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] font-black text-emerald-400 block mb-1 uppercase tracking-widest">إجمالي القيمة</span>
                            <p className="text-xl font-black text-slate-900">{Number(sale.total_price).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 bg-slate-900 border-t flex justify-center items-center shrink-0">
               <button onClick={() => setShowHistoryModal(false)} className="bg-white text-slate-900 px-16 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-100 transition-all active:scale-95">إغلاق ملف العميل</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest">
              <th className="px-10 py-6">العميل والبيانات</th>
              <th className="px-10 py-6 text-center">نظام المحاسبة</th>
              <th className="px-10 py-6 text-center">الطلبيات</th>
              <th className="px-10 py-6 text-center">إجمالي المسحوبات</th>
              <th className="px-10 py-6 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
               <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-black text-xl animate-pulse">جاري جلب بيانات العملاء...</td></tr>
            ) : clients.length === 0 ? (
               <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">لا توجد حسابات مسجلة حتى الآن</td></tr>
            ) : (
              clients.map(client => {
                const mySales = getClientSales(client.id);
                const totalSpent = mySales.reduce((a, b) => a + Number(b.total_price), 0);
                
                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="font-black text-slate-800 text-lg">{client.name}</div>
                      <div className="flex gap-2 text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">
                        <span className="font-mono">{client.phone}</span>
                        <span>•</span>
                        <span>{client.address || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${client.type === 'Cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                        {client.type === 'Cash' ? 'نقدي' : 'آجل'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-black text-xs text-slate-600">{mySales.length}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="font-black text-slate-800 text-base">{totalSpent.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ج.م</span></span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openHistory(client)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 hover:bg-orange-600 transition-all">التفاصيل</button>
                        <button onClick={() => openEdit(client)} className="bg-white border border-slate-100 text-slate-400 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 hover:text-orange-600 transition-all">⚙️</button>
                        {isAdmin && <button onClick={() => deleteClient(client.id!)} className="w-10 h-10 flex items-center justify-center text-rose-300 hover:text-rose-600 transition-colors">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
