import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Printer,
  PieChart,
  Activity,
  ShoppingCart,
  UserCheck,
  Wallet,
} from "lucide-react";
import { AppState } from "../../types";
import { formatCurrency } from "../../utils/calculations";
import Logo from "../shared/Logo";

const ReportManager: React.FC<{ state: AppState }> = ({ state }) => {
  const totalSales = state.sales.reduce((a, b) => a + b.finalAmount, 0);
  const totalPurchases = state.purchases.reduce((a, b) => a + b.totalPrice, 0);
  const totalEmployeeAdvances = state.employees.reduce(
    (a, b) => a + b.advances,
    0,
  );
  const totalGeneralExpenses = state.expenses.reduce((a, b) => a + b.amount, 0);
  const totalSalaries = state.employees.reduce(
    (a, b) => a + b.monthlySalary - b.advances,
    0,
  );

  // Total Operational Costs = General Expenses + Employee Masrofaat (Advances) + Salaries + Purchases
  const totalExpenses =
    totalGeneralExpenses +
    totalEmployeeAdvances +
    totalSalaries +
    totalPurchases;
  const netProfit = totalSales - totalExpenses;

  return (
    <div className="space-y-12 pb-20 no-print">
      <div className="bg-white p-10 sm:p-14 rounded-[4rem] border shadow-2xl space-y-12">
        <div className="flex justify-between items-center border-b pb-12">
          <div>
            <Logo
              size="xl"
              height="h-25"
              width="w-60"
              className="scale-x-120"
              showImage={false}
            />
            <h2 className="text-4xl font-black mt-6 flex items-center gap-4">
              <PieChart className="text-orange-600" size={36} />
              التقرير المالي التحليلي
            </h2>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-lg"
          >
            <Printer size={24} />
            طباعة التقرير بالكامل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <ShoppingCart size={20} />{" "}
              <span className="text-xs uppercase font-black tracking-widest">
                إجمالي المبيعات
              </span>
            </div>
            <h4 className="text-2xl font-black text-emerald-700">
              {formatCurrency(totalSales)}
            </h4>
          </div>
          <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <TrendingDown size={20} />{" "}
              <span className="text-xs uppercase font-black tracking-widest">
                المشتريات
              </span>
            </div>
            <h4 className="text-2xl font-black text-orange-700">
              {formatCurrency(totalPurchases)}
            </h4>
          </div>
          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Wallet size={20} />{" "}
              <span className="text-xs uppercase font-black tracking-widest">
                المصروفات والأجور
              </span>
            </div>
            <h4 className="text-2xl font-black text-red-700">
              {formatCurrency(
                totalGeneralExpenses + totalEmployeeAdvances + totalSalaries,
              )}
            </h4>
          </div>
          <div
            className={`p-8 rounded-[2rem] border font-black text-white shadow-xl flex flex-col justify-center ${netProfit >= 0 ? "bg-indigo-600" : "bg-red-600"}`}
          >
            <span className="text-xs uppercase opacity-70 font-black tracking-widest mb-2">
              صافي الربح / الخسارة
            </span>
            <h4 className="text-3xl font-black">{formatCurrency(netProfit)}</h4>
          </div>
        </div>

        <div className="space-y-8 pt-6">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-r-4 border-orange-600 pr-5">
            تفاصيل بنود المصروفات (Key: Value)
          </h3>
          <div className="bg-slate-50 rounded-[3rem] p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
                <span className="font-black text-slate-500 text-lg">
                  إجمالي المصروفات العامة:
                </span>
                <span className="font-black text-red-600 text-xl">
                  {formatCurrency(totalGeneralExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
                <span className="font-black text-slate-500 text-lg">
                  مصروفات الموظفين:
                </span>
                <span className="font-black text-red-600 text-xl">
                  {formatCurrency(totalEmployeeAdvances)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
                <span className="font-black text-slate-500 text-lg">
                  صافي الأجور المستحقة:
                </span>
                <span className="font-black text-red-600 text-xl">
                  {formatCurrency(totalSalaries)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                <span className="font-black text-slate-900 text-xl">
                  إجمالي التكاليف الكلية:
                </span>
                <span className="font-black text-slate-900 text-3xl">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <Activity size={48} />
              </div>
              <div>
                <p className="text-slate-400 font-bold text-lg">
                  معدل صافي الربح الإجمالي
                </p>
                <p className="text-5xl font-black text-indigo-600 mt-2">
                  {totalSales > 0
                    ? ((netProfit / totalSales) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
