
import React, { useState, FormEvent, useMemo } from 'react';
import type { Beneficiary } from '../types';
import { calculateRIP } from '../utils/calculations';
import Section from './Section';
import Input from './common/Input';
import Button from './common/Button';
import EditBeneficiaryModal from './EditBeneficiaryModal';

interface BeneficiaryManagementSectionProps {
  beneficiaries: Beneficiary[];
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id'>) => void;
  updateBeneficiary: (beneficiary: Beneficiary) => void;
  deleteBeneficiary: (id: number) => void;
}

const BeneficiaryManagementSection: React.FC<BeneficiaryManagementSectionProps> = ({ beneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary }) => {
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [meter, setMeter] = useState('');
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);

  const calculatedRIP = useMemo(() => calculateRIP(account), [account]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const latinPattern = /^[a-zA-Z\s\-]+$/;

    if (!name || !account) {
      alert('الرجاء إدخال اسم المستفيد ورقم الحساب (CCP).');
      return;
    }
    if (!latinPattern.test(name)) {
      alert('الرجاء إدخال اللقب والاسم باستخدام الأحرف اللاتينية فقط.');
      return;
    }
    if (beneficiaries.some(b => b.account === account)) {
      alert(`رقم الحساب "${account}" مسجل بالفعل.`);
      return;
    }
    if (calculatedRIP.includes('خطأ') || calculatedRIP.includes('فارغ')) {
        alert('رقم الحساب (CCP) المدخل غير صالح. الرجاء التحقق منه.');
        return;
    }

    addBeneficiary({ name, account, meter });
    setName('');
    setAccount('');
    setMeter('');
    alert('تم إضافة المستفيد بنجاح.');
  };
  
  const handleDelete = (beneficiary: Beneficiary) => {
    if (window.confirm(`هل أنت متأكد من حذف المستفيد "${beneficiary.name}" وجميع تعويضاته؟`)) {
      deleteBeneficiary(beneficiary.id);
      alert(`تم حذف المستفيد "${beneficiary.name}".`);
    }
  };

  return (
    <Section title="إدارة المستفيدين">
      <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
        <i className="fas fa-user-plus text-amber-500"></i>
        إضافة مستفيد جديد
      </h3>
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
          <div className="mb-4">
              <Input 
                label="اللقب و الاسم (بالأحرف اللاتينية):" 
                id="beneficiary-name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
                pattern="^[a-zA-Z\s\-]+$"
                placeholder="Ex: John Doe"
              />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="رقم الحساب (CCP):" id="account-number" value={account} onChange={e => setAccount(e.target.value)} required />
              <Input label="رقم العداد:" id="meter-number" value={meter} onChange={e => setMeter(e.target.value)} />
              <Input label="رقم RIP الكامل (محسوب):" id="calculated-rip" value={calculatedRIP} readOnly placeholder="يتم حسابه تلقائياً" />
          </div>
          <div className="mt-6">
              <Button type="submit" variant="primary" icon="fa-plus-circle">إضافة مستفيد</Button>
          </div>
      </form>

      <h3 className="text-xl font-bold text-amber-800 mb-4">قائمة المستفيدين</h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-right">
          <thead className="bg-amber-100 text-amber-900">
            <tr>
              <th className="p-3">الرقم</th>
              <th className="p-3">اللقب و الاسم</th>
              <th className="p-3">رقم CCP</th>
              <th className="p-3">رقم RIP الكامل</th>
              <th className="p-3">رقم العداد</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((b, index) => (
              <tr key={b.id} className="border-b border-amber-100 hover:bg-amber-50/50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3">{b.account}</td>
                <td className="p-3 font-mono">{calculateRIP(b.account)}</td>
                <td className="p-3">{b.meter}</td>
                <td className="p-3">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => setEditingBeneficiary(b)} className="text-yellow-600 hover:text-yellow-800 transition-colors p-2 rounded-full hover:bg-yellow-100"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDelete(b)} className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            ))}
             {beneficiaries.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">
                        لا يوجد مستفيدون. الرجاء إضافة مستفيد جديد.
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
      {editingBeneficiary && (
        <EditBeneficiaryModal
          beneficiary={editingBeneficiary}
          onClose={() => setEditingBeneficiary(null)}
          onSave={updateBeneficiary}
          existingBeneficiaries={beneficiaries}
        />
      )}
    </Section>
  );
};

export default BeneficiaryManagementSection;
