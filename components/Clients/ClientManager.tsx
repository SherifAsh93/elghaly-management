import React, { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  MapPin,
  Trash2,
  Edit2,
  History,
  DollarSign,
  X,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Client, ClientPayment, Sale, UserRole } from "../../types";
import { formatCurrency } from "../../utils/calculations";
import { api } from "../../services/api";
import CustomerPaymentHistory from "./CustomerPaymentHistory";

interface ClientManagerProps {
  clients: Client[];
  payments: ClientPayment[];
  sales: Sale[];
  onAddPayment: (p: Omit<ClientPayment, "id" | "date">) => void;
  onAddClient: (c: Omit<Client, "id">) => void;
  onUpdateClient: (id: string, c: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
  role: UserRole;
}

const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  payments,
  sales,
  onAddPayment,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  role,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  // Populate form when editing client
  React.useEffect(() => {
    if (selectedClient && isAddClientOpen) {
      setNewClient({
        name: selectedClient.name,
        phone: selectedClient.phone,
        address: selectedClient.address,
        initialDebt: selectedClient.initialDebt,
      });
    }
  }, [selectedClient, isAddClientOpen]);

  const [newClient, setNewClient] = useState<Omit<Client, "id">>({
    name: "",
    phone: "",
    address: "",
    type: "CREDIT",
    balance: 0,
  });

  const isAdmin = role === "ADMIN";

  // Function to calculate client balance
  const calculateClientBalance = (clientId: string) => {
    const clientPayments = payments.filter((p) => p.clientId === clientId);
    const clientSales = sales.filter((s) => s.clientId === clientId);
    const totalClientSales = clientSales.reduce((a, b) => a + b.finalAmount, 0);
    const totalClientPayments = clientPayments.reduce(
      (a, b) => a + b.amount,
      0,
    );
    return totalClientSales - totalClientPayments;
  };

  const clientPayments = payments.filter(
    (p) => p.clientId === selectedClient?.id,
  );
  const clientSales = sales.filter((s) => s.clientId === selectedClient?.id);

  const totalClientSales = clientSales.reduce((a, b) => a + b.finalAmount, 0);
  const totalClientPayments = clientPayments.reduce((a, b) => a + b.amount, 0);
  const calculatedBalance = totalClientSales - totalClientPayments;

  const handlePay = () => {
    if (!selectedClient || !payAmount) return;
    onAddPayment({
      clientId: selectedClient.id,
      amount: parseFloat(payAmount),
      note: payNote,
    });
    setIsPayModalOpen(false);
    setPayAmount("");
    setPayNote("");
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return alert("يرجى إدخال اسم العميل");
    try {
      if (selectedClient) {
        // Edit existing client
        await onUpdateClient(selectedClient.id, newClient);
      } else {
        // Add new client
        await onAddClient(newClient);
      }
      setIsAddClientOpen(false);
      setSelectedClient(null);
      setNewClient({
        name: "",
        phone: "",
        address: "",
        type: "CREDIT",
        balance: 0,
      });
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">
          قاعدة العملاء والمديونيات
        </h2>
        <button
          onClick={() => setIsAddClientOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 text-lg active:scale-95 transition-transform"
        >
          <Plus size={22} />
          إضافة عميل
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border relative shadow-sm">
        <Search
          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          placeholder="بحث باسم العميل أو الهاتف..."
          className="w-full pr-12 pl-4 py-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-sm font-black text-slate-400 uppercase border-b">
            <tr>
              <th className="px-6 py-5">العميل</th>
              <th className="px-6 py-5">العنوان</th>
              <th className="px-6 py-5">الرصيد المالي (المتبقي)</th>
              <th className="px-6 py-5 text-center">كشف حساب</th>
              <th className="px-6 py-5 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients
              .filter((c) =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-base">{c.name}</p>
                        <span
                          className={`px-2 py-1 text-xs font-black rounded-full ${
                            c.type === "CASH"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {c.type === "CASH" ? "كاش" : "بالآجل"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        <Phone size={14} />
                        {c.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {c.address}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-5 font-black text-base ${calculateClientBalance(c.id) < 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {formatCurrency(calculateClientBalance(c.id))}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => {
                        setSelectedClient(c);
                        setIsPaymentHistoryOpen(true);
                      }}
                      className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 mx-auto hover:bg-slate-200 transition-all"
                    >
                      <History size={16} />
                      السجل المالي
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(c);
                          setIsPayModalOpen(true);
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="تسجيل دفعة سداد"
                      >
                        <DollarSign size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(c);
                          setIsAddClientOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600"
                        title="تعديل العميل"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={async () => {
                          // Check if client has related payments or sales
                          const clientPayments = payments.filter(
                            (p) => p.clientId === c.id,
                          );
                          const clientSales = sales.filter(
                            (s) => s.clientId === c.id,
                          );

                          console.log("Client payments:", clientPayments);
                          console.log("Client sales:", clientSales);

                          if (
                            clientPayments.length > 0 ||
                            clientSales.length > 0
                          ) {
                            const details = [];
                            if (clientPayments.length > 0) {
                              details.push(`${clientPayments.length} مدفوعات`);
                            }
                            if (clientSales.length > 0) {
                              details.push(`${clientSales.length} مبيعات`);
                            }

                            const forceDelete = window.confirm(
                              `العميل "${c.name}" مرتبط بـ: ${details.join(" و ")}.\n\n` +
                                `هل تريد الحذف مع حذف جميع المعاملات المرتبطة؟\n` +
                                `(سيتم حذف ${details.join(" و ")} بشكل نهائي)`,
                            );

                            if (!forceDelete) return;

                            try {
                              // Delete related sales first
                              for (const sale of clientSales) {
                                await api.sales.delete(sale.id);
                              }

                              // Delete related payments
                              for (const payment of clientPayments) {
                                await api.payments.delete(payment.id);
                              }

                              // Then delete the client
                              await onDeleteClient(c.id);
                              console.log(
                                "Client and related data deleted successfully",
                              );
                              alert(
                                `تم حذف العميل "${c.name}" وجميع المعاملات المرتبطة بنجاح`,
                              );
                            } catch (error) {
                              console.error(
                                "Error force deleting client:",
                                error,
                              );
                              alert("حدث خطأ أثناء الحذف القسري");
                            }
                          } else {
                            // Normal deletion if no related data
                            try {
                              await onDeleteClient(c.id);
                              console.log("Client deleted successfully");
                            } catch (error) {
                              console.error("Error deleting client:", error);
                              alert("حدث خطأ أثناء حذف العميل");
                            }
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="حذف العميل"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isAddClientOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsAddClientOpen(false)}
              className="absolute left-6 top-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
            >
              <X size={28} />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-[1000] text-slate-900">
                {selectedClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
              </h3>
              <p className="text-slate-500 font-bold mt-1">
                {selectedClient
                  ? "تعديل بيانات العميل في قاعدة بيانات النظام"
                  : "تسجيل عميل جديد في قاعدة بيانات النظام"}
              </p>
            </div>
            <form onSubmit={handleAddClient} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  اسم العميل بالكامل
                </label>
                <input
                  required
                  type="text"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all text-base"
                  placeholder="مثلاً: شركة النور للمقاولات"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all text-base"
                  placeholder="مثلاً: 012XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  العنوان
                </label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all text-base"
                  placeholder="مثلاً: القاهرة، مدينة نصر"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  نوع العميل
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex items-center p-4 bg-slate-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-all">
                    <input
                      type="radio"
                      name="clientType"
                      value="CASH"
                      checked={newClient.type === "CASH"}
                      onChange={(e) =>
                        setNewClient({ ...newClient, type: "CASH" })
                      }
                      className="sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 flex items-center justify-center">
                      {newClient.type === "CASH" && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">عميل كاش</div>
                      <div className="text-xs text-slate-500">
                        يدفع فوراً عند الشراء
                      </div>
                    </div>
                  </label>

                  <label className="relative flex items-center p-4 bg-slate-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all">
                    <input
                      type="radio"
                      name="clientType"
                      value="CREDIT"
                      checked={newClient.type === "CREDIT"}
                      onChange={(e) =>
                        setNewClient({ ...newClient, type: "CREDIT" })
                      }
                      className="sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 flex items-center justify-center">
                      {newClient.type === "CREDIT" && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        عميل بالآجل
                      </div>
                      <div className="text-xs text-slate-500">
                        يدفع لاحقاً (بالذمة)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
              >
                <CheckCircle2 size={24} />
                حفظ بيانات العميل
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedClient && !isPayModalOpen && !isAddClientOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
            <div className="p-10 border-b flex justify-between items-start bg-slate-50">
              <div>
                <h3 className="text-3xl font-black text-slate-900">
                  {selectedClient.name}
                </h3>
                <div className="flex gap-4 mt-2">
                  <span className="text-slate-500 font-bold flex items-center gap-2 text-lg">
                    <Phone size={18} /> {selectedClient.phone}
                  </span>
                  <span className="text-slate-400 font-bold flex items-center gap-2 text-lg">
                    <MapPin size={18} /> {selectedClient.address}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-4 bg-white border rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-100/50 border-b">
              <div className="bg-white p-6 rounded-2xl border flex flex-col items-center">
                <TrendingUp className="text-indigo-600 mb-2" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  إجمالي المسحوبات
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(totalClientSales)}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border flex flex-col items-center">
                <DollarSign className="text-emerald-600 mb-2" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  إجمالي المسدد
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(totalClientPayments)}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border flex flex-col items-center border-orange-200">
                <Wallet className="text-orange-600 mb-2" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  المتبقي المطلوب سداده
                </span>
                <span className="text-2xl font-black text-orange-600">
                  {formatCurrency(calculatedBalance)}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-base font-black text-slate-400 uppercase tracking-widest border-b-2 pb-3 flex items-center gap-2">
                  <History size={20} /> سجل المشتريات (الفواتير)
                </h4>
                <div className="space-y-4">
                  {clientSales.map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-black text-slate-400">
                          {new Date(s.date).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="font-black text-slate-900 text-lg">
                          {formatCurrency(s.finalAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        {s.items.length} صنف مبيعات
                      </p>
                    </div>
                  ))}
                  {clientSales.length === 0 && (
                    <p className="text-center py-10 text-slate-300 font-bold italic text-lg">
                      لا توجد فواتير سابقة
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-base font-black text-emerald-500 uppercase tracking-widest border-b-2 pb-3 border-emerald-100 flex items-center gap-2">
                  <DollarSign size={20} /> سجل السداد النقدي
                </h4>
                <div className="space-y-4">
                  {clientPayments.map((p) => (
                    <div
                      key={p.id}
                      className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-black text-emerald-400">
                          {new Date(p.date).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="font-black text-emerald-600 text-lg">
                          +{formatCurrency(p.amount)}
                        </span>
                      </div>
                      {p.note && (
                        <p className="text-xs text-emerald-500 font-bold italic mt-2">
                          ملاحظة: {p.note}
                        </p>
                      )}
                    </div>
                  ))}
                  {clientPayments.length === 0 && (
                    <p className="text-center py-10 text-slate-300 font-bold italic text-lg">
                      لم يتم تسجيل عمليات سداد مسبقة
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPayModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl space-y-8">
            <h3 className="text-2xl font-black text-slate-900">
              تسجيل سداد لـ {selectedClient.name}
            </h3>
            <div className="space-y-6">
              <input
                type="number"
                placeholder="قيمة المبلغ المسدد"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full p-6 border-2 border-emerald-100 rounded-2xl font-black text-3xl text-center outline-none focus:border-emerald-500 transition-all text-emerald-600"
                autoFocus
              />
              <input
                type="text"
                placeholder="ملاحظات (اختياري)"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full p-5 bg-slate-50 border rounded-2xl font-bold text-right outline-none text-base"
              />
              <div className="flex gap-4">
                <button
                  onClick={handlePay}
                  className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all text-lg"
                >
                  تأكيد السداد
                </button>
                <button
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-8 py-5 text-slate-400 font-bold border rounded-2xl hover:bg-slate-50 transition-all text-lg"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Payment History Modal */}
      {isPaymentHistoryOpen && selectedClient && (
        <CustomerPaymentHistory
          client={selectedClient}
          sales={sales}
          payments={payments}
          onClose={() => {
            setIsPaymentHistoryOpen(false);
            setSelectedClient(null);
          }}
          role={role}
        />
      )}
    </div>
  );
};

export default ClientManager;
