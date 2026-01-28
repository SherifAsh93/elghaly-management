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
      console.log("[v0] Starting database initialization...");
      await api.initDatabase();
      console.log("[v0] Database initialized, loading data...");
      const [inv, sls, pur, clnt, emp] = await Promise.all([
        api.inventory.getAll(),
        api.sales.getAll(),
        api.purchases.getAll(),
        api.clients.getAll(),
        api.employees.getAll(),
      ]);
      console.log("[v0] Data loaded successfully");
      setInventory(inv);
      setSales(sls);
      setPurchases(pur);
      setClients(clnt);
      setEmployees(emp);
    } catch (error) {
      console.error("[v0] Initialization failed:", error);
      // App will still load with empty state, localStorage will work as fallback
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
          <header className="flex justify-between items-center p-4 md:p-8 no-print bg-gradient-to-r from-white via-slate-50/50 to-white backdrop-blur-sm sticky top-0 z-40 border-b border-slate-100 shadow-md">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2.5 bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 rounded-lg transition-all duration-300"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
                  أبناء الغالي
                </h1>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">نظام إدارة المبيعات والمخزون</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300">
                <Database
                  size={16}
                  className={
                    isSyncing
                      ? "text-orange-500 animate-spin"
                      : "text-slate-500"
                  }
                />
                <span className={`text-xs font-bold uppercase tracking-widest ${isSyncing ? "text-orange-600" : "text-slate-600"}`}>
                  {isSyncing ? "جاري..." : "جاهز"}
                </span>
              </div>
              <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 leading-none mb-0.5 uppercase tracking-wider">
                    نوع الحساب
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {userRole === UserRole.ADMIN
                      ? "إدارة"
                      : "مبيعات"}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md transition-all ${userRole === UserRole.ADMIN ? "bg-gradient-to-br from-amber-500 to-amber-600" : "bg-gradient-to-br from-orange-500 to-orange-600"}`}>
                  {userRole === UserRole.ADMIN ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-8 flex-1">{renderContent()}</div>
          <footer className="p-4 md:p-6 border-t border-slate-100 text-center no-print bg-gradient-to-r from-slate-50 via-white to-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Abnaa El-Ghaly Management System • 2024
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
