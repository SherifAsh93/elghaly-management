import React, { useState } from "react";
import {
  History,
  Search,
  Printer,
  FileText,
  X,
  User,
  Calendar,
  Tag,
  Trash2,
} from "lucide-react";
import { Sale, UserRole } from "../types";

interface SalesHistoryProps {
  sales: Sale[];
  setSales?: React.Dispatch<React.SetStateAction<Sale[]>>;
  userRole?: UserRole;
  // Added onDeleteSale to fix TypeScript error in App.tsx
  onDeleteSale?: (id: string) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({
  sales,
  setSales,
  userRole,
  onDeleteSale,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(
    (sale) =>
      sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Using onDeleteSale from props which handles API call and state update
  const handleDelete = (id: string) => {
    if (onDeleteSale) {
      onDeleteSale(id);
    } else {
      if (
        confirm(
          "هل أنت متأكد من حذف هذه العملية من السجل؟ لن يؤثر هذا على أرصدة المخازن الحالية.",
        )
      ) {
        setSales?.((prev) => prev.filter((s) => s.id !== id));
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="بحث في المبيعات أو رقم الفاتورة..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden no-print">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
            <tr>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                العميل
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                الصنف
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                الكمية
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider">
                الإجمالي
              </th>
              <th className="px-6 py-5 font-black uppercase tracking-wider text-center">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map((sale) => (
              <tr
                key={sale.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-6 py-4 text-sm font-bold text-slate-500">
                  {new Date(sale.date).toLocaleString("ar-EG", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 font-black text-slate-800">
                  {sale.clientName}
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">
                  {sale.itemName}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black">
                    {sale.quantity}{" "}
                    {sale.unitType === "bundle" ? "ربطة" : "لوح"}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-orange-600">
                  {sale.totalPrice.toLocaleString()} ج.م
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="inline-flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all font-black text-xs"
                    >
                      <FileText size={16} />
                      الفاتورة
                    </button>
                    {userRole === UserRole.ADMIN && (
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4 no-print">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 leading-tight">
                    {sale.itemName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                    <Calendar size={10} />{" "}
                    {new Date(sale.date).toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-black text-orange-600">
                  {sale.totalPrice.toLocaleString()} ج.م
                </p>
                {userRole === UserRole.ADMIN && (
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedSale(sale)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm"
            >
              عرض الفاتورة
            </button>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <History size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black">
            لا يوجد عمليات مبيعات مسجلة
          </p>
        </div>
      )}

      {selectedSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h3 className="text-xl font-black text-slate-800">
                معاينة الفاتورة
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-3 text-slate-400 hover:text-slate-600 bg-white rounded-xl border border-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                    غ
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-orange-600">
                      أبناء الغالي
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      للاستيراد والتجارة
                    </p>
                  </div>
                </div>
                <div className="text-right md:text-left w-full md:w-auto">
                  <h4 className="font-black text-slate-800 text-xl mb-1">
                    فاتورة مبيعات
                  </h4>
                  <p className="text-xs text-slate-400 font-bold">
                    رقم: #{selectedSale.invoiceId}
                  </p>
                  <p className="text-xs text-slate-400 font-bold">
                    التاريخ:{" "}
                    {new Date(selectedSale.date).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
              <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">
                  السيد العميل
                </p>
                <p className="text-xl font-black text-slate-800">
                  {selectedSale.clientName}
                </p>
              </div>
              <table className="w-full mb-10">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-right">
                    <th className="py-4 font-black text-sm">الوصف</th>
                    <th className="py-4 font-black text-sm">سعر الوحدة</th>
                    <th className="py-4 font-black text-sm">الكمية</th>
                    <th className="py-4 font-black text-sm text-left">
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-6 font-black text-slate-800">
                      {selectedSale.itemName}
                    </td>
                    <td className="py-6 font-bold text-slate-500">
                      {selectedSale.unitPrice.toLocaleString()} ج.م
                    </td>
                    <td className="py-6 font-bold text-slate-500">
                      {selectedSale.quantity}{" "}
                      {selectedSale.unitType === "bundle" ? "ربطة" : "لوح"}
                    </td>
                    <td className="py-6 text-left font-black text-orange-600 text-xl">
                      {selectedSale.totalPrice.toLocaleString()} ج.م
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="print-only" dir="rtl">
        {selectedSale && (
          <div className="p-10 bg-white min-h-screen text-slate-900 font-['Cairo']">
            <div className="flex justify-between items-start mb-16 border-b-2 border-slate-900 pb-8">
              <div>
                <h2 className="text-4xl font-black text-black mb-2">
                  أبناء الغالي
                </h2>
                <p className="text-slate-600 font-bold">
                  للاستيراد والتجارة المتكاملة
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-black text-2xl mb-1">فاتورة مبيعات</h4>
                <p className="font-bold">رقم: #{selectedSale.invoiceId}</p>
                <p className="font-bold">
                  التاريخ:{" "}
                  {new Date(selectedSale.date).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>
            <table className="w-full mb-16 border-collapse">
              <thead>
                <tr className="border-b-4 border-slate-900 text-right">
                  <th className="py-4 px-2 font-black">الصنف</th>
                  <th className="py-4 px-2 font-black">الكمية</th>
                  <th className="py-4 px-2 font-black text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b-2 border-slate-400">
                  <td className="py-8 px-2 font-black text-xl">
                    {selectedSale.itemName}
                  </td>
                  <td className="py-8 px-2 font-bold">
                    {selectedSale.quantity}{" "}
                    {selectedSale.unitType === "bundle" ? "ربطة" : "لوح"}
                  </td>
                  <td className="py-8 px-2 text-left font-black text-2xl">
                    {selectedSale.totalPrice.toLocaleString()} ج.م
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
