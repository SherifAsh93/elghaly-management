import React, { useState, useEffect } from "react";
import {
  UserRole,
  ProductItem,
  Sale,
  Purchase,
  Client,
  Employee,
  ClientType,
} from "./types";
import {
  FileText,
  ShoppingCart,
  Menu,
  ShieldCheck,
  Database,
  Loader2,
  Trash2,
} from "lucide-react";
import { api } from "./api";

// Components
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Purchases from "./components/Purchases";
import SalesHistory from "./components/SalesHistory";
import Invoices from "./components/Invoices";
import ClientsList from "./components/ClientsList";
import EmployeesList from "./components/EmployeesList";
import Reports from "./components/Reports";
import Login from "./components/Login";
import QuickSaleModal from "./components/QuickSaleModal";

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedQuickSaleItem, setSelectedQuickSaleItem] =
    useState<ProductItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // App Data State
  const [inventory, setInventory] = useState<ProductItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Initial Data Load
  const loadData = async () => {
    setIsLoading(true);
    try {
      await api.initDatabase();
      const [inv, sls, pur, clnt, emp] = await Promise.all([
        api.inventory.getAll(),
        api.sales.getAll(),
        api.purchases.getAll(),
        api.clients.getAll(),
        api.employees.getAll(),
      ]);
      setInventory(inv);
      setSales(sls);
      setPurchases(pur);
      setClients(clnt);
      setEmployees(emp);
    } catch (error) {
      console.error("Initialization failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-save logic (only for updates, deletes handled explicitly)
  useEffect(() => {
    if (isLoading) return;
    setIsSyncing(true);
    const sync = async () => {
      await Promise.all([
        api.inventory.saveAll(inventory),
        api.clients.saveAll(clients),
        api.employees.saveAll(employees),
        api.sales.saveAll?.(sales),
      ]);
      setTimeout(() => setIsSyncing(false), 800);
    };
    sync();
  }, [inventory, clients, employees, sales, isLoading]);

  const handleWipeData = async () => {
    if (
      confirm(
        "تنبيه هام جداً: هل أنت متأكد من مسح جميع بيانات النظام نهائياً؟ سيتم تصفير المخازن والمبيعات والموظفين تماماً.",
      )
    ) {
      const success = await api.wipeAllData();
      if (success) {
        alert("تم مسح جميع البيانات بنجاح.");
        window.location.reload();
      }
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if (
      confirm("حذف هذا الصنف سيؤدي لإزالته نهائياً من قاعدة البيانات. استمر؟")
    ) {
      await api.inventory.delete(id);
      setInventory((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const deleteSaleRecord = async (id: string) => {
    if (confirm("حذف العملية من السجل؟ لن يؤثر هذا على رصيد المخزن الحالي.")) {
      await api.sales.delete(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const deletePurchaseRecord = async (id: string) => {
    if (confirm("حذف التوريد من السجل؟ لن يؤثر هذا على رصيد المخزن الحالي.")) {
      await api.purchases.delete(id);
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSales = async (newSales: Sale[]) => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const commonInvoiceId = `INV-${dateStr}-${randomSuffix}`;

    const finalizedSales = newSales.map((s) => ({
      ...s,
      invoiceId: commonInvoiceId,
    }));

    setSales((prev) => [...finalizedSales, ...prev]);

    setInventory((prev) => {
      let updatedInv = [...prev];
      finalizedSales.forEach((sale) => {
        updatedInv = updatedInv.map((item) => {
          if (item.id === sale.itemId) {
            let totalBoards = item.bundles * item.boardsPerBundle;
            if (sale.unitType === "bundle") {
              totalBoards -= sale.quantity * item.boardsPerBundle;
            } else {
              totalBoards -= sale.quantity;
            }
            const newBundles = totalBoards / item.boardsPerBundle;
            return { ...item, bundles: Math.max(0, newBundles) };
          }
          return item;
        });
      });
      return updatedInv;
    });

    for (const sale of finalizedSales) {
      await api.sales.add(sale);
    }

    const clientName = finalizedSales[0]?.clientName;
    if (clientName && !clients.some((c) => c.name === clientName)) {
      setClients((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: clientName,
          phone: "",
          address: "",
          type: ClientType.CASH,
        },
      ]);
    }
  };

  if (!userRole) return <Login onLogin={setUserRole} />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-['Cairo']">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <h2 className="text-xl font-black">جاري تحميل النظام...</h2>
      </div>
    );
  }

  const isRestricted = (tab: string) => {
    const adminTabs = ["reports", "employees"];
    return adminTabs.includes(tab) && userRole !== UserRole.ADMIN;
  };

  const renderContent = () => {
    if (isRestricted(activeTab)) {
      return (
        <Dashboard
          inventory={inventory}
          sales={sales}
          onWipe={handleWipeData}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            inventory={inventory}
            sales={sales}
            onWipe={handleWipeData}
            userRole={userRole}
          />
        );
      case "inventory":
        return (
          <Inventory
            inventory={inventory}
            setInventory={setInventory}
            userRole={userRole}
            onQuickSale={setSelectedQuickSaleItem}
            onDeleteItem={deleteInventoryItem}
          />
        );
      case "purchases":
        return (
          <Purchases
            inventory={inventory}
            setInventory={setInventory}
            setPurchases={setPurchases}
            purchases={purchases}
            userRole={userRole}
            onDeletePurchase={deletePurchaseRecord}
          />
        );
      case "sales":
        return (
          <SalesHistory
            sales={sales}
            setSales={setSales}
            userRole={userRole}
            onDeleteSale={deleteSaleRecord}
          />
        );
      case "invoices":
        return <Invoices sales={sales} />;
      case "clients":
        return (
          <ClientsList
            clients={clients}
            setClients={setClients}
            userRole={userRole}
          />
        );
      case "employees":
        return (
          <EmployeesList
            employees={employees}
            setEmployees={setEmployees}
            userRole={userRole}
          />
        );
      case "reports":
        return <Reports inventory={inventory} sales={sales} />;
      default:
        return (
          <Dashboard
            inventory={inventory}
            sales={sales}
            onWipe={handleWipeData}
            userRole={userRole}
          />
        );
    }
  };

  return (
    <div
      className="flex min-h-screen bg-[#f1f5f9] text-slate-900 font-['Cairo'] overflow-x-hidden"
      dir="rtl"
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!isRestricted(tab)) setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        userRole={userRole}
        onLogout={() => setUserRole(null)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 w-full flex flex-col min-w-0">
        <div className="max-w-[1200px] w-full mx-auto flex flex-col min-h-screen border-x border-slate-200 bg-white shadow-sm relative">
          <header className="flex justify-between items-center p-4 md:p-6 no-print bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 bg-slate-50 rounded-xl hover:bg-orange-50 transition-colors"
              >
                <Menu size={20} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  أبناء الغالي
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <Database
                  size={10}
                  className={
                    isSyncing
                      ? "text-orange-500 animate-spin"
                      : "text-slate-400"
                  }
                />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                  {isSyncing ? "Syncing" : "Online"}
                </span>
              </div>
              <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-lg">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 leading-none mb-1">
                    المستخدم الحالي
                  </p>
                  <p className="text-xs font-black text-white">
                    {userRole === UserRole.ADMIN
                      ? "المدير العام"
                      : "موظف مبيعات"}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                  {userRole === UserRole.ADMIN ? (
                    <ShieldCheck size={16} />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-8 flex-1">{renderContent()}</div>
          <footer className="p-4 border-t border-slate-50 text-center no-print">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
              Built for Abnaa El-Ghaly • 2024
            </p>
          </footer>
        </div>
        {selectedQuickSaleItem && (
          <QuickSaleModal
            initialItem={selectedQuickSaleItem}
            inventory={inventory}
            clients={clients}
            onClose={() => setSelectedQuickSaleItem(null)}
            onSales={handleSales}
          />
        )}
      </main>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[105] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
