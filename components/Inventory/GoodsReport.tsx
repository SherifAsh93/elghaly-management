import React from "react";
import { Printer, FileText, Box, Package } from "lucide-react";
import { ProductItem } from "../../types";
import {
  formatStockDisplay,
  getTotalBoards,
  formatCurrency,
} from "../../utils/calculations";

const GoodsReport: React.FC<{ products: ProductItem[] }> = ({ products }) => {
  // Calculate totals
  const totalBundles = products.reduce(
    (sum, p) => sum + Math.abs(p.bundles || 0),
    0,
  );
  const totalRemainingBoards = products.reduce(
    (sum, p) => sum + Math.abs(p.remainingBoards || 0),
    0,
  );
  const totalValue = products.reduce(
    (sum, p) => sum + getTotalBoards(p) * p.sellPrice,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FileText className="text-orange-600" size={32} /> تقرير البضاعة
            الحالي
          </h2>
          <p className="text-slate-500 font-bold mt-1">
            عرض مختصر للكميات المتوفرة بالمخزن
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all active:scale-95 text-lg"
        >
          <Printer size={22} /> طباعة التقرير
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 no-print">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                إجمالي الربط
              </p>
              <p className="text-3xl font-black text-blue-900">
                {totalBundles}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Box className="text-white" size={24} />
            </div>
            <div>
              <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
                إجمالي الألواح
              </p>
              <p className="text-3xl font-black text-emerald-900">
                {totalRemainingBoards}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <p className="text-purple-600 font-bold text-sm uppercase tracking-wider">
                القيمة الإجمالية
              </p>
              <p className="text-3xl font-black text-purple-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest">
                اسم الصنف
              </th>
              <th className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest text-center">
                الكود
              </th>
              <th className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest text-center">
                الكمية الحالية
              </th>
              <th className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest text-center">
                إجمالي الألواح
              </th>
              <th className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest text-left">
                سعر الوحدة
              </th>
              <th className="px-10 py-8 text-sm font-black text-slate-400 uppercase tracking-widest text-left">
                القيمة الإجمالية
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.length > 0 ? (
              products.map((p) => {
                const totalBoards = getTotalBoards(p);
                const totalValue = totalBoards * p.sellPrice;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                          <Box size={20} />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 text-xl">
                            {p.name}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {p.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-black tracking-widest uppercase border border-slate-200">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-2xl font-[1000] text-slate-900">
                          {formatStockDisplay(p)}
                        </span>
                        <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                          ({p.boardsPerBundle} لوح لكل ربطة)
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xl font-black text-slate-900">
                        {Math.abs(totalBoards)}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-left">
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(p.sellPrice)}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-left">
                      <span className="text-lg font-black text-emerald-600">
                        {formatCurrency(totalValue)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-10 py-32 text-center">
                  <p className="text-slate-300 font-black text-2xl italic">
                    المخزن فارغ حالياً
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Print Summary Footer */}
      <div className="hidden print:block">
        <div className="border-t-2 border-slate-300 pt-6 mt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-600 font-bold">إجمالي الربط</p>
              <p className="text-2xl font-black text-slate-900">
                {totalBundles} ربطة
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-bold">إجمالي الألواح</p>
              <p className="text-2xl font-black text-slate-900">
                {totalRemainingBoards} لوح
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-bold">
                القيمة الإجمالية
              </p>
              <p className="text-2xl font-black text-slate-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>
        <div className="text-center pt-8 border-t mt-8">
          <p className="text-slate-900 font-black text-lg">
            الغالي لتوريدات الأخشاب - تقرير مخزن بتاريخ{" "}
            {new Date().toLocaleDateString("ar-EG")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoodsReport;
