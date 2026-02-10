
import React, { useState } from 'react';
import { Plus, Trash2, Box, CheckCircle2, X, Truck, Search, DollarSign } from 'lucide-react';
import { Purchase, UserRole, ProductItem } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface PurchaseManagerProps { 
  purchases: Purchase[]; 
  products: ProductItem[]; 
  onAddPurchase: (p: Omit<Purchase, 'id' | 'date'>, updateStock: boolean) => void; 
  onDeletePurchase: (id: string) => void; 
  role: UserRole; 
}

const PurchaseManager: React.FC<PurchaseManagerProps> = ({ purchases, products, onAddPurchase, onDeletePurchase, role }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [updateStock, setUpdateStock] = useState(true);

  const isAdmin = role === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !selectedProductId || !quantity || !unitPrice) return alert('يرجى ملء جميع البيانات');
    
    const product = products.find(p => p.id === selectedProductId);
    
    onAddPurchase({
      supplierName,
      productId: selectedProductId,
      itemName: product?.name || 'صنف غير معروف',
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      totalPrice: parseFloat(quantity) * parseFloat(unitPrice)
    }, updateStock);

    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSupplierName('');
    setSelectedProductId('');
    setQuantity('');
    setUnitPrice('');
    setUpdateStock(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">سجل مشتريات الأخشاب</h2>
          <p className="text-slate-500 text-sm font-bold mt-1">تتبع التوريدات الواردة من الموردين وأسعار الشراء</p>
        </div>
        {isAdmin && (
          <button 
            onClick={()=>setIsAddModalOpen(true)} 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all active:scale-95 text-lg"
          >
            <Plus size={22}/>تسجيل فاتورة توريد
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-sm font-black text-slate-400 uppercase border-b">
            <tr>
              <th className="px-6 py-5">التاريخ</th>
              <th className="px-6 py-5">المورد</th>
              <th className="px-6 py-5">الصنف المورد</th>
              <th className="px-6 py-5">الكمية (ربطة)</th>
              <th className="px-6 py-5">سعر الربطة</th>
              <th className="px-6 py-5">إجمالي الفاتورة</th>
              {isAdmin && <th className="px-6 py-5 text-center">إجراء</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {purchases.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 text-sm font-bold text-slate-400">
                  {new Date(p.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-5">
                  <span className="font-black text-slate-900 text-base">{p.supplierName}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-orange-500" />
                    <span className="font-bold text-slate-700">{p.itemName}</span>
                  </div>
                </td>
                <td className="px-6 py-5 font-black text-slate-900">{p.quantity}</td>
                <td className="px-6 py-5 text-slate-500 font-bold">{formatCurrency(p.unitPrice)}</td>
                <td className="px-6 py-5 font-black text-orange-600 text-base">{formatCurrency(p.totalPrice)}</td>
                <td className="px-6 py-5 text-center">
                  {isAdmin && (
                    <button onClick={()=>onDeletePurchase(p.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={20}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center font-black text-slate-300 text-lg">
                  لا توجد سجلات توريد مسجلة حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh]">
            <button onClick={()=>setIsAddModalOpen(false)} className="absolute left-6 top-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
              <X size={28}/>
            </button>
            <div className="mb-8 text-right">
              <h3 className="text-2xl font-[1000] text-slate-900 flex items-center gap-2 justify-end">
                تسجيل فاتورة مشتريات جديدة <Truck size={28} className="text-orange-600" />
              </h3>
              <p className="text-slate-500 font-bold mt-1">تحديث المخزون وتسجيل تكاليف الشراء من المورد</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">اسم المورد</label>
                <input required type="text" value={supplierName} onChange={e=>setSupplierName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all text-base text-right" placeholder="اسم الشركة أو المورد" />
              </div>

              <div>
                <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">اختر الصنف من المخزن</label>
                <select required value={selectedProductId} onChange={e=>setSelectedProductId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all text-base text-right appearance-none">
                  <option value="">-- اختر الصنف --</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">الكمية (ربطة)</label>
                  <input required type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-black outline-none transition-all text-xl text-center" placeholder="0" />
                </div>
                <div>
                  <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">سعر شراء الربطة</label>
                  <input required type="number" step="0.01" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} className="w-full px-6 py-4 bg-red-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-black outline-none transition-all text-xl text-red-600 text-center" placeholder="0.00" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <span className="font-black text-slate-600 text-sm">تحديث رصيد المخزن تلقائياً؟</span>
                <button 
                  type="button" 
                  onClick={()=>setUpdateStock(!updateStock)}
                  className={`w-14 h-8 rounded-full relative transition-all ${updateStock ? 'bg-orange-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${updateStock ? 'right-7' : 'right-1'}`}></div>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-slate-400 font-black text-sm uppercase">إجمالي الفاتورة</span>
                 <span className="text-3xl font-[1000] text-orange-600">{formatCurrency(parseFloat(quantity || '0') * parseFloat(unitPrice || '0'))}</span>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                <CheckCircle2 size={24}/>اعتماد فاتورة التوريد
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManager;
