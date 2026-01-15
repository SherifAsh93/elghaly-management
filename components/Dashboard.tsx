import React, { useState, useEffect } from "react";

interface Stats {
  totalInventory: number;
  totalSales: number;
  clientCount: number;
  pendingAdvances: number;
  expectedIncome: number;
  monthlyIncome: Array<{ month: string; income: number }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalInventory: 0,
    totalSales: 0,
    clientCount: 0,
    pendingAdvances: 0,
    expectedIncome: 0,
    monthlyIncome: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [setupStatus, setSetupStatus] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Server responded with error");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.warn("Dashboard fetch failed", err);
      setErrorOccurred(true);
    } finally {
      setLoading(false);
    }
  };

  const runDbSetup = async () => {
    setSetupStatus("جاري التحقق...");
    try {
      const res = await fetch("/api/setup-db");
      const data = await res.json();
      if (data.success) {
        setSetupStatus("✅ تم تفعيل الجداول بنجاح");
        fetchStats();
      } else {
        setSetupStatus("❌ فشل: " + data.error);
      }
    } catch (err) {
      setSetupStatus("❌ خطأ في الاتصال");
    }
    setTimeout(() => setSetupStatus(null), 5000);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const incomeValues = stats.monthlyIncome?.map((m) => m.income) || [];
  const maxMonthly = incomeValues.length > 0 ? Math.max(...incomeValues) : 0;

  if (loading)
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 animate-pulse">
          جاري تحميل لوحة التحكم...
        </p>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* DB Setup Helper */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🛠️</span>
          <div>
            <p className="font-black text-orange-900 text-sm">
              إعداد قاعدة البيانات السحابية
            </p>
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">
              يجب الضغط هنا مرة واحدة عند أول تشغيل أو عند حدوث أخطاء في الحفظ
            </p>
          </div>
        </div>
        <button
          onClick={runDbSetup}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-orange-700 transition-all shadow-lg"
        >
          {setupStatus || "تنشيط جداول البيانات"}
        </button>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="ربطات المخزن"
          value={(stats.totalInventory || 0).toLocaleString()}
          icon="🪵"
          color="bg-indigo-600"
        />
        <StatCard
          title="إجمالي المبيعات"
          value={(stats.totalSales || 0).toLocaleString() + " ج.م"}
          icon="💹"
          color="bg-emerald-600"
        />
        <StatCard
          title="الدخل المتوقع"
          value={(stats.expectedIncome || 0).toLocaleString() + " ج.م"}
          icon="💰"
          color="bg-amber-500"
        />
        <StatCard
          title="عدد العملاء"
          value={(stats.clientCount || 0).toString()}
          icon="🤝"
          color="bg-violet-600"
        />
        <StatCard
          title="سلف الموظفين"
          value={(stats.pendingAdvances || 0).toLocaleString() + " ج.م"}
          icon="💸"
          color="bg-rose-600"
        />
      </div>

      {/* Main Stats Chart */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 pb-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2 block">
              التحليل المالي المرئي
            </span>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              إحصائيات الدخل والنمو
            </h3>
            <p className="text-sm text-slate-400 font-bold mt-1">
              تتبع التدفقات المالية لآخر 6 أشهر من العمليات
            </p>
          </div>
        </div>

        <div className="p-12 bg-gradient-to-b from-white to-slate-50/30">
          <div className="flex items-end justify-between h-72 gap-6">
            {stats.monthlyIncome && stats.monthlyIncome.length > 0 ? (
              stats.monthlyIncome.map((m, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-6 group"
                >
                  <div className="relative w-full flex flex-col justify-end h-56">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[11px] px-4 py-2 rounded-xl font-black pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      {m.income.toLocaleString()} ج.م
                    </div>
                    <div
                      className="w-full bg-slate-100 rounded-t-[1.5rem] transition-all duration-1000 group-hover:bg-orange-600 group-hover:shadow-[0_-15px_35px_rgba(249,115,22,0.2)] relative"
                      style={{
                        height: `${
                          maxMonthly > 0 ? (m.income / maxMonthly) * 100 : 0
                        }%`,
                        minHeight: "8px",
                      }}
                    >
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-[1.5rem]"></div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    {m.month}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 font-bold uppercase tracking-widest gap-4">
                <span className="text-6xl opacity-20">📊</span>
                <p>لا توجد بيانات دخل كافية للعرض حالياً</p>
                {errorOccurred && (
                  <p className="text-[10px] text-rose-400 font-black">
                    خطأ في الاتصال بالسيرفر - يرجى تنشيط الجداول أعلاه
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative text-center">
    <div
      className={`${color} w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform mb-4`}
    >
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
      {title}
    </p>
    <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

export default Dashboard;
