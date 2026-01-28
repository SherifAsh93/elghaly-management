
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  FileText, 
  Users, 
  UserSquare2, 
  PieChart, 
  LogOut,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'inventory', label: 'جرد المخزن', icon: Package },
    { id: 'purchases', label: 'المشتريات', icon: ShoppingCart },
    { id: 'sales', label: 'سجل المبيعات', icon: History },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'clients', label: 'العملاء', icon: Users },
    { id: 'employees', label: 'الموظفين', icon: UserSquare2, adminOnly: true },
    { id: 'reports', label: 'التقارير المالية', icon: PieChart, adminOnly: true },
  ];

  return (
    <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-[#0f172a] text-slate-300 flex flex-col transition-transform duration-300 z-[110] no-print shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
      <div className="p-4 border-b border-slate-800/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* Logo container with exactly 20px (0.5cm) padding */}
          <div className="w-full bg-white rounded-xl overflow-hidden p-[20px]">
            <Logo className="w-full" />
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg mr-2">
            <X size={20} />
          </button>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          if (item.adminOnly && userRole !== UserRole.ADMIN) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-orange-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <Icon size={16} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-400'}`} />
              <span className="font-black text-[12px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800/50">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-black text-[11px]">
          <LogOut size={14} />
          <span>خروج من النظام</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
