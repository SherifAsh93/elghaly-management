import React, { useState } from "react";
import { Plus, Trash2, Wallet, X, Tag, RefreshCw } from "lucide-react";
import { Expense } from "../../types";
import { formatCurrency } from "../../utils/calculations";

interface ExpenseManagerProps {
  expenses: Expense[];
  onAddExpense: (e: Omit<Expense, "id" | "date">) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - desc:", desc, "amount:", amount);

    if (!desc || !amount) {
      console.log("Validation failed - missing fields");
      return;
    }

    const expenseData = {
      description: desc,
      amount: parseFloat(amount),
    };
    console.log("Calling onAddExpense with:", expenseData);

    try {
      onAddExpense(expenseData);
      console.log("onAddExpense called successfully");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }

    setIsAddOpen(false);
    setDesc("");
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">
            المصروفات العامة (المنصرفات)
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">
            إدارة كافة المصاريف التشغيلية بنظام البنود والقيم
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-lg"
        >
          <Plus size={22} />
          تسجيل بند مصروف
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase">
                التاريخ
              </th>
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase">
                البند (Key)
              </th>
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase">
                القيمة (Value)
              </th>
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase text-center">
                إجراء
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.map((ex) => (
              <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 text-sm font-bold text-slate-400">
                  {new Date(ex.date).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-6 py-5 font-black text-base text-slate-900">
                  {ex.description}
                </td>
                <td className="px-6 py-5 font-black text-red-600 text-lg">
                  {formatCurrency(ex.amount)}
                </td>
                <td className="px-6 py-5 text-center">
                  <button
                    onClick={() => onDeleteExpense(ex.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-20 text-center font-black text-slate-300 text-lg"
                >
                  لا توجد مصروفات مسجلة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl relative border">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute left-6 top-6 text-slate-400 hover:text-red-500"
            >
              <X size={28} />
            </button>
            <h3 className="text-2xl font-black mb-8 text-right">
              تسجيل بند مصروفات جديد
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-right text-sm font-black text-slate-500 mb-2 uppercase tracking-wider px-1">
                  بند المصروف (Key)
                </label>
                <input
                  required
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-red-500 outline-none font-bold text-base text-right"
                  placeholder="مثلاً: إيجار المخزن"
                />
              </div>
              <div>
                <label className="block text-right text-sm font-black text-slate-500 mb-2 uppercase tracking-wider px-1">
                  القيمة (Value - جنيه)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-5 bg-red-50 rounded-2xl border-2 border-transparent focus:border-red-500 outline-none font-black text-3xl text-red-600 text-center"
                  placeholder="0.00"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-red-700 transition-all mt-4"
              >
                تأكيد وحفظ البند
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
