import React from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  UserSquare2,
  BarChart3,
  X,
  LogOut,
  Wallet,
  FileText,
} from "lucide-react";
import { UserRole } from "../../types";
import Logo from "./Logo";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  role,
  onLogout,
}) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SALES"],
    },
    {
      id: "inventory",
      label: "المخزن",
      icon: Package,
      roles: ["ADMIN", "SALES"],
    },
    {
      id: "goods-report",
      label: "تقرير البضاعة",
      icon: FileText,
      roles: ["ADMIN", "SALES"],
    },
    {
      id: "sales",
      label: "المبيعات",
      icon: ShoppingCart,
      roles: ["ADMIN", "SALES"],
    },
    { id: "clients", label: "العملاء", icon: Users, roles: ["ADMIN", "SALES"] },
    { id: "expenses", label: "المصروفات", icon: Wallet, roles: ["ADMIN"] },
    { id: "purchases", label: "المشتريات", icon: Truck, roles: ["ADMIN"] },
    { id: "employees", label: "الموظفين", icon: UserSquare2, roles: ["ADMIN"] },
    { id: "reports", label: "التقارير", icon: BarChart3, roles: ["ADMIN"] },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-slate-900 text-slate-100 z-[60] transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col items-center shrink-0 border-b border-white/10">
          <Logo
            variant="light"
            height="h-25"
            width="w-60"
            className="scale-x-120"
            showImage={true}
            showText={false}
          />
          <button
            className="lg:hidden absolute left-4 top-4 text-slate-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-base ${isActive ? "bg-orange-600 text-white shadow-md" : "text-slate-400 hover:bg-white/5"}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all text-base"
          >
            <LogOut size={18} />
            <span>خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
