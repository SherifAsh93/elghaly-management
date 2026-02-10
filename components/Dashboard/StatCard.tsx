import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group overflow-hidden relative">
      <div
        className={`absolute -right-2 -bottom-2 w-16 h-16 ${color} opacity-5 rounded-full blur-2xl`}
      ></div>
      <div className="relative z-10 flex items-center gap-4">
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
            {title}
          </p>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className={`${color} w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0`}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
