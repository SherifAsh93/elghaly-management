
import React, { useState } from 'react';
import { UserSquare2, Plus, DollarSign, Briefcase, Search, Edit, Trash2, X, ArrowDownCircle } from 'lucide-react';
import { Employee, UserRole } from '../types';

interface EmployeesListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  userRole: UserRole;
}

const EmployeesList: React.FC<EmployeesListProps> = ({ employees, setEmployees, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userRole !== UserRole.ADMIN) return;
    
    const formData = new FormData(e.currentTarget);
    const empData: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: formData.get('name') as string,
      position: formData.get('position') as string,
      salary: Number(formData.get('salary')),
      advances: Number(formData.get('advances') || 0),
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? empData : e));
    } else {
      setEmployees(prev => [...prev, empData]);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const deleteEmployee = (id: string) => {
    if (userRole !== UserRole.ADMIN) return;
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const addAdvance = (id: string) => {
    const amount = prompt('أدخل مبلغ السلفة الجديد:');
    if (amount && !isNaN(Number(amount))) {
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, advances: e.advances + Number(amount) } : e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="بحث عن موظف..."
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {userRole === UserRole.ADMIN && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            إضافة موظف جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                {emp.name.charAt(0)}
              </div>
              {userRole === UserRole.ADMIN && (
                <div className="flex gap-1">
                  <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => deleteEmployee(emp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{emp.name}</h3>
            <p className="text-slate-500 text-sm flex items-center gap-1 mb-4">
              <Briefcase size={14} /> {emp.position}
            </p>
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">الراتب الأساسي:</span>
                <span className="font-bold">{emp.salary.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">السلف:</span>
                <span className="font-bold text-red-500">{emp.advances.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed border-slate-100">
                <span className="font-bold text-slate-700">صافي المستحق:</span>
                <span className="font-black text-green-600">{(emp.salary - emp.advances).toLocaleString()} ج.م</span>
              </div>
            </div>
            {userRole === UserRole.ADMIN && (
              <button 
                onClick={() => addAdvance(emp.id)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-xs"
              >
                <ArrowDownCircle size={14} />
                تسجيل سلفة
              </button>
            )}
          </div>
        ))}
        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
            <UserSquare2 size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا يوجد موظفين مسجلين</p>
          </div>
        )}
      </div>

      {isModalOpen && userRole === UserRole.ADMIN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold">{editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم الموظف</label>
                <input name="name" defaultValue={editingEmployee?.name} required className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="الاسم بالكامل" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">المسمى الوظيفي</label>
                <input name="position" defaultValue={editingEmployee?.position} required className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="مثلاً: أمين مخزن" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">الراتب الشهري</label>
                  <input type="number" name="salary" defaultValue={editingEmployee?.salary} required className="w-full p-2.5 border border-slate-200 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">السلف الحالية</label>
                  <input type="number" name="advances" defaultValue={editingEmployee?.advances || 0} className="w-full p-2.5 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-orange-600/20">حفظ الموظف</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesList;
