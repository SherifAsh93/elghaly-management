import React, { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Eye,
  MinusCircle,
  Search,
  User,
  CreditCard,
  Edit2,
} from "lucide-react";
import { ProductItem, Client, Sale, SaleItem, UserRole } from "../../types";
import { formatCurrency } from "../../utils/calculations";

interface SalesManagerProps {
  products: ProductItem[];
  clients: Client[];
  onAddSale: (sale: Omit<Sale, "id" | "date">) => void;
  onDeleteSale: (id: string) => void;
  sales: Sale[];
  role: UserRole;
}

const SalesManager: React.FC<SalesManagerProps> = ({
  products,
  clients,
  onAddSale,
  onDeleteSale,
  sales,
  role,
}) => {
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [prodSearch, setProdSearch] = useState("");
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const isAdmin = role === "ADMIN";

  const totalBeforeDiscount = cart.reduce((a, b) => a + b.totalPrice, 0);
  const finalAmount = Math.max(
    0,
    totalBeforeDiscount - parseFloat(discount || "0"),
  );

  const addToCart = (p: ProductItem) => {
    if (cart.find((x) => x.productId === p.id)) return;
    setCart([
      ...cart,
      {
        productId: p.id,
        productName: p.name,
        bundlesQuantity: 1,
        boardsQuantity: 0,
        boardsPerBundle: p.boardsPerBundle,
        unitPrice: p.sellPrice,
        totalPrice: p.boardsPerBundle * p.sellPrice,
      },
    ]);
  };

  const updateCartItem = (idx: number, bundles: number, boards: number) => {
    const newCart = [...cart];
    const item = newCart[idx];
    item.bundlesQuantity = bundles;
    item.boardsQuantity = boards;
    item.totalPrice =
      (bundles * item.boardsPerBundle + boards) * item.unitPrice;
    setCart(newCart);
  };

  const handleCompleteSale = () => {
    if (!selectedClient || cart.length === 0)
      return alert("يرجى اختيار العميل وإضافة أصناف");
    const c = clients.find((x) => x.id === selectedClient);
    onAddSale({
      clientId: selectedClient,
      clientName: c?.name || "عميل",
      items: cart,
      totalAmount: totalBeforeDiscount,
      discount: parseFloat(discount || "0"),
      finalAmount: finalAmount,
      paidAmount: parseFloat(paidAmount || "0"),
      status: parseFloat(paidAmount || "0") >= finalAmount ? "PAID" : "PARTIAL",
    });
    setIsNewSaleOpen(false);
    setCart([]);
    setSelectedClient("");
    setDiscount("0");
    setPaidAmount("0");
  };

  const viewSale = (sale: Sale) => {
    setViewingSale(sale);
  };

  const editSale = (sale: Sale) => {
    setEditingSale(sale);
    setSelectedClient(sale.clientId);
    setCart(sale.items);
    setDiscount(sale.discount.toString());
    setPaidAmount(sale.paidAmount.toString());
    setIsNewSaleOpen(true);
  };

  const updateSale = () => {
    if (!editingSale) return;
    const c = clients.find((x) => x.id === selectedClient);
    // This would need an onUpdateSale prop to work properly
    // For now, we'll just close the modal
    setEditingSale(null);
    setIsNewSaleOpen(false);
    setCart([]);
    setSelectedClient("");
    setDiscount("");
    setPaidAmount("");
  };

  const closeNewSale = () => {
    setIsNewSaleOpen(false);
    setCart([]);
    setSelectedClient("");
    setDiscount("");
    setPaidAmount("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800">سجل المبيعات</h2>
          <p className="text-slate-400 text-sm font-bold">
            متابعة الفواتير وعمليات البيع اليومية
          </p>
        </div>
        <button
          onClick={() => setIsNewSaleOpen(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-orange-700 shadow-sm transition-all"
        >
          <Plus size={14} />
          فاتورة جديدة
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm compact-table">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-sm">
            <tr>
              <th>التاريخ</th>
              <th>اسم العميل</th>
              <th className="text-center">الأصناف</th>
              <th>الصافي</th>
              <th className="text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="font-mono text-slate-400 text-xs">
                  {new Date(s.date).toLocaleDateString("ar-EG")}
                </td>
                <td className="font-bold text-slate-700 text-sm">
                  {s.clientName}
                </td>
                <td className="text-center">
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">
                    {s.items.length} صنف
                  </span>
                </td>
                <td className="font-black text-slate-900 text-sm">
                  {formatCurrency(s.finalAmount)}
                </td>
                <td className="flex justify-center gap-1">
                  <button
                    onClick={() => viewSale(s)}
                    className="p-1.5 text-slate-300 hover:text-orange-600 rounded-md"
                  >
                    <Eye size={14} />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => editSale(s)}
                        className="p-1.5 text-slate-300 hover:text-blue-600 rounded-md"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSale(s.id)}
                        className="p-1.5 text-slate-200 hover:text-red-500 rounded-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isNewSaleOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white w-full max-w-5xl h-screen md:h-[90vh] md:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                إصدار فاتورة بيع
              </h3>
              <button
                onClick={() => setIsNewSaleOpen(false)}
                className="p-1.5 text-slate-300 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden border-l border-slate-50">
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      العميل
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold outline-none focus:border-orange-500 text-xs"
                    >
                      <option value="">-- اختر العميل --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      البحث عن صنف
                    </label>
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <input
                        type="text"
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-100 rounded-lg font-bold outline-none focus:bg-white text-xs"
                        placeholder="اسم الخشب..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-black text-sm">
                            {item.productName}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {formatCurrency(item.unitPrice)} / لوح
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">الإجمالي</div>
                          <div className="font-black text-emerald-600 text-sm">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">
                              ربطة
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.bundlesQuantity}
                              onChange={(e) =>
                                updateCartItem(
                                  idx,
                                  parseFloat(e.target.value || "0"),
                                  item.boardsQuantity,
                                )
                              }
                              className="w-14 bg-white border border-slate-300 p-2 rounded-lg text-center font-bold text-sm outline-none focus:border-emerald-400 transition-colors"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">
                              لوح
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.boardsQuantity}
                              onChange={(e) =>
                                updateCartItem(
                                  idx,
                                  item.bundlesQuantity,
                                  parseFloat(e.target.value || "0"),
                                )
                              }
                              className="w-14 bg-white border border-slate-300 p-2 rounded-lg text-center font-bold text-sm outline-none focus:border-emerald-400 transition-colors"
                            />
                          </div>
                          <div className="text-xs text-slate-400 font-medium">
                            ={" "}
                            {item.bundlesQuantity * item.boardsPerBundle +
                              item.boardsQuantity}{" "}
                            لوح
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setCart(cart.filter((_, i) => i !== idx))
                          }
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 transition-all p-2 rounded-lg"
                          title="حذف من السلة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <ShoppingCart size={32} />
                      <p className="text-[10px] font-bold mt-2">السلة فارغة</p>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white space-y-4 shrink-0 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                        <span>الخصم</span>
                        {parseFloat(discount || "0") > 0 && (
                          <span className="text-orange-400 text-xs">
                            (
                            {(
                              (parseFloat(discount || "0") /
                                totalBeforeDiscount) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={totalBeforeDiscount}
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-bold outline-none text-sm text-center focus:border-orange-400 focus:bg-orange-400/10 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                        المدفوع
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="w-full p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl font-bold outline-none text-sm text-center text-emerald-400 focus:border-emerald-400 focus:bg-emerald-400/20 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {parseFloat(discount || "0") > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-center">
                      <div className="text-xs text-orange-400 font-medium">
                        تم تطبيق خصم
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end pt-3 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        إجمالي الفاتورة
                      </span>
                      <span className="font-bold text-sm text-white/80">
                        {formatCurrency(totalBeforeDiscount)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                        الصافي النهائي
                      </span>
                      <span className="font-black text-2xl text-orange-500 leading-none">
                        {formatCurrency(finalAmount)}
                      </span>
                      {parseFloat(paidAmount || "0") > 0 && (
                        <span className="text-xs text-emerald-400 font-medium">
                          مدفوع: {formatCurrency(parseFloat(paidAmount || "0"))}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleCompleteSale}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                  >
                    <CheckCircle2 size={18} /> اعتماد وحفظ الفاتورة
                  </button>
                </div>
              </div>

              <div className="w-64 bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex flex-col gap-3 overflow-hidden border border-slate-200 rounded-xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingCart size={12} />
                  الأصناف المتاحة
                </h4>
                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {products
                    .filter((p) => p.name.includes(prodSearch))
                    .map((p) => {
                      const totalBoards =
                        p.bundles * p.boardsPerBundle + p.remainingBoards;
                      const isInCart = cart.find(
                        (item) => item.productId === p.id,
                      );

                      return (
                        <button
                          key={p.id}
                          onClick={() => !isInCart && addToCart(p)}
                          disabled={isInCart}
                          className={`w-full text-right p-3 rounded-lg border transition-all group ${
                            isInCart
                              ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                              : "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50"
                          }`}
                          title={
                            isInCart
                              ? "المنتج موجود بالفعل في السلة"
                              : "إضافة للسلة"
                          }
                        >
                          <div className="text-slate-700 font-bold text-[11px] mb-1">
                            {p.name}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[9px] font-mono">
                              {p.code}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">
                                {totalBoards} لوح
                              </span>
                              <span className="text-emerald-600 text-[10px] font-black">
                                {formatCurrency(p.sellPrice)}
                              </span>
                            </div>
                          </div>
                          {isInCart && (
                            <div className="text-xs text-orange-500 font-medium mt-1">
                              ✓ في السلة
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Sale Modal */}
      {viewingSale && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setViewingSale(null)}
              className="absolute left-4 top-4 text-slate-300 hover:text-red-500"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold mb-6">تفاصيل الفاتورة</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    التاريخ
                  </label>
                  <div className="p-2 bg-slate-50 rounded">
                    {new Date(viewingSale.date).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    العميل
                  </label>
                  <div className="p-2 bg-slate-50 rounded">
                    {viewingSale.clientName}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  الأصناف
                </label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2">الصنف</th>
                        <th className="p-2">الربط</th>
                        <th className="p-2">اللوح</th>
                        <th className="p-2">السعر</th>
                        <th className="p-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingSale.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="p-2">{item.productName}</td>
                          <td className="p-2 text-center">
                            {item.bundlesQuantity}
                          </td>
                          <td className="p-2 text-center">
                            {item.boardsQuantity}
                          </td>
                          <td className="p-2">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="p-2 font-bold">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    المبلغ الإجمالي
                  </label>
                  <div className="p-2 bg-slate-50 rounded font-bold text-emerald-600">
                    {formatCurrency(viewingSale.totalAmount)}
                  </div>
                </div>
                {viewingSale.discount > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      الخصم
                    </label>
                    <div className="p-2 bg-slate-50 rounded font-bold text-red-600">
                      {formatCurrency(viewingSale.discount)}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    الصافي
                  </label>
                  <div className="p-2 bg-slate-50 rounded font-bold text-blue-600">
                    {formatCurrency(viewingSale.finalAmount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    المبلغ المدفوع
                  </label>
                  <div className="p-2 bg-slate-50 rounded">
                    {formatCurrency(viewingSale.paidAmount)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    المبلغ المتبقي
                  </label>
                  <div className="p-2 bg-slate-50 rounded font-bold text-orange-600">
                    {formatCurrency(
                      Math.max(
                        0,
                        viewingSale.finalAmount - viewingSale.paidAmount,
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    الحالة
                  </label>
                  <div className="p-2 bg-slate-50 rounded">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        viewingSale.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {viewingSale.status === "PAID"
                        ? "مدفوع بالكامل"
                        : "مدفوع جزئياً"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManager;
