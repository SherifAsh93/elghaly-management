
import React, { useState, useEffect } from 'react';
import { type Good, type Client } from '../lib/types';

interface InventoryProps {
  isAdmin: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ isAdmin }) => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<Good | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [sellData, setSellData] = useState({ quantity: 1, isBundle: true, clientId: '' });
  const [editData, setEditData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goodsRes, clientsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/clients')
      ]);
      const [gData, cData] = await Promise.all([goodsRes.json(), clientsRes.json()]);
      setGoods(Array.isArray(gData) ? gData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !sellData.clientId) return;
    const res = await fetch('/api/inventory/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedItem.id, ...sellData })
    });
    if (res.ok) {
      alert("✅ تمت عملية البيع بنجاح");
      setShowSellModal(false);
      fetchData();
    } else {
      const err = await res.json();
      alert("❌ خطأ: " + err.error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const res = await fetch(`/api/inventory/${selectedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      alert("✅ تم تعديل البيانات بنجاح");
      setShowEditModal(false);
      fetchData();
    } else {
      alert("❌ فشل التعديل");
    }
  };

  const filtered = goods.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="relative flex-1 w-full max-w-md">
            <input placeholder="ابحث باسم الصنف أو الكود..." className="w-full p-4 pr-12 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-orange-500 font-bold transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
         </div>
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-6 py-2.5 rounded-full border border-slate-100">إجمالي الأصناف: {filtered.length}</div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-10 py-6">الصنف والبيانات الفنية</th>
              <th className="px-10 py-6 text-center">المتاح (ربطة)</th>
              <th className="px-10 py-6 text-center">الإجمالي (لوح)</th>
              <th className="px-10 py-6 text-center">سعر البيع/لوح</th>
              <th className="px-10 py-6 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="p-32 text-center animate-pulse text-slate-400 font-bold tracking-widest uppercase">جاري مزامنة بيانات المخزن...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold uppercase tracking-widest">لا توجد أصناف تطابق البحث</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-10 py-8">
                  <div className="font-black text-slate-800 text-lg">{item.name}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-mono font-black tracking-widest">{item.code}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.thickness}mm • {item.height}x{item.width}</span>
                  </div>
                </td>
                <td className="px-10 py-8 text-center">
                   <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                      <span className="font-black text-indigo-700 text-base">{item.units}</span>
                      <span className="text-[9px] font-black text-indigo-400 uppercase">ربطة</span>
                   </div>
                </td>
                <td className="px-10 py-8 text-center font-black text-slate-500">{(item.units || 0) * (item.sheetsPerUnit || 0)}</td>
                <td className="px-10 py-8 text-center font-black text-emerald-600 text-lg">{item.sellPricePerSheet} <span className="text-xs font-normal opacity-50">ج.م</span></td>
                <td className="px-10 py-8">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => { setSelectedItem(item); setSellData({quantity: 1, isBundle: true, clientId: ''}); setShowSellModal(true); }} 
                      className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      بيع سريع
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => { setSelectedItem(item); setEditData(item); setShowEditModal(true); }} 
                        className="bg-white border border-slate-200 text-slate-400 w-11 h-11 flex items-center justify-center rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                        title="تعديل بيانات الصنف"
                      >
                        ⚙️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[300] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in-95 border border-white/20">
              <div className="mb-8">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">تعديل البيانات</h3>
                <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">{selectedItem.name} ({selectedItem.code})</p>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم الصنف</label>
                      <input className="input-field" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest mr-2">سعر البيع/لوح</label>
                      <input type="number" step="0.01" className="w-full p-4 bg-orange-50 border border-orange-100 rounded-2xl font-black text-xl text-orange-700 outline-none focus:ring-2 focus:ring-orange-500" value={editData.sellPricePerSheet} onChange={e => setEditData({...editData, sellPricePerSheet: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">السماكة (mm)</label>
                      <input type="number" step="0.1" className="input-field" value={editData.thickness} onChange={e => setEditData({...editData, thickness: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all">حفظ التغييرات</button>
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-50 text-slate-400 py-5 rounded-2xl font-black hover:bg-slate-100 transition-all">إلغاء</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[300] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl space-y-8 animate-in zoom-in-95 border border-white/20">
              <div className="text-center">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">نموذج بيع سريع</span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedItem.name}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">الكود: {selectedItem.code}</p>
              </div>
              <form onSubmit={handleSellSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اختيار العميل</label>
                    <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500 appearance-none" value={sellData.clientId} onChange={e => setSellData({...sellData, clientId: e.target.value})}>
                        <option value="">-- اضغط للاختيار من القائمة --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 
                 <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button type="button" onClick={() => setSellData({...sellData, isBundle: true})} className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all ${sellData.isBundle ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}>بالربطة</button>
                    <button type="button" onClick={() => setSellData({...sellData, isBundle: false})} className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all ${!sellData.isBundle ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}>باللوح</button>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block mb-2">الكمية المطلوبة</label>
                    <input type="number" min="1" className="w-full p-8 text-6xl font-black text-center bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" value={sellData.quantity} onChange={e => setSellData({...sellData, quantity: Number(e.target.value)})} />
                 </div>

                 <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center shadow-inner">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">إجمالي المبلغ</span>
                    <span className="text-3xl font-black text-emerald-800">
                      {((sellData.isBundle ? selectedItem.sellPricePerSheet * selectedItem.sheetsPerUnit : selectedItem.sellPricePerSheet) * sellData.quantity).toLocaleString()} <span className="text-xs font-normal">ج.م</span>
                    </span>
                 </div>

                 <button type="submit" className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-900/20 active:scale-95 transition-all">تأكيد عملية البيع</button>
                 <button type="button" onClick={() => setShowSellModal(false)} className="w-full text-slate-400 font-bold hover:text-rose-500 transition-colors">إلغاء العملية</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
