import React, { useState } from "react";
import {
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  X,
  Eye,
} from "lucide-react";
import { Client, Sale, ClientPayment, UserRole } from "../../types";
import { formatCurrency } from "../../utils/calculations";

interface CustomerPaymentHistoryProps {
  client: Client;
  sales: Sale[];
  payments: ClientPayment[];
  onClose: () => void;
  role: UserRole;
}

const CustomerPaymentHistory: React.FC<CustomerPaymentHistoryProps> = ({
  client,
  sales,
  payments,
  onClose,
  role,
}) => {
  const [selectedTab, setSelectedTab] = useState<"sales" | "payments">("sales");

  // Filter sales and payments for this client
  const clientSales = sales.filter((sale) => sale.clientId === client.id);
  const clientPayments = payments.filter(
    (payment) => payment.clientId === client.id,
  );

  // Calculate totals
  const totalSales = clientSales.reduce(
    (sum, sale) => sum + sale.finalAmount,
    0,
  );
  const totalPaid = clientPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const currentBalance = totalSales - totalPaid;

  const isAdmin = role === "ADMIN";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl relative border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-t-3xl border-b border-slate-200">
          <button
            onClick={onClose}
            className="absolute left-6 top-6 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-800">
                  {client.name}
                </h2>
                <span
                  className={`px-2 py-1 text-xs font-black rounded-full ${
                    client.type === "CASH"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {client.type === "CASH" ? "كاش" : "بالآجل"}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                {client.phone}
              </p>
              <p className="text-slate-400 text-xs">{client.address}</p>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <TrendingUp size={14} />
                إجمالي المبيعات
              </div>
              <div className="text-xl font-black text-slate-800">
                {formatCurrency(totalSales)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium mb-1">
                <DollarSign size={14} />
                إجمالي المدفوع
              </div>
              <div className="text-xl font-black text-emerald-600">
                {formatCurrency(totalPaid)}
              </div>
            </div>

            <div
              className={`rounded-xl p-4 border ${currentBalance > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-medium mb-1 ${currentBalance > 0 ? "text-red-500" : "text-emerald-500"}`}
              >
                <TrendingDown size={14} />
                الرصيد الحالي
              </div>
              <div
                className={`text-xl font-black ${currentBalance > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                {formatCurrency(currentBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSelectedTab("sales")}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${
              selectedTab === "sales"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            سجل المبيعات ({clientSales.length})
          </button>
          <button
            onClick={() => setSelectedTab("payments")}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${
              selectedTab === "payments"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            سجل المدفوعات ({clientPayments.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "400px" }}>
          {selectedTab === "sales" ? (
            <div className="space-y-3">
              {clientSales.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Eye size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">لا توجد مبيعات لهذا العميل</p>
                </div>
              ) : (
                clientSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-500">
                            {new Date(sale.date).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {sale.items.length} أصناف
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-800">
                          {formatCurrency(sale.finalAmount)}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            sale.status === "PAID"
                              ? "bg-emerald-100 text-emerald-700"
                              : sale.status === "PARTIAL"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sale.status === "PAID"
                            ? "مدفوع بالكامل"
                            : sale.status === "PARTIAL"
                              ? "مدفوع جزئي"
                              : "غير مدفوع"}
                        </div>
                      </div>
                    </div>

                    {sale.paidAmount > 0 && (
                      <div className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">
                        المدفوع: {formatCurrency(sale.paidAmount)} | المتبقي:{" "}
                        {formatCurrency(sale.finalAmount - sale.paidAmount)}
                      </div>
                    )}

                    <div className="mt-2 space-y-1">
                      {sale.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-600 flex justify-between"
                        >
                          <span>{item.productName}</span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {clientPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <DollarSign size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">لا توجد مدفوعات لهذا العميل</p>
                </div>
              ) : (
                clientPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-emerald-50 rounded-xl p-4 border border-emerald-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-emerald-500" />
                          <span className="text-sm text-slate-600">
                            {new Date(payment.date).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        {payment.note && (
                          <div className="text-xs text-slate-500 mt-1">
                            ملاحظة: {payment.note}
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-black text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentHistory;
