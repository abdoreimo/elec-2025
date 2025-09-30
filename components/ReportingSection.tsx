
import React, { useMemo } from 'react';
import type { InstitutionInfo, Beneficiary, Compensation } from '../types';
import Section from './Section';
import Button from './common/Button';
import { exportToXLSX, exportToTXT, generateReportHTML, printReport } from '../utils/export';

interface ReportingSectionProps {
  institutionInfo: InstitutionInfo;
  beneficiaries: Beneficiary[];
  compensations: Compensation[];
}

const ReportingSection: React.FC<ReportingSectionProps> = ({ institutionInfo, beneficiaries, compensations }) => {

    const reportHTML = useMemo(() => 
        generateReportHTML({institutionInfo, beneficiaries, compensations}, false),
        [institutionInfo, beneficiaries, compensations]
    );

    const handlePrint = () => {
        printReport({ institutionInfo, beneficiaries, compensations });
    };

    const handleExportXLSX = () => {
        exportToXLSX({ institutionInfo, beneficiaries, compensations });
    };

    const handleExportTXT = () => {
        exportToTXT({ institutionInfo, beneficiaries, compensations });
    };

    return (
        <Section title="التقارير والتصدير">
            <p className="mb-6 text-stone-600">
                سيتم إنشاء التقرير بناءً على معلومات المؤسسة وقائمة المستفيدين وتعويضاتهم المحفوظة.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
                <Button onClick={handlePrint} variant="info" icon="fa-print">طباعة التقرير</Button>
                <Button onClick={handleExportXLSX} variant="success" icon="fa-file-excel">تصدير XLSX</Button>
                <Button onClick={handleExportTXT} variant="primary" icon="fa-file-code">تصدير ملف TXT</Button>
            </div>
            
            <h3 className="text-xl font-bold text-amber-800 mt-8 mb-4">معاينة التقرير</h3>
            <div 
                className="p-4 border-2 border-dashed border-amber-300 rounded-lg bg-white overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: reportHTML }}
            />
            <div id="print-report-content" className="hidden"></div>
        </Section>
    );
};

export default ReportingSection;
