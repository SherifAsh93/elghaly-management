
import React, { useState, useEffect } from 'react';
import { type Employee } from '../lib/types';

interface EmployeesProps {
  isAdmin: boolean;
}

const Employees: React.FC<EmployeesProps> = ({ isAdmin }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', role: '', phone: '', salary: 0 });
  const [advanceData, setAdvanceData] = useState({ id: 0, amount: '', name: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/employees/${formData.id}` : '/api/employees';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary)
        })
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', role: '', phone: '', salary: 0 });
        fetchData();
      } else {
        alert("خطأ في الحفظ");
      }
    } catch (err) { alert("خطأ في الاتصال"); }
  };

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(advanceData.amount);
    if (!advanceData.id || isNaN(amount)) return;

    try {
      const res = await fetch('/api/employees/advance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: advanceData.id, amount })
      });
      if (res.ok) {
        setShowAdvanceModal(false);
        setAdvanceData({ id: 0, amount: '', name: '' });
        fetchData();
      } else {
        alert("فشل تحديث السلفة");
      }
    } catch (err) {
      alert("خطأ في الاتصال");
    }
  };

  const deleteEmp = async (id: number) => {
    if (confirm('هل تريد حذف بيانات الموظف نهائياً؟')) {
      try {
        const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
      } catch (err) {
        alert("فشل الحذف");
      }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">إدارة شؤون الموظفين</h3>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">إجمالي الكوادر: {employees.length}</p>
        </div>
        <button onClick={() => { setFormData({name:'', role:'', phone:'', salary:0}); setIsEditMode(false); setShowModal(true); }} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-900/10 hover:bg-orange-700 transition-all active:scale-95">
          + تعيين موظف جديد
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md animate-in zoom-in-95 shadow-2xl p-10 space-y-6 border border-slate-100">
              <h3 className="text-2xl font-black text-slate-800">{isEditMode ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد'}</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الاسم الثلاثي</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المسمى الوظيفي</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الراتب الأساسي</label>
                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl text-emerald-600 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الاتصال</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left font-mono" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <button onClick={handleSubmit} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-900/10 hover:bg-orange-700 transition-all active:scale-95">حفظ السجلات</button>
              <button onClick={() => setShowModal(false)} className="w-full text-slate-400 py-2 font-bold hover:text-slate-600 transition-colors">إلغاء</button>
           </div>
        </div>
      )}

      {showAdvanceModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 space-y-6 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black text-orange-600 tracking-tight">سداد سلفة: {advanceData.name}</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">المبلغ المطلوب سحبه</label>
                <input type="number" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-4xl text-center font-black text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none" value={advanceData.amount} onChange={e => setAdvanceData({...advanceData, amount: e.target.value})} />
              </div>
              <button onClick={handleAdvanceSubmit} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-900/10 hover:bg-orange-700 transition-all active:scale-95">اعتماد السلفة</button>
              <button onClick={() => setShowAdvanceModal(false)} className="w-full text-slate-400 py-2 font-bold hover:text-slate-600 transition-colors">إغلاق</button>
           </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6">الموظف</th>
              <th className="px-10 py-6 text-center">الراتب الشهري</th>
              <th className="px-10 py-6 text-center text-orange-600">إجمالي السلف</th>
              <th className="px-10 py-6 text-center">المستحق الحالي</th>
              <th className="px-10 py-6 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-black text-xl animate-pulse">جاري تحميل سجلات الموظفين...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-bold opacity-50 uppercase tracking-widest">لا يوجد موظفين مسجلين حالياً</td></tr>
            ) : (
              employees.map(emp => {
                const remaining = (Number(emp.salary) || 0) - (Number(emp.salaryAdvance) || 0);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="font-black text-slate-800 text-lg">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{emp.role}</div>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-slate-700">{(Number(emp.salary) || 0).toLocaleString()}</td>
                    <td className="px-10 py-8 text-center font-black text-orange-600">{(Number(emp.salaryAdvance) || 0).toLocaleString()}</td>
                    <td className="px-10 py-8 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-2xl font-black text-sm border border-indigo-100 shadow-sm">
                        {remaining.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => { setAdvanceData({id: emp.id!, amount:'', name: emp.name}); setShowAdvanceModal(true); }} className="bg-orange-50 text-orange-700 px-6 py-2.5 rounded-xl text-xs font-black border border-orange-100 shadow-sm hover:scale-105 transition-all">سلفة</button>
                        <button onClick={() => { setFormData({id: emp.id, name: emp.name, role: emp.role, phone: emp.phone, salary: emp.salary}); setIsEditMode(true); setShowModal(true); }} className="bg-white border border-slate-100 text-slate-400 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all">⚙️</button>
                        {isAdmin && <button onClick={() => deleteEmp(emp.id!)} className="w-10 h-10 flex items-center justify-center text-rose-300 hover:text-rose-600 transition-colors">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
