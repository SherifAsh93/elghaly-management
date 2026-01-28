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

    return {
      totalInventoryValue,
      totalSales,
      totalBundles,
      totalBoards,
      lastMonthSales,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString()} ج.م`}
          icon={<ShoppingCart className="text-orange-600" />}
          subtitle="منذ بداية العمل"
        />
        <StatCard
          title="المخزون الحالي (ربطة)"
          value={stats.totalBundles.toLocaleString()}
          icon={<Layers className="text-blue-600" />}
          subtitle="إجمالي الربطات المتوفرة"
        />
        <StatCard
          title="المخزون الحالي (لوح)"
          value={stats.totalBoards.toLocaleString()}
          icon={<Boxes className="text-green-600" />}
          subtitle="إجمالي الألواح الفردية"
        />
        <StatCard
          title="مبيعات الشهر الحالي"
          value={`${stats.lastMonthSales.toLocaleString()} ج.م`}
          icon={<TrendingUp className="text-amber-600" />}
          subtitle="آخر 30 يوم عمل"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800">
              تحليل المبيعات الأسبوعي
            </h3>
            <div className="flex gap-2">
              {/* {userRole === UserRole.ADMIN && (
                <button
                  onClick={onWipe}
                  className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-black hover:bg-red-600 hover:text-white transition-all border border-red-100"
                >
                  <Trash2 size={12} />
                  تصفير النظام ومسح الداتا
                </button>
              )} */}
              <div className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
                آخر 7 أيام
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
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
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                  formatter={(val: number) => [
                    `${val.toLocaleString()} ج.م`,
                    "المبيعات",
                  ]}
                />
                <Bar
                  dataKey="sales"
                  fill="#ea580c"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-xl font-black text-slate-800 mb-8">
            أحدث العمليات
          </h3>
          <div className="space-y-4">
            {sales.length > 0 ? (
              sales.slice(0, 6).map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-orange-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">
                        {sale.itemName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                        {sale.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-orange-600 text-sm">
                      {sale.totalPrice.toLocaleString()} ج.م
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {new Date(sale.date).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-300 font-bold">لا يوجد عمليات مسجلة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtitle }: any) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform"></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
        {title}
      </p>
      <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      <p className="text-[10px] text-slate-400 font-bold mt-2">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
