import React, { useState } from "react";
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Search,
  Edit,
  Trash2,
  X,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Client, ClientType, UserRole } from "../types";

interface ClientsListProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  // Added userRole to fix TypeScript error in App.tsx
  userRole: UserRole;
}

const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  setClients,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientData: Client = {
      id: editingClient?.id || Date.now().toString(),
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      type: formData.get("type") as ClientType,
    };

    if (editingClient) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? clientData : c)),
      );
    } else {
      setClients((prev) => [...prev, clientData]);
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const deleteClient = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="بحث عن عميل..."
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-md font-bold"
        >
          <Plus size={20} />
          إضافة عميل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${client.type === ClientType.CREDIT ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"}`}
              >
                {client.type === ClientType.CREDIT ? (
                  <CreditCard size={24} />
                ) : (
                  <Wallet size={24} />
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingClient(client);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={16} />
                </button>
                {/* Only allow admins to delete clients for data safety */}
                {userRole === UserRole.ADMIN && (
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-800">
                {client.name}
              </h3>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${client.type === ClientType.CREDIT ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}
              >
                {client.type === ClientType.CREDIT ? "عميل آجل" : "عميل كاش"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Phone size={14} className="text-orange-500" />
                <span dir="ltr">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <MapPin size={14} className="text-orange-500" />
                <span className="line-clamp-1">{client.address}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">لا يوجد عملاء مسجلين حالياً</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">
                {editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClient(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">
                  اسم العميل
                </label>
                <input
                  name="name"
                  defaultValue={editingClient?.name}
                  required
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                  placeholder="الاسم بالكامل"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">
                  رقم الهاتف
                </label>
                <input
                  name="phone"
                  defaultValue={editingClient?.phone}
                  required
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">
                  العنوان
                </label>
                <input
                  name="address"
                  defaultValue={editingClient?.address}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                  placeholder="العنوان بالتفصيل"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">
                  نوع التعامل
                </label>
                <select
                  name="type"
                  defaultValue={editingClient?.type || ClientType.CASH}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-black"
                >
                  <option value={ClientType.CASH}>كاش (دفع فوري)</option>
                  <option value={ClientType.CREDIT}>آجل (مديونية)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black mt-4 shadow-lg shadow-slate-900/20 hover:bg-orange-600 transition-colors"
              >
                حفظ البيانات
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
