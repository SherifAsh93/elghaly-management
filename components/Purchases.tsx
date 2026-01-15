
import React, { useState, useEffect } from 'react';
import { type Good } from '../lib/types';

interface PurchasesProps {
  isAdmin: boolean;
}

const Purchases: React.FC<PurchasesProps> = ({ isAdmin }) => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormData = {
    name: '', code: '', type: '', units: 0, sheetsPerUnit: 0,
    buyPricePerSheet: 0, sellPricePerSheet: 0, thickness: 18, height: 244, width: 122
  };
  
  const [formData, setFormData] = useState<any>(initialFormData);
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [restockQty, setRestockQty] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setGoods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetch('/api/setup-db');
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isNewProduct) {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          alert("✅ تم تسجيل المنتج الجديد بنجاح");
          setShowModal(false);
          setFormData(initialFormData);
          await fetchData();
        } else {
          const err = await res.json();
          alert("❌ خطأ: " + err.error);
        }
      } else {
        const good = goods.find(g => g.id.toString() === selectedExistingId);
        if (!good) return;
        const res = await fetch(`/api/inventory/${selectedExistingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...good, units: Number(good.units) + Number(restockQty) })
        });
        if (res.ok) {
          alert("✅ تم تحديث المخزون بنجاح");
          setShowModal(false);
          await fetchData();
        }
      }
    } catch (err) {
      alert("❌ حدث خطأ في الاتصال");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotals = () => {
    const totalSheets = (Number(formData.units) || 0) * (Number(formData.sheetsPerUnit) || 0);
    const purchaseTotal = totalSheets * (Number(formData.buyPricePerSheet) || 0);
    const sellingTotal = totalSheets * (Number(formData.sellPricePerSheet) || 0);
    const income = sellingTotal - purchaseTotal;
    return { totalSheets, purchaseTotal, sellingTotal, income };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">إدارة المشتريات والواردات</h3>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">البوابة الرئيسية لتسجيل بضائع جديدة للمخزن</p>
        </div>
        <button onClick={() => { setIsNewProduct(true); setFormData(initialFormData); setShowModal(true); }} className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-700 transition-all active:scale-95">
          📦 إدخال بضاعة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div onClick={() => { setIsNewProduct(false); setShowModal(true); }} className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-600 transition-all group border-4 border-dashed border-slate-700">
           <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔄</span>
           <span className="font-black text-xl">تحديث كميات صنف مسبق</span>
        </div>
        
        {goods.slice(0, 5).map(g => (
          <div key={g.id} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:shadow-xl transition-all">
            <h4 className="font-black text-slate-800 text-lg mb-2">{g.name}</h4>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">المخزون الحالي</p>
                <p className="text-2xl font-black text-orange-600">{g.units} <span className="text-xs font-normal opacity-50">ربطة</span></p>
              </div>
              <button onClick={() => { setIsNewProduct(false); setSelectedExistingId(g.id.toString()); setShowModal(true); }} className="bg-white text-slate-900 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm hover:bg-orange-600 hover:text-white transition-all">+</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="bg-[#1e293b] p-8 text-white flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-black tracking-tight">{isNewProduct ? 'إدخال بضاعة جديدة تماماً' : 'تحديث كمية صنف مسبق'}</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl hover:bg-red-500 transition-colors">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <form onSubmit={handleFormSubmit} className="space-y-8">
                  {isNewProduct ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم الصنف</label>
                        <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">التصنيف</label>
                        <input required className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">كود الصنف</label>
                        <input required className="input-field font-mono" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-center block">عدد الربطات</label>
                        <input type="number" required className="input-field text-center text-xl" value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-center block">الألواح لكل ربطة</label>
                        <input type="number" required className="input-field text-center text-xl" value={formData.sheetsPerUnit} onChange={e => setFormData({...formData, sheetsPerUnit: e.target.value})} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center block">سعر شراء اللوح الواحد</label>
                        <input type="number" step="0.01" required className="w-full p-6 bg-rose-50 border border-rose-100 rounded-2xl font-black text-4xl text-center text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none" value={formData.buyPricePerSheet} onChange={e => setFormData({...formData, buyPricePerSheet: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center block">سعر بيع اللوح الواحد</label>
                        <input type="number" step="0.01" required className="w-full p-6 bg-emerald-50 border border-emerald-100 rounded-2xl font-black text-4xl text-center text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.sellPricePerSheet} onChange={e => setFormData({...formData, sellPricePerSheet: e.target.value})} />
                      </div>

                      <div className="col-span-2 bg-[#0f172a] text-white p-8 rounded-[2rem] space-y-4 shadow-2xl mt-4">
                        <div className="flex justify-between items-center">
                            <span className="font-black text-slate-400 uppercase tracking-widest text-xs">إجمالي تكلفة الشراء</span>
                            <span className="text-3xl font-black text-white">{totals.purchaseTotal.toLocaleString()} <span className="text-sm font-normal opacity-50">ج.م</span></span>
                        </div>
                        <div className="h-px bg-white/10 w-full"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-black text-orange-400 uppercase tracking-widest text-xs">الربح المتوقع</span>
                            <span className="text-3xl font-black text-orange-500">{totals.income.toLocaleString()} <span className="text-sm font-normal opacity-50">ج.م</span></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                       <select required className="input-field p-5" value={selectedExistingId} onChange={e => setSelectedExistingId(e.target.value)}>
                          <option value="">-- اختر الصنف من القائمة --</option>
                          {goods.map(g => <option key={g.id} value={g.id}>{g.name} ({g.code})</option>)}
                       </select>
                       <input type="number" placeholder="الكمية المضافة (بالربطة)" className="w-full p-8 bg-slate-50 border rounded-[2.5rem] text-5xl text-center font-black" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} />
                    </div>
                  )}
                  
                  <button type="submit" disabled={isSubmitting} className="w-full btn-primary text-xl py-6 flex items-center justify-center gap-3">
                    {isSubmitting && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>تأكيد عملية الإدخال</span>
                  </button>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
