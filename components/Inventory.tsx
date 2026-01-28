import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MapPin,
  Ruler,
  ShoppingCart,
  Edit,
  Trash2,
  X,
  Layers,
  ListPlus,
  DatabaseBackup,
} from "lucide-react";
import { ProductItem, UserRole } from "../types";

interface InventoryProps {
  inventory: ProductItem[];
  setInventory: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  userRole: UserRole;
  onQuickSale: (item: ProductItem) => void;
  onDeleteItem: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({
  inventory,
  setInventory,
  userRole,
  onQuickSale,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);

  const filteredItems = useMemo(() => {
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString() === searchTerm,
    );
  }, [inventory, searchTerm]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: ProductItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      type: formData.get("type") as string,
      length: Number(formData.get("length")),
      width: Number(formData.get("width")),
      thickness: Number(formData.get("thickness")),
      origin: formData.get("origin") as string,
      bundles: Number(formData.get("bundles")),
      boardsPerBundle: Number(formData.get("boardsPerBundle")),
      buyPrice: Number(formData.get("buyPrice")),
      sellPrice: Number(formData.get("sellPrice")),
    };

    if (editingItem) {
      setInventory((prev) =>
        prev.map((item) => (item.id === editingItem.id ? newItem : item)),
      );
    } else {
      setInventory((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="بحث برقم الصنف ID، الكود أو الاسم..."
            className="w-full pr-12 pl-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 shadow-sm transition-all text-base md:text-lg font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (inventory.length > 0) onQuickSale(inventory[0]);
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-orange-600/20 font-black text-lg active:scale-95"
          >
            <ListPlus size={24} />
            إصدار فاتورة مبيعات
          </button>

          {userRole === UserRole.ADMIN && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/20 font-black text-lg group active:scale-95"
            >
              <Plus
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              إضافة صنف
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {filteredItems.map((item) => {
          const displayBundles = Math.floor(item.bundles);
          const remainderBoards = Math.round(
            (item.bundles - displayBundles) * item.boardsPerBundle,
          );

          return (
            <div
              key={item.id}
              className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group relative flex flex-col md:flex-row min-h-[240px]"
            >
              <div className="bg-slate-50/30 p-8 border-b md:border-b-0 md:border-l border-slate-100 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center bg-orange-600 text-white px-2 py-1 rounded-lg font-black text-[10px] shadow-lg shrink-0">
                      ID:{item.id}
                    </div>
                    <h3 className="font-black text-2xl md:text-3xl text-slate-900 group-hover:text-orange-600 transition-colors break-words leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-black text-white bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-wider">
                      #{item.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      | {item.origin} | {item.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <Ruler size={14} className="text-orange-500" />
                      <p className="text-xs font-black">
                        {item.length}×{item.width}×{item.thickness}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <Layers size={14} className="text-blue-500" />
                      <p className="text-[11px] font-black">
                        {item.boardsPerBundle} لوح/ر
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <MapPin size={14} className="text-amber-500" />
                      <p className="text-[11px] font-black truncate">
                        {item.origin}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  <p className="text-2xl font-black text-slate-900">
                    {item.sellPrice.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      ج.م / لوح
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onQuickSale(item)}
                      className="p-3.5 bg-orange-600 text-white hover:bg-slate-900 rounded-2xl transition-all shadow-lg shadow-orange-600/20"
                      title="إضافة للفاتورة"
                    >
                      <ShoppingCart size={22} />
                    </button>
                    {userRole === UserRole.ADMIN && (
                      <>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-3.5 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                          title="تعديل"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          title="حذف نهائي من السيستم"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 md:w-64 flex flex-col items-center justify-center text-center shadow-lg shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                <p className="text-[11px] text-slate-500 font-black uppercase mb-3 tracking-[0.2em] relative z-10">
                  الرصيد المتبقي
                </p>
                <div className="flex flex-col items-center space-y-3 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-orange-500 tracking-tighter">
                      {displayBundles}
                    </span>
                    <span className="text-xs text-slate-400 font-black uppercase">
                      ربطة
                    </span>
                  </div>
                  {remainderBoards > 0 ? (
                    <div className="pt-3 border-t border-slate-700 w-full flex items-center justify-center gap-2">
                      <span className="text-2xl font-black text-amber-400">
                        {remainderBoards}
                      </span>
                      <span className="text-[10px] text-slate-500 font-black uppercase">
                        لوح مفرد
                      </span>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-700 w-full text-[10px] text-slate-600 font-black uppercase">
                      لا توجد ألواح متبقية
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-slate-200 my-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900">
                {editingItem ? "تعديل بيانات الصنف" : "إضافة صنف جديد"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-red-500 transition-all"
              >
                <X size={28} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">
                  اسم الصنف (العنوان)
                </label>
                <input
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 outline-none font-black text-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase mr-1">
                  الكود
                </label>
                <input
                  name="code"
                  defaultValue={editingItem?.code}
                  required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase mr-1">
                  المنشأ
                </label>
                <input
                  name="origin"
                  defaultValue={editingItem?.origin}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase mr-1">
                  عدد الربطات الحالية
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="bundles"
                  defaultValue={editingItem?.bundles}
                  required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl text-orange-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase mr-1">
                  الألواح في الربطة
                </label>
                <input
                  type="number"
                  name="boardsPerBundle"
                  defaultValue={editingItem?.boardsPerBundle || 50}
                  required
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-black text-slate-700 uppercase mr-1">
                  سعر بيع اللوح الافتراضي
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="sellPrice"
                  defaultValue={editingItem?.sellPrice}
                  required
                  className="w-full p-5 bg-slate-900 text-orange-500 border-none rounded-2xl font-black text-3xl shadow-xl"
                />
              </div>
              <div className="md:col-span-2 pt-6">
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-2xl hover:bg-orange-600 transition-all active:scale-95 shadow-2xl shadow-slate-900/30"
                >
                  {editingItem ? "تحديث بيانات الصنف" : "إضافة الصنف للمخزن"}
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
