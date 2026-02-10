
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, DollarSign, X, Wallet, CheckCircle2, UserCheck } from 'lucide-react';
import { Employee, UserRole } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { api } from '../../services/api';

interface EmployeeManagerProps { employees: Employee[]; onAddAdvances: (id: string, amt: number) => void; role: UserRole; }

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onAddAdvances, role }) => {
  const [solfaEmployee, setSolfaEmployee] = useState<Employee | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    position: '',
    monthlySalary: 0,
    advances: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const isAdmin = role === 'ADMIN';

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.position) return alert('يرجى ملء بيانات الموظف');
    try {
      await api.employees.create(newEmployee);
      setIsAddEmployeeOpen(false);
      setNewEmployee({ name: '', position: '', monthlySalary: 0, advances: 0, joinDate: new Date().toISOString().split('T')[0] });
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">شؤون الموظفين</h2>
          <p className="text-slate-500 text-sm font-bold mt-1">إدارة الأجور ومصروفات الموظفين (المسحوبات)</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddEmployeeOpen(true)} 
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-lg"
          >
            <Plus size={22}/>إضافة موظف
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-wider">الموظف</th>
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-wider">الراتب الأساسي</th>
              <th className="px-6 py-6 text-sm font-black text-red-500 uppercase tracking-wider">مصروفات الموظف</th>
              <th className="px-6 py-6 text-sm font-black text-emerald-600 uppercase tracking-wider">الصافي المتبقي</th>
              <th className="px-6 py-6 text-sm font-black text-slate-400 uppercase tracking-wider text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map(e => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">{e.name.charAt(0)}</div>
                    <div>
                       <p className="font-black text-slate-900 text-base">{e.name}</p>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{e.position}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-slate-700 text-base">{formatCurrency(e.monthlySalary)}</td>
                <td className="px-6 py-5 font-black text-red-500 text-base">{formatCurrency(e.advances)}</td>
                <td className="px-6 py-5 font-black text-emerald-600 text-xl">{formatCurrency(e.monthlySalary - e.advances)}</td>
                <td className="px-6 py-5">
                   <div className="flex justify-center gap-2">
                      <button onClick={()=>setSolfaEmployee(e)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 text-xs font-black"><Wallet size={16}/>تسجيل مصروفات</button>
                      {isAdmin && <button className="p-2 border rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={20}/></button>}
                   </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-20 text-center font-black text-slate-300 text-lg">لا يوجد موظفين مسجلين</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative border border-slate-100">
            <button onClick={() => setIsAddEmployeeOpen(false)} className="absolute left-6 top-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
              <X size={28}/>
            </button>
            <div className="mb-8 text-right">
              <h3 className="text-2xl font-[1000] text-slate-900">إضافة موظف جديد</h3>
              <p className="text-slate-500 font-bold mt-1">أدخل بيانات الموظف لتسجيله في كشف الأجور</p>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-6">
              <div>
                <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">الاسم الكامل</label>
                <input required type="text" value={newEmployee.name} onChange={e=>setNewEmployee({...newEmployee, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl font-bold outline-none transition-all text-base text-right" placeholder="اسم الموظف" />
              </div>
              <div>
                <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">المسمى الوظيفي</label>
                <input required type="text" value={newEmployee.position} onChange={e=>setNewEmployee({...newEmployee, position: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl font-bold outline-none transition-all text-base text-right" placeholder="مثلاً: مسؤول مخزن، محاسب..." />
              </div>
              <div>
                <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">الراتب الشهري (جنيه)</label>
                <input required type="number" value={newEmployee.monthlySalary} onChange={e=>setNewEmployee({...newEmployee, monthlySalary: parseFloat(e.target.value || '0')})} className="w-full px-6 py-4 bg-emerald-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl font-black outline-none transition-all text-2xl text-emerald-700 text-center" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl hover:bg-emerald-700 transition-all active:scale-95">
                <CheckCircle2 size={24}/>حفظ بيانات الموظف
              </button>
            </form>
          </div>
        </div>
      )}

      {solfaEmployee && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl space-y-8">
            <h3 className="text-2xl font-black text-slate-900 text-center">تسجيل مصروف للموظف: {solfaEmployee.name}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-right text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">قيمة المصروف (سيتم خصمه من الصافي)</label>
                <input type="number" placeholder="0.00" className="w-full p-6 border-2 border-red-100 rounded-2xl font-black text-3xl text-center outline-none focus:border-red-500 transition-all text-red-600" autoFocus onKeyDown={e=>{ if(e.key==='Enter') { onAddAdvances(solfaEmployee.id, Number((e.target as any).value)); setSolfaEmployee(null); }}} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => { 
                    const val = (document.querySelector('input[type="number"]') as HTMLInputElement).value;
                    if(val) { onAddAdvances(solfaEmployee.id, parseFloat(val)); setSolfaEmployee(null); }
                }} className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all text-lg">تأكيد تسجيل المصروف</button>
                <button onClick={()=>setSolfaEmployee(null)} className="px-8 py-5 text-slate-400 font-bold border rounded-2xl hover:bg-slate-50 transition-all text-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
