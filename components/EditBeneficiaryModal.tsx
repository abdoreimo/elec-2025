
import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import type { Beneficiary } from '../types';
import { calculateRIP } from '../utils/calculations';
import Input from './common/Input';
import Button from './common/Button';

interface EditBeneficiaryModalProps {
  beneficiary: Beneficiary;
  onClose: () => void;
  onSave: (beneficiary: Beneficiary) => void;
  existingBeneficiaries: Beneficiary[];
}

const EditBeneficiaryModal: React.FC<EditBeneficiaryModalProps> = ({ beneficiary, onClose, onSave, existingBeneficiaries }) => {
  const [name, setName] = useState(beneficiary.name);
  const [account, setAccount] = useState(beneficiary.account);
  const [meter, setMeter] = useState(beneficiary.meter);

  const calculatedRIP = useMemo(() => calculateRIP(account), [account]);
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
    if (existingBeneficiaries.some(b => b.account === account && b.id !== beneficiary.id)) {
      alert(`رقم الحساب "${account}" مسجل بالفعل لمستفيد آخر.`);
      return;
    }
    if (calculatedRIP.includes('خطأ') || calculatedRIP.includes('فارغ')) {
        alert('رقم الحساب (CCP) المدخل غير صالح. الرجاء التحقق منه.');
        return;
    }

    onSave({ ...beneficiary, name, account, meter });
    alert('تم حفظ التعديلات بنجاح.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-amber-50 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <i className="fas fa-user-edit text-amber-500"></i>
            تعديل بيانات المستفيد
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input label="اللقب و الاسم (بالأحرف اللاتينية):" id="edit-beneficiary-name" value={name} onChange={e => setName(e.target.value)} required pattern="^[a-zA-Z\s\-]+$" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="رقم الحساب (CCP):" id="edit-account-number" value={account} onChange={e => setAccount(e.target.value)} required />
                <Input label="رقم العداد:" id="edit-meter-number" value={meter} onChange={e => setMeter(e.target.value)} />
                <Input label="رقم RIP الكامل (محسوب):" id="edit-calculated-rip" value={calculatedRIP} readOnly />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="primary" className="bg-gray-400 hover:bg-gray-500" onClick={onClose} icon="fa-times-circle">إلغاء</Button>
            <Button type="submit" variant="success" icon="fa-save">حفظ التعديلات</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBeneficiaryModal;
