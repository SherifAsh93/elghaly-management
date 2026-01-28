import React, { useState } from "react";
import { ShoppingCart, Plus, Calendar, Tag, User, Trash2 } from "lucide-react";
import { ProductItem, Purchase, UserRole } from "../types";

interface PurchasesProps {
  inventory: ProductItem[];
  setInventory: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  purchases: Purchase[];
  userRole: UserRole;
  // Added onDeletePurchase to fix TypeScript error in App.tsx
  onDeletePurchase: (id: string) => void;
}

const Purchases: React.FC<PurchasesProps> = ({
  inventory,
  setInventory,
  setPurchases,
  purchases,
  userRole,
  onDeletePurchase,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPurchase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = formData.get("itemId") as string;
    const quantityBundles = Number(formData.get("quantityBundles"));
    const cost = Number(formData.get("cost"));

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      itemId,
      quantityBundles,
      cost,
      date: new Date().toISOString(),
      supplier: formData.get("supplier") as string,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            bundles: item.bundles + quantityBundles,
          };
        }
        return item;
      }),
    );

    setIsModalOpen(false);
  };

  // Using onDeletePurchase from props which handles API call and state update
  const handleDelete = (id: string) => {
    onDeletePurchase(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-800">
          سجل المشتريات والتوريد
        </h2>
        {userRole === UserRole.ADMIN && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl active:scale-95 font-black"
          >
            <Plus size={20} />
            توريد بضاعة جديدة
          </button>
        )}
      </div>

      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
            <tr>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                الصنف
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                الكمية
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                التكلفة
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                المورد
              </th>
              {userRole === UserRole.ADMIN && (
                <th className="px-6 py-5 font-black uppercase tracking-wider text-center">
                  الإجراء
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => {
              const item = inventory.find((i) => i.id === purchase.itemId);
              return (
                <tr
                  key={purchase.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {new Date(purchase.date).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800">
                    {item?.name || "صنف محذوف"}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">
                    {purchase.quantityBundles} ربطة
                  </td>
                  <td className="px-6 py-4 font-black text-orange-600">
                    {purchase.cost.toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold">
                    {purchase.supplier}
                  </td>
                  {userRole === UserRole.ADMIN && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {purchases.map((purchase) => {
          const item = inventory.find((i) => i.id === purchase.itemId);
          return (
            <div
              key={purchase.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">
                      {item?.name || "صنف محذوف"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {new Date(purchase.date).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>
                {userRole === UserRole.ADMIN && (
                  <button
                    onClick={() => handleDelete(purchase.id)}
                    className="text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="font-black text-orange-600">
                {purchase.cost.toLocaleString()} ج.م
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Purchases;
