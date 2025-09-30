
import React, { useRef } from 'react';
import type { InstitutionInfo, Beneficiary, Compensation } from '../types';
import Section from './Section';
import Button from './common/Button';

interface BackupRestoreSectionProps {
  institutionInfo: InstitutionInfo;
  beneficiaries: Beneficiary[];
  compensations: Compensation[];
  restoreData: (data: {
    institutionInfo: InstitutionInfo;
    beneficiaries: Beneficiary[];
    compensations: Compensation[];
  }) => void;
}

const BackupRestoreSection: React.FC<BackupRestoreSectionProps> = ({ institutionInfo, beneficiaries, compensations, restoreData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreateBackup = () => {
        const backupData = {
            institutionInfo,
            beneficiaries,
            compensations,
        };
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
        a.download = `CompensationBackup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.json')) {
            alert('الرجاء اختيار ملف JSON صالح.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                if (window.confirm('هل أنت متأكد من استعادة البيانات؟ سيتم استبدال جميع البيانات الحالية.')) {
                    restoreData(data);
                }
            } catch (error) {
                alert('خطأ في قراءة ملف النسخة الاحتياطية.');
                console.error("Restore error:", error);
            }
        };
        reader.readAsText(file);
        
        // Reset file input value to allow re-selection of the same file
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <Section title="النسخ الاحتياطي والاستعادة">
            <p className="mb-6 text-stone-600">
                يمكنك إنشاء نسخة احتياطية لجميع بياناتك الحالية (معلومات المؤسسة، المستفيدين، والتعويضات) في ملف واحد. يمكنك استخدام هذا الملف لاحقاً لاستعادة البيانات.
            </p>
            <div className="flex flex-wrap gap-4">
                <Button onClick={handleCreateBackup} variant="success" icon="fa-download">
                    إنشاء نسخة احتياطية
                </Button>
                <Button onClick={handleRestoreClick} variant="primary" icon="fa-upload">
                    استعادة من نسخة احتياطية
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />
            </div>
        </Section>
    );
};

export default BackupRestoreSection;
