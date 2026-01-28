import React, { useMemo } from "react";
import { ProductItem, Sale, UserRole } from "../types";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Layers,
  Boxes,
  DatabaseBackup,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  inventory: ProductItem[];
  sales: Sale[];
  onWipe: () => void;
  userRole?: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({
  inventory,
  sales,
  onWipe,
  userRole,
}) => {
  const stats = useMemo(() => {
    const totalInventoryValue = inventory.reduce(
      (acc, item) => acc + item.bundles * item.boardsPerBundle * item.buyPrice,
      0,
    );
    const totalSales = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
    const totalBundles = inventory.reduce((acc, item) => acc + item.bundles, 0);
    const totalBoards = inventory.reduce(
      (acc, item) => acc + item.bundles * item.boardsPerBundle,
      0,
    );

    const lastMonthSales = sales
      .filter((s) => {
        const date = new Date(s.date);
        return date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      })
      .reduce((acc, sale) => acc + sale.totalPrice, 0);

    const avgDailySales = sales.length > 0 ? totalSales / Math.max(1, Math.ceil(sales.length / 5)) : 0;
    const totalTransactions = sales.length;
    
    return {
      totalInventoryValue,
      totalSales,
      totalBundles,
      totalBoards,
      lastMonthSales,
      avgDailySales,
      totalTransactions,
    };
  }, [inventory, sales]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString("ar-EG", { weekday: "short" });
      const dailySales = sales
        .filter((s) => new Date(s.date).toDateString() === date.toDateString())
        .reduce((acc, s) => acc + s.totalPrice, 0);
      data.push({ name: dayStr, sales: dailySales });
    }
    return data;
  }, [sales]);

  const topProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; total: number; count: number } } = {};
    sales.forEach((sale) => {
      if (!productSales[sale.itemName]) {
        productSales[sale.itemName] = { name: sale.itemName, total: 0, count: 0 };
      }
      productSales[sale.itemName].total += sale.totalPrice;
      productSales[sale.itemName].count += 1;
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString()}`}
          unit="ج.م"
          icon={<ShoppingCart className="text-orange-600" />}
          subtitle="منذ بداية العمل"
        />
        <StatCard
          title="المخزون (ربطة)"
          value={stats.totalBundles.toLocaleString()}
          unit="ربطة"
          icon={<Layers className="text-blue-600" />}
          subtitle="المتوفرة حالياً"
        />
        <StatCard
          title="المخزون (لوح)"
          value={stats.totalBoards.toLocaleString()}
          unit="لوح"
          icon={<Boxes className="text-green-600" />}
          subtitle="الألواح الفردية"
        />
        <StatCard
          title="آخر 30 يوم"
          value={`${stats.lastMonthSales.toLocaleString()}`}
          unit="ج.م"
          icon={<TrendingUp className="text-amber-600" />}
          subtitle="مبيعات الشهر"
        />
        <StatCard
          title="عدد العمليات"
          value={stats.totalTransactions.toLocaleString()}
          unit="عملية"
          icon={<Package className="text-purple-600" />}
          subtitle="إجمالي المعاملات"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2rem] shadow-lg border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                تحليل المبيعات
              </h3>
              <p className="text-sm text-slate-400 font-semibold mt-2">آخر 7 أيام</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 rounded-2xl text-xs font-bold border border-orange-200/60">
              📊 الأسبوع الحالي
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontWeight: "bold", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontWeight: "bold", fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #fed7aa",
                    backgroundColor: "#fffbeb",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                  formatter={(val: number) => [
                    `${val.toLocaleString()} ج.م`,
                    "المبيعات",
                  ]}
                />
                <Bar
                  dataKey="sales"
                  fill="#ea580c"
                  radius={[8, 8, 0, 0]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2rem] shadow-lg border border-slate-200/60 hover:shadow-2xl transition-all duration-500 flex flex-col">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              أحدث العمليات
            </h3>
            <p className="text-sm text-slate-400 font-semibold mt-2">التحديثات الأخيرة</p>
          </div>
          <div className="flex-1 space-y-3 mt-6 overflow-y-auto max-h-96">
            {sales.length > 0 ? (
              sales.slice(0, 6).map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm group-hover:shadow-md group-hover:bg-orange-100 transition-all duration-300 flex-shrink-0">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                        {sale.itemName}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                        {sale.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0 ml-3">
                    <p className="font-black text-orange-600 text-sm">
                      {sale.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {new Date(sale.date).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart size={32} className="text-slate-200 mb-3" />
                <p className="text-slate-400 font-semibold">لا توجد عمليات مسجلة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-500">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900">أعلى المنتجات</h3>
            <p className="text-sm text-slate-400 font-semibold mt-1">الأكثر مبيعاً</p>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/60 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{product.count} عملية بيع</p>
                    </div>
                  </div>
                  <p className="font-black text-orange-600 text-sm flex-shrink-0">
                    {product.total.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 font-semibold">لا توجد مبيعات حتى الآن</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-500">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900">ملخص المخزون</h3>
            <p className="text-sm text-slate-400 font-semibold mt-1">إجمالي المتوفر</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-100/60">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">إجمالي الربطات</p>
                  <p className="text-2xl font-black text-blue-900 mt-2">{stats.totalBundles.toLocaleString()}</p>
                </div>
                <Layers className="text-blue-200" size={32} />
              </div>
            </div>
            
            <div className="p-4 bg-green-50/60 rounded-lg border border-green-100/60">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">إجمالي الألواح</p>
                  <p className="text-2xl font-black text-green-900 mt-2">{stats.totalBoards.toLocaleString()}</p>
                </div>
                <Boxes className="text-green-200" size={32} />
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-100/60">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">قيمة المخزون</p>
                  <p className="text-2xl font-black text-amber-900 mt-2">{(stats.totalInventoryValue / 1000).toLocaleString('ar-EG', {maximumFractionDigits: 1})} ألف</p>
                </div>
                <DollarSign className="text-amber-200" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = React.memo(({ title, value, unit, icon, subtitle }: any) => (
  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-md border border-slate-200/60 relative overflow-hidden group hover:shadow-xl hover:border-orange-300 transition-all duration-500">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-500"></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1 leading-relaxed">
        {title}
      </p>
      <div className="flex items-baseline gap-1.5">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
        <span className="text-xs text-slate-400 font-semibold">{unit}</span>
      </div>
      <p className="text-[11px] text-slate-400 font-semibold mt-2">{subtitle}</p>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

export default React.memo(Dashboard);
