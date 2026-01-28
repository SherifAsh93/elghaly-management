import React, { useMemo, useState } from "react";
import {
  FileText,
  Search,
  Printer,
  Eye,
  X,
  User,
  ChevronRight,
  Hash,
} from "lucide-react";
import { Sale } from "../types";
import Logo from "./Logo";

interface InvoicesProps {
  sales: Sale[];
}

const Invoices: React.FC<InvoicesProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  // Group by client name
  const groupedByClient = useMemo(() => {
    const clients: Record<string, Record<string, Sale[]>> = {};
    sales.forEach((sale) => {
      if (!clients[sale.clientName]) clients[sale.clientName] = {};
      if (!clients[sale.clientName][sale.invoiceId])
        clients[sale.clientName][sale.invoiceId] = [];
      clients[sale.clientName][sale.invoiceId].push(sale);
    });
    return clients;
  }, [sales]);

  const clientList = useMemo(() => {
    return Object.entries(groupedByClient)
      .map(([clientName, invoices]) => {
        const invArray = Object.entries(invoices)
          .map(([invId, items]) => ({
            invoiceId: invId,
            date: items[0].date,
            total: items.reduce((sum, i) => sum + i.totalPrice, 0),
            itemCount: items.length,
            items: items,
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        return {
          name: clientName,
          totalInvoices: invArray.length,
          totalSpent: invArray.reduce((sum, inv) => sum + inv.total, 0),
          invoices: invArray,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [groupedByClient]);

  const filteredClients = clientList.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.invoices.some((inv) =>
        inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const selectedInvoiceData = useMemo(() => {
    if (!selectedInvoiceId) return null;
    for (const client of clientList) {
      const found = client.invoices.find(
        (inv) => inv.invoiceId === selectedInvoiceId,
      );
      if (found) return found;
    }
    return null;
  }, [selectedInvoiceId, clientList]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="بحث باسم العميل أو رقم الفاتورة..."
            className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 no-print">
        {filteredClients.map((client) => (
          <div
            key={client.name}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all"
          >
            <button
              onClick={() =>
                setExpandedClient(
                  expandedClient === client.name ? null : client.name,
                )
              }
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <User size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-black text-xl text-slate-800">
                    {client.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400">
                    إجمالي المعاملات: {client.totalInvoices} فاتورة
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-left hidden md:block">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
                    إجمالي المبيعات
                  </p>
                  <p className="text-xl font-black text-orange-600">
                    {client.totalSpent.toLocaleString()} ج.م
                  </p>
                </div>
                <ChevronRight
                  className={`text-slate-300 transition-transform ${expandedClient === client.name ? "rotate-90" : ""}`}
                />
              </div>
            </button>

            {expandedClient === client.name && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {client.invoices.map((inv) => (
                    <div
                      key={inv.invoiceId}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                          <Hash size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400">
                          {new Date(inv.date).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-400 mb-1">
                        فاتورة #{inv.invoiceId.slice(-6)}
                      </p>
                      <p className="text-xl font-black text-slate-800 mb-4">
                        {inv.total.toLocaleString()}{" "}
                        <span className="text-xs font-normal">ج.م</span>
                      </p>
                      <button
                        onClick={() => setSelectedInvoiceId(inv.invoiceId)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-orange-600 transition-all"
                      >
                        <Eye size={16} /> معاينة وتفاصيل
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="py-20 text-center text-slate-300 font-black">
            لا يوجد فواتير مطابقة للبحث
          </div>
        )}
      </div>

      {selectedInvoiceData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md no-print">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h3 className="text-xl font-black text-slate-800">
                معاينة الفاتورة
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-bold"
                >
                  <Printer size={20} /> طباعة
                </button>
                <button
                  onClick={() => setSelectedInvoiceId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl border border-slate-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-16">
                <div className="flex gap-4">
                  <Logo className="w-24 h-24" />
                  <div>
                    <h2 className="text-4xl font-black text-orange-600 mb-1 leading-none">
                      أبناء الغالي
                    </h2>
                    <p className="text-sm font-bold text-slate-400 tracking-widest">
                      للاستيراد والتجارة
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-500 font-black">
                    فاتورة #{selectedInvoiceId?.slice(-10)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(selectedInvoiceData.date).toLocaleDateString(
                      "ar-EG",
                    )}
                  </p>
                </div>
              </div>
              <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">
                  السيد العميل
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {selectedInvoiceData.items[0].clientName}
                </p>
              </div>
              <table className="w-full mb-10">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-right">
                    <th className="py-4 font-black text-sm">الوصف</th>
                    <th className="py-4 font-black text-sm text-center">
                      الكمية
                    </th>
                    <th className="py-4 font-black text-sm text-left">
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceData.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">
                        <p className="font-black text-slate-800">
                          {item.itemName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.unitPrice.toLocaleString()} ج.م /{" "}
                          {item.unitType === "bundle" ? "ربطة" : "لوح"}
                        </p>
                      </td>
                      <td className="py-4 text-center font-bold text-slate-500">
                        {item.quantity}{" "}
                        {item.unitType === "bundle" ? "ربطة" : "لوح"}
                      </td>
                      <td className="py-4 text-left font-black text-slate-900">
                        {item.totalPrice.toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end pt-6 border-t-2 border-slate-900">
                <div className="w-full md:w-80 flex justify-between items-center text-3xl font-black">
                  <span className="text-slate-900">الإجمالي:</span>
                  <span className="text-orange-600">
                    {selectedInvoiceData.total.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print View */}
      <div className="print-only" dir="rtl">
        {selectedInvoiceData && (
          <div className="p-10 bg-white min-h-screen text-slate-900 font-['Cairo']">
            <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-8">
              <div>
                <h2 className="text-5xl font-black text-black mb-2">
                  أبناء الغالي
                </h2>
                <p className="text-xl font-bold text-slate-700 tracking-widest">
                  للاستيراد والتجارة المتكاملة
                </p>
                <p className="mt-4 font-bold">
                  مدينة السادات - هاتف: 01111848813
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-black text-3xl mb-1">فاتورة مبيعات</h3>
                <p className="font-bold">
                  رقم: #{selectedInvoiceId?.slice(-10)}
                </p>
                <p className="font-bold">
                  التاريخ:{" "}
                  {new Date(selectedInvoiceData.date).toLocaleDateString(
                    "ar-EG",
                  )}
                </p>
              </div>
            </div>
            <div className="mb-10 py-6 px-8 border-4 border-slate-900 rounded-3xl">
              <p className="text-lg font-bold mb-1">السيد العميل /</p>
              <p className="text-4xl font-black">
                {selectedInvoiceData.items[0].clientName}
              </p>
            </div>
            <table className="w-full mb-16 border-collapse">
              <thead>
                <tr className="border-b-4 border-slate-900 text-right">
                  <th className="py-4 font-black text-xl">الصنف</th>
                  <th className="py-4 font-black text-xl text-center">
                    الكمية
                  </th>
                  <th className="py-4 font-black text-xl text-left">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceData.items.map((item) => (
                  <tr key={item.id} className="border-b-2 border-slate-300">
                    <td className="py-8 font-black text-2xl">
                      {item.itemName}
                    </td>
                    <td className="py-8 text-center font-bold text-xl">
                      {item.quantity}{" "}
                      {item.unitType === "bundle" ? "ربطة" : "لوح"}
                    </td>
                    <td className="py-8 text-left font-black text-3xl">
                      {item.totalPrice.toLocaleString()} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mb-24">
              <div className="flex justify-between w-full md:w-[400px] text-5xl font-black border-t-8 border-slate-900 pt-6">
                <span>الإجمالي:</span>
                <span>{selectedInvoiceData.total.toLocaleString()} ج.م</span>
              </div>
            </div>
            <div className="flex justify-between px-10 text-center font-black text-xl mt-32">
              <div className="w-64 border-t-2 border-slate-900 pt-4">
                توقيع العميل
              </div>
              <div className="w-64 border-t-2 border-slate-900 pt-4">
                توقيع الحسابات
              </div>
              <div className="w-64 border-t-2 border-slate-900 pt-4">
                المخزن
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
