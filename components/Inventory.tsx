import React, { useState, useEffect } from "react";
import { type Good, type Client } from "../lib/types";

interface InventoryProps {
  isAdmin: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ isAdmin }) => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedItem, setSelectedItem] = useState<Good | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [sellData, setSellData] = useState({
    quantity: 1,
    isBundle: true,
    clientId: "",
  });
  const [editData, setEditData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goodsRes, clientsRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/clients"),
      ]);
      const gData = await goodsRes.json();
      const cData = await clientsRes.json();
      setGoods(Array.isArray(gData) ? gData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !sellData.clientId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedItem.id, ...sellData }),
      });
      if (res.ok) {
        alert("✅ تمت عملية البيع بنجاح");
        setShowSellModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert("❌ خطأ: " + err.error);
      }
    } catch (err) {
      alert("❌ فشل الاتصال");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        alert("✅ تم تعديل البيانات بنجاح");
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      alert("❌ فشل التعديل");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = goods.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search and Header Section */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-right">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            جرد المخزن الفعلي
          </h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
            متابعة الأصناف المتاحة والبيع المباشر
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <input
            placeholder="ابحث باسم الصنف أو الكود..."
            className="w-full p-5 pr-14 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:ring-4 focus:ring-orange-500/10 font-black text-lg transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-20">
            🔍
          </span>
        </div>
      </div>

      {/* Main Grid for Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 animate-pulse tracking-widest">
              جاري تحديث قائمة المخزن...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
            <span className="text-6xl block mb-4 grayscale opacity-20">📦</span>
            <p className="font-black text-slate-300 text-xl uppercase tracking-widest">
              المخزن لا يحتوي على هذا الصنف
            </p>
            <p className="text-sm text-slate-400 mt-2">
              تأكد من كتابة الاسم بشكل صحيح أو أضف صنفاً جديداً من تبويب
              المشتريات
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white group rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              {/* Top Badge */}
              <div className="flex justify-between items-start mb-6">
                <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-[10px] font-black font-mono tracking-widest border border-orange-100 uppercase">
                  {item.code}
                </span>
                <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                  {item.thickness}mm
                </span>
              </div>

              {/* Product Title */}
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                  {item.type || "خشب مستورد"}
                </p>
              </div>

              {/* Stock Count - The "Hero" of the card */}
              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 shadow-inner group-hover:bg-orange-50/50 group-hover:border-orange-100 transition-colors">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      الرصيد المتاح
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">
                        {item.units}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        ربطة
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                      السعر / لوح
                    </p>
                    <span className="text-lg font-black text-emerald-600">
                      {item.sellPricePerSheet}{" "}
                      <small className="text-[9px] font-normal">ج.م</small>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setSellData({ quantity: 1, isBundle: true, clientId: "" });
                    setShowSellModal(true);
                  }}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-slate-900/10 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>🛒</span> بيع سريع
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setEditData(item);
                      setShowEditModal(true);
                    }}
                    className="w-14 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                  >
                    ⚙️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sell Modal - Redesigned */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl space-y-8 animate-in zoom-in-95 border border-white/20">
            <div className="text-center">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full uppercase tracking-widest mb-6 inline-block">
                تسجيل فاتورة بيع
              </span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {selectedItem.name}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest font-mono">
                {selectedItem.code}
              </p>
            </div>

            <form onSubmit={handleSellSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                  اختيار العميل
                </label>
                <select
                  required
                  className="input-field appearance-none"
                  value={sellData.clientId}
                  onChange={(e) =>
                    setSellData({ ...sellData, clientId: e.target.value })
                  }
                >
                  <option value="">-- اضغط للاختيار من القائمة --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === "Cash" ? "كاش" : "آجل"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex bg-slate-100 p-2 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSellData({ ...sellData, isBundle: true })}
                  className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${
                    sellData.isBundle
                      ? "bg-slate-900 text-white shadow-xl"
                      : "text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  بالربطة
                </button>
                <button
                  type="button"
                  onClick={() => setSellData({ ...sellData, isBundle: false })}
                  className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${
                    !sellData.isBundle
                      ? "bg-slate-900 text-white shadow-xl"
                      : "text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  باللوح
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block mb-2">
                  الكمية المطلوبة ({sellData.isBundle ? "ربطة" : "لوح"})
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-8 text-6xl font-black text-center bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-orange-600"
                  value={sellData.quantity}
                  onChange={(e) =>
                    setSellData({
                      ...sellData,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex justify-between items-center shadow-inner">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  المبلغ المستحق
                </span>
                <span className="text-4xl font-black text-emerald-800">
                  {(
                    (sellData.isBundle
                      ? selectedItem.sellPricePerSheet *
                        selectedItem.sheetsPerUnit
                      : selectedItem.sellPricePerSheet) * sellData.quantity
                  ).toLocaleString()}{" "}
                  <span className="text-xs font-normal">ج.م</span>
                </span>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "تأكيد وحفظ الفاتورة"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="w-full text-slate-400 font-bold hover:text-rose-500 transition-colors py-2"
                >
                  تراجع عن العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Improved Grid */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl animate-in zoom-in-95 border border-white/20">
            <div className="mb-10 text-center">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                تعديل مواصفات الصنف
              </h3>
              <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest font-mono">
                {selectedItem.code}
              </p>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                    اسم الصنف التجاري
                  </label>
                  <input
                    className="input-field"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest mr-2">
                    سعر البيع الجديد / لوح
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-4 bg-orange-50 border border-orange-100 rounded-2xl font-black text-2xl text-orange-700 outline-none focus:ring-2 focus:ring-orange-500"
                    value={editData.sellPricePerSheet}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        sellPricePerSheet: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                    السماكة (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={editData.thickness}
                    onChange={(e) =>
                      setEditData({ ...editData, thickness: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-900 text-white py-6 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "تحديث البيانات"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-50 text-slate-400 py-6 rounded-2xl font-black hover:bg-slate-100 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
