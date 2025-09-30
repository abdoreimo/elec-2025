
import React, { useState, useEffect, useMemo, FormEvent, useCallback } from 'react';
import type { Beneficiary, Compensation, QuarterData } from '../types';
import { calculateRIP, calculateQuarterlyComp, formatCurrency } from '../utils/calculations';
import Section from './Section';
import Input from './common/Input';
import Button from './common/Button';

interface CompensationManagementSectionProps {
  beneficiaries: Beneficiary[];
  compensations: Compensation[];
  upsertCompensation: (compensation: Compensation) => void;
  deleteCompensation: (beneficiaryId: number) => void;
}

const defaultQuarterData: QuarterData = { nofees: 0, value: 0, contrib: 0, calculated: 0 };

// FIX: Updated the onChange prop to use a specific union type for qId.
const QuarterInputGroup: React.FC<{ title: string, qId: 'q1' | 'q2' | 'q3' | 'q4', data: QuarterData, onChange: (qId: 'q1' | 'q2' | 'q3' | 'q4', field: string, value: number) => void }> = ({ title, qId, data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(qId, e.target.name, parseFloat(e.target.value) || 0);
    };
    return (
        <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 flex-1 min-w-[280px]">
            <h4 className="font-bold text-amber-700 mb-3">{title}</h4>
            <div className="space-y-2">
                <Input label="المبلغ دون رسوم:" type="number" step="0.01" name="nofees" value={data.nofees} onChange={handleChange} />
                <Input label="القيمة المضافة:" type="number" step="0.01" name="value" value={data.value} onChange={handleChange} />
                <Input label="مساهمة الدولة:" type="number" step="0.01" name="contrib" value={data.contrib} onChange={handleChange} />
            </div>
        </div>
    );
};

const CompensationManagementSection: React.FC<CompensationManagementSectionProps> = ({ beneficiaries, compensations, upsertCompensation, deleteCompensation }) => {
    const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [compData, setCompData] = useState<{ q1: QuarterData, q2: QuarterData, q3: QuarterData, q4: QuarterData, discount: number }>({
        q1: { ...defaultQuarterData },
        q2: { ...defaultQuarterData },
        q3: { ...defaultQuarterData },
        q4: { ...defaultQuarterData },
        discount: 0
    });

    const resetForm = useCallback(() => {
        setCompData({
            q1: { ...defaultQuarterData }, q2: { ...defaultQuarterData },
            q3: { ...defaultQuarterData }, q4: { ...defaultQuarterData },
            discount: 0
        });
    }, []);

    useEffect(() => {
        if (selectedBeneficiaryId) {
            const existingComp = compensations.find(c => c.beneficiaryId === parseInt(selectedBeneficiaryId));
            if (existingComp) {
                setCompData({
                    q1: existingComp.q1, q2: existingComp.q2,
                    q3: existingComp.q3, q4: existingComp.q4,
                    discount: existingComp.discount || 0
                });
            } else {
                resetForm();
            }
        } else {
            resetForm();
        }
    }, [selectedBeneficiaryId, compensations, resetForm]);
    
    // FIX: Typed qId to ensure it's a key for a QuarterData object, resolving the spread operator error.
    const handleQuarterChange = (qId: 'q1' | 'q2' | 'q3' | 'q4', field: string, value: number) => {
        setCompData(prev => ({
            ...prev,
            [qId]: { ...prev[qId], [field]: value }
        }));
    };
    
    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }));
    };

    const filteredBeneficiaries = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return beneficiaries.filter(b => 
            b.name.toLowerCase().includes(lowerSearch) ||
            b.account.includes(lowerSearch)
        ).sort((a,b) => a.name.localeCompare(b.name));
    }, [beneficiaries, searchTerm]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedBeneficiaryId) {
            alert('الرجاء اختيار مستفيد أولاً.');
            return;
        }

        const q1_calc = calculateQuarterlyComp(compData.q1.nofees, compData.q1.value, compData.q1.contrib);
        const q2_calc = calculateQuarterlyComp(compData.q2.nofees, compData.q2.value, compData.q2.contrib);
        const q3_calc = calculateQuarterlyComp(compData.q3.nofees, compData.q3.value, compData.q3.contrib);
        const q4_calc = calculateQuarterlyComp(compData.q4.nofees, compData.q4.value, compData.q4.contrib);
        const netPayable = (q1_calc + q2_calc + q3_calc + q4_calc) - compData.discount;

        const finalCompensation: Compensation = {
            beneficiaryId: parseInt(selectedBeneficiaryId),
            q1: { ...compData.q1, calculated: q1_calc },
            q2: { ...compData.q2, calculated: q2_calc },
            q3: { ...compData.q3, calculated: q3_calc },
            q4: { ...compData.q4, calculated: q4_calc },
            discount: compData.discount,
            netPayable: netPayable
        };

        upsertCompensation(finalCompensation);
        alert('تم حساب وحفظ التعويض بنجاح.');
        setSelectedBeneficiaryId('');
    };

    const summaryData = useMemo(() => {
        return compensations.map(comp => {
            const beneficiary = beneficiaries.find(b => b.id === comp.beneficiaryId);
            return beneficiary ? { ...comp, name: beneficiary.name, meter: beneficiary.meter, account: beneficiary.account } : null;
        }).filter(Boolean).sort((a, b) => (a?.beneficiaryId || 0) - (b?.beneficiaryId || 0));
    }, [compensations, beneficiaries]);

    const totals = useMemo(() => ({
        discount: summaryData.reduce((acc, item) => acc + (item?.discount || 0), 0),
        netPayable: summaryData.reduce((acc, item) => acc + (item?.netPayable || 0), 0)
    }), [summaryData]);

    return (
        <Section title="إدارة التعويضات">
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                    <div>
                        <label className="block mb-2 font-semibold text-amber-900">البحث عن مستفيد:</label>
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ابحث بالاسم أو رقم الحساب" className="w-full px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="select-beneficiary" className="block mb-2 font-semibold text-amber-900">اختيار المستفيد:</label>
                        <select id="select-beneficiary" value={selectedBeneficiaryId} onChange={e => setSelectedBeneficiaryId(e.target.value)} className="w-full px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 outline-none h-[46px]">
                            <option value="">-- اختر مستفيداً --</option>
                            {filteredBeneficiaries.map(b => (
                                <option key={b.id} value={b.id}>{b.name} ({b.account})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <QuarterInputGroup title="الثلاثي الأول" qId="q1" data={compData.q1} onChange={handleQuarterChange} />
                    <QuarterInputGroup title="الثلاثي الثاني" qId="q2" data={compData.q2} onChange={handleQuarterChange} />
                    <QuarterInputGroup title="الثلاثي الثالث" qId="q3" data={compData.q3} onChange={handleQuarterChange} />
                    <QuarterInputGroup title="الثلاثي الرابع" qId="q4" data={compData.q4} onChange={handleQuarterChange} />
                </div>
                
                <div className="max-w-xs">
                     <Input label="الخصم:" type="number" step="0.01" value={compData.discount} onChange={handleDiscountChange} />
                </div>

                <Button type="submit" variant="primary" icon="fa-file-invoice-dollar" disabled={!selectedBeneficiaryId}>حساب وحفظ التعويض</Button>
            </form>

            <h3 className="text-xl font-bold text-amber-800 mt-12 mb-4">ملخص التعويضات</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="w-full text-right text-sm">
                    <thead className="bg-amber-100 text-amber-900">
                        <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">الاسم</th>
                            <th className="p-3">رقم RIP</th>
                            <th className="p-3">ث 1</th>
                            <th className="p-3">ث 2</th>
                            <th className="p-3">ث 3</th>
                            <th className="p-3">ث 4</th>
                            <th className="p-3">الخصم</th>
                            <th className="p-3">الصافي للدفع</th>
                            <th className="p-3">إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.map(item => item && (
                            <tr key={item.beneficiaryId} className="border-b border-amber-100 hover:bg-amber-50/50">
                                <td className="p-2">{item.beneficiaryId}</td>
                                <td className="p-2 font-medium">{item.name}</td>
                                <td className="p-2 font-mono">{calculateRIP(item.account)}</td>
                                <td className="p-2">{formatCurrency(item.q1.calculated)}</td>
                                <td className="p-2">{formatCurrency(item.q2.calculated)}</td>
                                <td className="p-2">{formatCurrency(item.q3.calculated)}</td>
                                <td className="p-2">{formatCurrency(item.q4.calculated)}</td>
                                <td className="p-2 text-red-600">{formatCurrency(item.discount)}</td>
                                <td className="p-2 font-bold">{formatCurrency(item.netPayable)}</td>
                                <td className="p-2 text-center">
                                    <button onClick={() => deleteCompensation(item.beneficiaryId)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"><i className="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-amber-200 font-bold text-amber-900">
                        <tr>
                            <td colSpan={7} className="p-3 text-center">المجموع</td>
                            <td className="p-3">{formatCurrency(totals.discount)}</td>
                            <td className="p-3">{formatCurrency(totals.netPayable)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

        </Section>
    );
};

export default CompensationManagementSection;