import React, { useState, useEffect } from "react";
import {
  Menu,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  Bell,
  LogOut,
  User as UserIcon,
  Truck,
} from "lucide-react";
import Sidebar from "./components/shared/Sidebar";
import StatCard from "./components/Dashboard/StatCard";
import InventoryManager from "./components/Inventory/InventoryManager";
import GoodsReport from "./components/Inventory/GoodsReport";
import SalesManager from "./components/Sales/SalesManager";
import ClientManager from "./components/Clients/ClientManager";
import PurchaseManager from "./components/Purchases/PurchaseManager";
import EmployeeManager from "./components/Employees/EmployeeManager";
import ReportManager from "./components/Reports/ReportManager";
import ExpenseManager from "./components/Expenses/ExpenseManager";
import LoginScreen from "./components/Login/LoginScreen";
import Logo from "./components/shared/Logo";
import { AppState, UserRole, User } from "./types";
import {
  formatCurrency,
  calculateVolume,
  formatStockDisplay,
} from "./utils/calculations";
import { api } from "./services/api";
import { db } from "./lib/db";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [state, setState] = useState<AppState>({
    products: [],
    clients: [],
    sales: [],
    purchases: [],
    employees: [],
    expenses: [],
    payments: [],
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("elghaly_user");
  };

  const refreshData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      await db.init();
      const [
        products,
        clients,
        sales,
        purchases,
        employees,
        expenses,
        payments,
      ] = await Promise.all([
        api.inventory.getAll(),
        api.clients.getAll(),
        api.sales.getAll(),
        api.purchases.getAll(),
        api.employees.getAll(),
        api.expenses.getAll(),
        api.payments.getAll(),
      ]);
      setState({
        products,
        clients,
        sales,
        purchases,
        employees,
        expenses,
        payments,
      });
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("elghaly_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    refreshData();
  }, []);

  if (!user)
    return (
      <LoginScreen
        onLogin={(u) => {
          setUser(u);
          localStorage.setItem("elghaly_user", JSON.stringify(u));
        }}
      />
    );

  const handleUpdateProduct = async (id: string, p: any) => {
    setIsSyncing(true);
    await api.inventory.update(id, p);
    await refreshData(true);
    setIsSyncing(false);
  };

  return (
    <div
      className="flex h-screen bg-[#f8fafc] text-slate-800 font-cairo overflow-hidden"
      dir="rtl"
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        role={user.role}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-20 shadow-[0_1px_2px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
            >
              <Menu size={18} />
            </button>
          </div>
          {activeTab === "dashboard" && (
            <div className="flex items-center justify-center flex-1">
              <div className="max-w-[380px] w-full flex justify-center">
                <Logo
                  height="h-25"
                  width="w-60"
                  className="scale-x-120 pt-20"
                  showImage={true}
                  showText={false}
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            {isSyncing && (
              <RefreshCw size={14} className="animate-spin text-orange-500" />
            )}
            <div className="flex items-center gap-2 pl-2">
              <div className="text-right leading-tight">
                <p className="font-bold text-slate-900 text-sm">
                  {user.username}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {user.role === "ADMIN" ? "المدير العام" : "المبيعات"}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm border border-white shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-1">
          <div className="max-w-[1200px] mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3 opacity-20">
                <RefreshCw className="animate-spin text-slate-900" size={24} />
                <p className="font-bold text-sm">جاري تحديث البيانات...</p>
              </div>
            ) : activeTab === "dashboard" ? (
              <div className="relative min-h-[600px] overflow-hidden">
                {/* Scattered StatCards around logo */}
                <div className="absolute top-2 left-10">
                  <StatCard
                    title="إجمالي المخزون"
                    value={(() => {
                      // Calculate totals from all products
                      const totalBundles = state.products.reduce(
                        (acc, p) => acc + (p.bundles || 0),
                        0,
                      );
                      const totalRemainingBoards = state.products.reduce(
                        (acc, p) => acc + (p.remainingBoards || 0),
                        0,
                      );

                      // Create a single product object for formatStockDisplay
                      const totalProduct = {
                        bundles: totalBundles,
                        remainingBoards: totalRemainingBoards,
                        boardsPerBundle: 20, // Average for display
                      } as any;

                      return formatStockDisplay(totalProduct);
                    })()}
                    icon={<Package />}
                    color="bg-indigo-600"
                    className="z-10"
                  />
                </div>

                <div className="absolute top-2 right-10">
                  <StatCard
                    title="مبيعات اليوم"
                    value={formatCurrency(
                      state.sales.reduce((a, b) => a + b.finalAmount, 0),
                    )}
                    icon={<TrendingUp />}
                    color="bg-orange-600"
                    className="z-20"
                  />
                </div>

                <div className="absolute bottom-2 left-10">
                  <StatCard
                    title="إجمالي المصروفات"
                    value={formatCurrency(
                      state.expenses.reduce((a, b) => a + b.amount, 0),
                    )}
                    icon={<TrendingDown />}
                    color="bg-red-600"
                    className="z-30"
                  />
                </div>

                <div className="absolute bottom-3 right-10">
                  <StatCard
                    title="عدد العملاء"
                    value={state.clients.length}
                    icon={<Users />}
                    color="bg-blue-600"
                    className="z-40 ml-3"
                  />
                </div>

                {/* Quick Actions - Centered 2x2 Grid */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <button
                      onClick={() => setActiveTab("clients")}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <UserIcon size={20} className="text-white" />
                        </div>
                        <div className="text-right arabic-text">
                          <h3 className="text-lg font-black text-slate-800 leading-tight">
                            العملاء
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed mt-1">
                            إدارة بيانات العملاء
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-white" />
                        </div>
                        <div className="text-right arabic-text">
                          <h3 className="text-lg font-black text-slate-800 leading-tight">
                            المخزن
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed mt-1">
                            إدارة المخزون والمنتجات
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("purchases")}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck size={20} className="text-white" />
                        </div>
                        <div className="text-right arabic-text">
                          <h3 className="text-lg font-black text-slate-800 leading-tight">
                            المشتريات
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed mt-1">
                            إدارة المشتريات والموردين
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("goods-report")}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-white" />
                        </div>
                        <div className="text-right arabic-text">
                          <h3 className="text-lg font-black text-slate-800 leading-tight">
                            تقرير البضاعة الحالي
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed mt-1">
                            عرض المخزون الحالي
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === "inventory" ? (
              <InventoryManager
                products={state.products}
                clients={state.clients}
                onAddProduct={async (p) => {
                  await api.inventory.create(p);
                  refreshData(true);
                }}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={async (id) => {
                  await api.inventory.delete(id);
                  refreshData(true);
                }}
                onSellProduct={async (
                  productId,
                  quantity,
                  unitPrice,
                  clientId,
                  paidAmount,
                ) => {
                  // Create a sale record for this individual product sale
                  const product = state.products.find(
                    (p) => p.id === productId,
                  );
                  const client = state.clients.find((c) => c.id === clientId);
                  if (!product || !client) return;

                  const totalAmount = quantity * unitPrice;
                  const remainingAmount = totalAmount - paidAmount;

                  // Create a sale with proper client information
                  const sale = {
                    clientId: clientId,
                    clientName: client.name,
                    items: [
                      {
                        productId: productId,
                        productName: product.name,
                        bundlesQuantity: Math.floor(
                          quantity / product.boardsPerBundle,
                        ),
                        boardsQuantity: quantity % product.boardsPerBundle,
                        boardsPerBundle: product.boardsPerBundle,
                        unitPrice: unitPrice,
                        totalPrice: totalAmount,
                      },
                    ],
                    totalAmount: totalAmount,
                    discount: 0,
                    finalAmount: totalAmount,
                    paidAmount: paidAmount,
                    status:
                      paidAmount >= totalAmount
                        ? ("PAID" as const)
                        : paidAmount > 0
                          ? ("PARTIAL" as const)
                          : ("UNPAID" as const),
                  };

                  await api.sales.create(sale);
                  refreshData(true);
                }}
                onAddSale={async (sale) => {
                  await api.sales.create(sale);
                  refreshData(true);
                }}
                role={user?.role || "USER"}
                openAddModal={false}
                refreshData={refreshData}
              />
            ) : activeTab === "sales" ? (
              <SalesManager
                products={state.products}
                clients={state.clients}
                onAddSale={async (s) => {
                  await api.sales.create(s);
                  refreshData(true);
                }}
                onDeleteSale={async (id) => {
                  await api.sales.delete(id);
                  refreshData(true);
                }}
                sales={state.sales}
                role={user.role}
                openSellModal={false}
              />
            ) : activeTab === "clients" ? (
              <ClientManager
                clients={state.clients}
                payments={state.payments}
                sales={state.sales}
                onAddPayment={async (p) => {
                  await api.payments.create(p);
                  refreshData(true);
                }}
                onAddClient={async (c) => {
                  await api.clients.create(c);
                  refreshData(true);
                }}
                onUpdateClient={async (id, c) => {
                  await api.clients.update(id, c);
                  refreshData(true);
                }}
                onDeleteClient={async (id) => {
                  await api.clients.delete(id);
                  refreshData(true);
                }}
                role={user.role}
              />
            ) : activeTab === "expenses" ? (
              <ExpenseManager
                expenses={state.expenses}
                onAddExpense={async (e) => {
                  console.log("App.tsx: onAddExpense called with:", e);
                  try {
                    console.log("App.tsx: Calling api.expenses.create...");
                    const result = await api.expenses.create(e);
                    console.log("App.tsx: API create result:", result);
                    console.log("App.tsx: Calling refreshData...");
                    refreshData(true);
                    console.log("App.tsx: refreshData completed");
                  } catch (error) {
                    console.error("App.tsx: Error creating expense:", error);
                  }
                }}
                onDeleteExpense={async (id) => {
                  await api.expenses.delete(id);
                  refreshData(true);
                }}
              />
            ) : activeTab === "goods-report" ? (
              <GoodsReport products={state.products} />
            ) : activeTab === "purchases" ? (
              <PurchaseManager
                purchases={state.purchases}
                products={state.products}
                onAddPurchase={async (p, u) => {
                  await api.purchases.create(p);
                  refreshData(true);
                }}
                onDeletePurchase={async (id) => {
                  await api.purchases.delete(id);
                  refreshData(true);
                }}
                role={user.role}
              />
            ) : activeTab === "employees" ? (
              <EmployeeManager
                employees={state.employees}
                onAddAdvances={async (id, amt) => {
                  await api.employees.updateAdvances(id, amt);
                  refreshData(true);
                }}
                onAddEmployee={async (employee) => {
                  await api.employees.create(employee);
                  refreshData(true);
                }}
                role={user.role}
              />
            ) : activeTab === "reports" ? (
              <ReportManager state={state} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
