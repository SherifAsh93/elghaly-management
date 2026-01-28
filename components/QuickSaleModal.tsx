import React, { useState, useMemo } from "react";
import { ProductItem, Sale, Client } from "../types";
import {
  ShoppingCart,
  User,
  X,
  Calculator,
  Package,
  Coins,
  ArrowRightLeft,
  Plus,
  Trash2,
  ListChecks,
} from "lucide-react";

interface CartItem {
  id: string;
  item: ProductItem;
  quantity: number;
  unitType: "bundle" | "board";
  unitPrice: number;
  total: number;
}

interface QuickSaleModalProps {
  initialItem: ProductItem;
  inventory: ProductItem[];
  clients: Client[];
  onClose: () => void;
  onSales: (sales: Sale[]) => void;
}

const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  initialItem,
  inventory,
  clients,
  onClose,
  onSales,
}) => {
  const [clientName, setClientName] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: Date.now().toString(),
      item: initialItem,
      quantity: 1,
      unitType: "bundle",
      unitPrice: initialItem.sellPrice * initialItem.boardsPerBundle,
      total: initialItem.sellPrice * initialItem.boardsPerBundle,
    },
  ]);

  const addToCart = (product: ProductItem) => {
    const newRow: CartItem = {
      id: Math.random().toString(36).substring(7),
      item: product,
      quantity: 1,
      unitType: "bundle",
      unitPrice: product.sellPrice * product.boardsPerBundle,
      total: product.sellPrice * product.boardsPerBundle,
    };
    setCart((prev) => [...prev, newRow]);
  };

  const removeFromCart = (id: string) => {
    if (cart.length === 1) return;
    setCart((prev) => prev.filter((row) => row.id !== id));
  };

  const updateCartRow = (id: string, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, ...updates };

          if (updates.unitType && !updates.unitPrice) {
            updatedRow.unitPrice =
              updates.unitType === "bundle"
                ? row.item.sellPrice * row.item.boardsPerBundle
                : row.item.sellPrice;
          }

          updatedRow.total = updatedRow.quantity * updatedRow.unitPrice;
          return updatedRow;
        }
        return row;
      }),
    );
  };

  const grandTotal = useMemo(
    () => cart.reduce((acc, row) => acc + row.total, 0),
    [cart],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
      alert("الرجاء كتابة اسم العميل");
      return;
    }

    for (const row of cart) {
      const availableBoards = row.item.bundles * row.item.boardsPerBundle;
      const requestedBoards =
        row.unitType === "bundle"
          ? row.quantity * row.item.boardsPerBundle
          : row.quantity;
      if (requestedBoards > availableBoards) {
        alert(
          `عفواً! الرصيد المتاح من (${row.item.name}) هو ${row.item.bundles.toFixed(2)} ربطة فقط.`,
        );
        return;
      }
    }

    const sales: Sale[] = cart.map((row) => ({
      id: Math.random().toString(36).substring(7),
      invoiceId: "",
      itemId: row.item.id,
      itemName: row.item.name,
      quantity: row.quantity,
      unitType: row.unitType,
      unitPrice: row.unitPrice,
      totalPrice: row.total,
      date: new Date().toISOString(),
      clientName,
    }));

    onSales(sales);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
              <ListChecks size={20} />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              إصدار فاتورة مبيعات جديدة
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-1 uppercase flex items-center gap-2">
                  <User size={12} /> اسم العميل
                </label>
                <div className="relative">
                  <User
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    list="clients-list-quick"
                    placeholder="ابحث أو سجل عميل جديد..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 outline-none font-black text-slate-700 text-lg shadow-inner"
                    required
                  />
                  <datalist id="clients-list-quick">
                    {clients.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex justify-end">
                <select
                  onChange={(e) => {
                    const prod = inventory.find((i) => i.id === e.target.value);
                    if (prod) addToCart(prod);
                    e.target.value = "";
                  }}
                  className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-sm hover:border-orange-200 transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="">+ إضافة صنف آخر للفاتورة</option>
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (متاح {Math.floor(i.bundles)} ربطة +{" "}
                      {Math.round(
                        (i.bundles - Math.floor(i.bundles)) * i.boardsPerBundle,
                      )}{" "}
                      لوح)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-4">الصنف المختارة</div>
                <div className="col-span-2">طريقة البيع</div>
                <div className="col-span-2 text-center">الكمية</div>
                <div className="col-span-2 text-center">السعر</div>
                <div className="col-span-2 text-left">الإجمالي</div>
              </div>

              <div className="space-y-4">
                {cart.map((row) => (
                  <div
                    key={row.id}
                    className="bg-slate-50 md:bg-white p-4 md:p-0 rounded-2xl md:rounded-none border border-slate-100 md:border-0 md:grid md:grid-cols-12 gap-4 items-center group relative"
                  >
                    <div className="col-span-4 mb-4 md:mb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                          <Package size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">
                            {row.item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            متاح: {row.item.bundles.toFixed(2)} ربطة
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 mb-4 md:mb-0">
                      <select
                        value={row.unitType}
                        onChange={(e) =>
                          updateCartRow(row.id, {
                            unitType: e.target.value as "bundle" | "board",
                          })
                        }
                        className="w-full p-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="bundle">بالربطة</option>
                        <option value="board">باللوح</option>
                      </select>
                    </div>

                    <div className="col-span-2 mb-4 md:mb-0">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) =>
                          updateCartRow(row.id, {
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-sm outline-none"
                      />
                    </div>

                    <div className="col-span-2 mb-4 md:mb-0">
                      <div className="relative">
                        <input
                          type="number"
                          value={row.unitPrice}
                          onChange={(e) =>
                            updateCartRow(row.id, {
                              unitPrice: Number(e.target.value),
                            })
                          }
                          className="w-full p-2 bg-white md:bg-orange-50 border border-orange-100 md:border-orange-200 rounded-xl text-center font-black text-sm text-orange-700 outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-between md:justify-end gap-4">
                      <p className="font-black text-slate-900 md:text-left text-lg">
                        {row.total.toLocaleString()}{" "}
                        <span className="text-[10px] font-normal">ج.م</span>
                      </p>
                      {cart.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFromCart(row.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 border-t border-slate-800">
            <div className="text-center md:text-right">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                صافي إجمالي الفاتورة
              </p>
              <p className="text-5xl font-black text-orange-500 leading-none">
                {grandTotal.toLocaleString()}{" "}
                <span className="text-sm font-normal">ج.م</span>
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 md:flex-none px-8 py-5 rounded-2xl font-black text-slate-400 hover:bg-white/5 transition-all"
              >
                إلغاء العملية
              </button>
              <button
                type="submit"
                className="flex-1 md:flex-none bg-orange-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/30 active:scale-95"
              >
                <Calculator size={24} />
                حفظ الفاتورة والبيع
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickSaleModal;
