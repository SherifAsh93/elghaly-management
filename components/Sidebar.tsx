import React from "react";
import { type Tab } from "../app/page";

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  userRole: "admin" | "sales";
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onLogout,
  isOpen,
  onClose,
}) => {
  const logoUrl =
    "https://scontent.faly1-2.fna.fbcdn.net/v/t39.30808-1/518327138_1244906727646012_8662475096945791827_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=We9R9jSetugQ7kNvwEoJa9o&_nc_oc=AdkidbQ8pmV5D1zQ56nQFj6DGEKjFUEcSTgDMF-HZpBHgF_ELDJLkhYwx5ugk9eU34U&_nc_zt=24&_nc_ht=scontent.faly1-2.fna&_nc_gid=9VJWPZ_jzj7o0QT7d17kaA&oh=00_AfoojzV10jM-c_w1wp9H2aNrntnyELub43mpuG6yWC-2tg&oe=6969B030";

  const menuItems = [
    { id: "dashboard" as Tab, label: "الرئيسية", icon: "📊", adminOnly: true },
    {
      id: "inventory" as Tab,
      label: "جرد المخزن",
      icon: "📦",
      adminOnly: false,
    },
    { id: "purchases" as Tab, label: "المشتريات", icon: "🛒", adminOnly: true },
    {
      id: "sales-history" as Tab,
      label: "سجل المبيعات",
      icon: "💰",
      adminOnly: false,
    },
    { id: "invoices" as Tab, label: "الفواتير", icon: "📄", adminOnly: false },
    { id: "clients" as Tab, label: "العملاء", icon: "🤝", adminOnly: true },
    { id: "employees" as Tab, label: "الموظفين", icon: "👥", adminOnly: true },
    {
      id: "reports" as Tab,
      label: "التقارير المالية",
      icon: "📈",
      adminOnly: true,
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === "admin"
  );

  const handleNavClick = (id: Tab) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 w-72 bg-[#111827] text-white flex flex-col z-[50] transition-transform duration-300 transform lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 pt-10 pb-4 text-center shrink-0 border-b border-white/5">
          <div className="w-28 h-28 mx-auto mb-4 p-1 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img
              src={logoUrl}
              alt="أبناء الغالي"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <h2 className="text-xl font-black text-orange-500 tracking-tight leading-none mb-1.5">
            أبناء الغالي
          </h2>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-none">
            إدارة الاستيراد والتجارة
          </p>
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span
                  className={`font-bold text-[13px] ${
                    activeTab === item.id ? "font-black" : ""
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {activeTab === item.id && (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2 shrink-0 bg-slate-900/40">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/20 text-slate-500 py-3 rounded-2xl text-[10px] font-bold border border-slate-700/30 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
          >
            <span>🚪</span>
            <span>خروج آمن</span>
          </button>
          <div className="flex justify-center items-center gap-2">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">
              مزامنة سحابية (Turso)
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
