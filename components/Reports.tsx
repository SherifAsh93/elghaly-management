
import React, { useMemo } from 'react';
// Changed WoodItem to ProductItem to fix import error
import { ProductItem, Sale } from '../types';
import { PieChart, DollarSign, Package, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';

interface ReportsProps {
  // Changed WoodItem to ProductItem
  inventory: ProductItem[];
  sales: Sale[];
}

const Reports: React.FC<ReportsProps> = ({ inventory, sales }) => {
  const financialStats = useMemo(() => {
    // Total cost of all items currently in stock
    const stockCostValue = inventory.reduce((acc, item) => 
      acc + (item.bundles * item.boardsPerBundle * item.buyPrice), 0);
    
    // Total potential revenue if all stock is sold at sellPrice
    const stockRevenueValue = inventory.reduce((acc, item) => 
      acc + (item.bundles * item.boardsPerBundle * item.sellPrice), 0);

    // Actual revenue from sales
    const actualRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);

    // Calculate actual profit (SalePrice - BuyPrice * quantity)
    // We need to look up the item's buy price at the time or use current buy price for estimate
    const actualProfit = sales.reduce((acc, sale) => {
      const originalItem = inventory.find(i => i.id === sale.itemId);
      const buyPrice = originalItem?.buyPrice || (sale.unitPrice * 0.8); // fallback estimate if item deleted
      
      let buyCostForSale = 0;
      if (sale.unitType === 'bundle') {
        const boardsInBundles = sale.quantity * (originalItem?.boardsPerBundle || 50);
        buyCostForSale = boardsInBundles * buyPrice;
      } else {
        buyCostForSale = sale.quantity * buyPrice;
      }
      
      return acc + (sale.totalPrice - buyCostForSale);
    }, 0);

    return { stockCostValue, stockRevenueValue, actualRevenue, actualProfit };
  }, [inventory, sales]);

  const originData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(item => {
      counts[item.origin] = (counts[item.origin] || 0) + (item.bundles * item.boardsPerBundle);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><DollarSign size={20}/></div>
             <h4 className="text-slate-500 font-bold">إجمالي الأرباح المحققة</h4>
          </div>
          <p className="text-3xl font-black text-slate-800">{financialStats.actualProfit.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
          <div className="mt-4 flex items-center gap-1 text-green-600 text-sm font-bold">
            <TrendingUp size={16} />
            <span>صافي ربح من المبيعات</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div>
             <h4 className="text-slate-500 font-bold">قيمة المخزن الحالي</h4>
          </div>
          <p className="text-3xl font-black text-slate-800">{financialStats.stockCostValue.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
          <p className="mt-2 text-xs text-slate-400">قيمة شراء البضاعة الموجودة بالمخازن</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ArrowRightLeft size={20}/></div>
             <h4 className="text-slate-500 font-bold">المبيعات الإجمالية</h4>
          </div>
          <p className="text-3xl font-black text-slate-800">{financialStats.actualRevenue.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
          <p className="mt-2 text-xs text-slate-400">إجمالي النقدية الواردة من المبيعات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChart className="text-orange-600" size={20} />
            توزيع المخزون حسب بلد المنشأ
          </h3>
          <div className="h-80">
             {originData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={originData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {originData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400">لا يوجد بيانات لعرضها</div>
             )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold mb-6">ملخص مالي سريع</h3>
           <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                 <div>
                    <p className="text-slate-500 text-sm">القيمة السوقية للمخزن (سعر البيع)</p>
                    <p className="text-xl font-bold text-slate-800">{financialStats.stockRevenueValue.toLocaleString()} ج.م</p>
                 </div>
                 <div className="p-3 bg-green-100 text-green-700 rounded-lg"><TrendingUp size={24}/></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                 <div>
                    <p className="text-slate-500 text-sm">هامش الربح المتوقع (للمخزن الحالي)</p>
                    <p className="text-xl font-bold text-slate-800">{(financialStats.stockRevenueValue - financialStats.stockCostValue).toLocaleString()} ج.م</p>
                 </div>
                 <div className="p-3 bg-orange-100 text-orange-700 rounded-lg"><TrendingUp size={24}/></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs mb-1">إجمالي القطع بالمخزن</p>
                    <p className="text-lg font-bold">{inventory.reduce((acc, i) => acc + (i.bundles * i.boardsPerBundle), 0)}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs mb-1">إجمالي الربطات</p>
                    <p className="text-lg font-bold">{inventory.reduce((acc, i) => acc + i.bundles, 0)}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
