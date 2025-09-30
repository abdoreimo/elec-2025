
import React, { useState, useEffect, FormEvent } from 'react';
import type { InstitutionInfo } from '../types';
import Section from './Section';
import Input from './common/Input';
import Button from './common/Button';

interface InstitutionInfoSectionProps {
  institutionInfo: InstitutionInfo;
  setInstitutionInfo: (info: InstitutionInfo) => void;
}

const InstitutionInfoSection: React.FC<InstitutionInfoSectionProps> = ({ institutionInfo, setInstitutionInfo }) => {
  const [formData, setFormData] = useState<InstitutionInfo>(institutionInfo);

  useEffect(() => {
    setFormData(institutionInfo);
  }, [institutionInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setInstitutionInfo(formData);
    alert('تم حفظ معلومات المؤسسة.');
  };

  return (
    <Section title="معلومات المؤسسة">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="الجمهورية:" id="republic" value={formData.republic} onChange={handleChange} />
          <Input label="الوزارة:" id="ministry" value={formData.ministry} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="المديرية:" id="directorate" value={formData.directorate} onChange={handleChange} />
          <Input label="المؤسسة:" id="institution" value={formData.institution} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="السنة المالية (YYYY):" id="fiscalYear" value={formData.fiscalYear} onChange={handleChange} placeholder="مثال: 2025" maxLength={4} />
          <Input label="الشهر المالي (MM):" id="financialMonth" value={formData.financialMonth} onChange={handleChange} placeholder="مثال: 04" maxLength={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="رقم الحساب البريدي لدى الخزينة (CCP):" id="treasuryAccount" value={formData.treasuryAccount} onChange={handleChange} placeholder="حساب الخزينة CCP" />
          <Input label="مفتاح الحساب البريدي لدى الخزينة (CLE):" id="treasuryKey" value={formData.treasuryKey} onChange={handleChange} placeholder="مفتاح حساب الخزينة 02 رقم" maxLength={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="رقم الأمر بالصرف:" id="orderNumber" value={formData.orderNumber} onChange={handleChange} />
          <Input label="رقم الحوالة:" id="transferNumber" value={formData.transferNumber} onChange={handleChange} />
        </div>
        <div className="pt-4">
          <Button type="submit" variant="primary" icon="fa-save">حفظ المعلومات</Button>
        </div>
      </form>
    </Section>
  );
};

export default InstitutionInfoSection;
