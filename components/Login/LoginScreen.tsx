import React, { useState } from "react";
import { User, UserRole } from "../../types";
import Logo from "../shared/Logo";
import { ShieldCheck, User as UserIcon, LogIn, Lock } from "lucide-react";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [username, setUsername] = useState("mohammed"); // اسم المستخدم الافتراضي للمدير
  const [password, setPassword] = useState(""); // كلمة السر فارغة تماماً بناءً على طلبك
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // الأدمن: mohammed / 01111848813
    if (role === "ADMIN") {
      if (username === "mohammed" && password === "01111848813") {
        onLogin({ username, role: "ADMIN" });
      } else {
        setError("بيانات الدخول غير صحيحة");
      }
    } else if (role === "SALES") {
      if (username.trim() !== "") {
        onLogin({ username, role: "SALES" });
      } else {
        setError("يرجى إدخال اسم المستخدم");
      }
    }
  };

  const switchToAdmin = () => {
    setRole("ADMIN");
    setUsername("mohammed");
    setPassword("");
    setError("");
  };

  const switchToSales = () => {
    setRole("SALES");
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="h-contain w-full bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white p-4 flex flex-col items-center">
        {/* Logo positioned separately */}
        <div className="flex justify-center mb-8">
          <Logo
            size="xl"
            height="h-25"
            width="w-60"
            className="scale-x-120"
            showImage={true}
            showText={true}
          />
        </div>

        {/* Form with proper spacing */}
        <div className="w-full space-y-6 mt-0">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={switchToAdmin}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${role === "ADMIN" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`}
            >
              <ShieldCheck size={18} />
              مدير
            </button>
            <button
              type="button"
              onClick={switchToSales}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${role === "SALES" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`}
            >
              <UserIcon size={18} />
              مبيعات
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
                مستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold outline-none text-right transition-all"
                placeholder={role === "ADMIN" ? "اسم المستخدم" : "أدخل اسمك"}
                required
              />
            </div>

            {role === "ADMIN" && (
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
                  كلمة السر
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold outline-none text-right transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-center font-black text-xs bg-red-50 py-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-60 h-10 mx-auto bg-slate-900 hover:bg-orange-600 text-white py-4.5 rounded-[1.8rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span>دخول</span>
              <LogIn size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
