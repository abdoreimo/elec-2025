
import { useState, useEffect, useCallback } from 'react';
import type { InstitutionInfo, Beneficiary, Compensation } from '../types';
import { calculateQuarterlyComp } from '../utils/calculations';

const defaultInstitutionInfo: InstitutionInfo = {
    republic: "الجمهورية الجزائرية الديمقراطية الشعبية",
    ministry: "وزارة التربية الوطنية",
    directorate: "مديرية التربية لولاية أدرار",
    institution: "متوسطة حكومي قدور بن علال",
    fiscalYear: new Date().getFullYear().toString(),
    financialMonth: "",
    treasuryAccount: "",
    treasuryKey: "",
    orderNumber: "",
    transferNumber: ""
};

const useAppData = () => {
    const [institutionInfo, setInstitutionInfo] = useState<InstitutionInfo>(defaultInstitutionInfo);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [compensations, setCompensations] = useState<Compensation[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const savedInfo = localStorage.getItem('institutionInfo');
            if (savedInfo) {
                const parsedInfo = JSON.parse(savedInfo);
                setInstitutionInfo(prev => ({ ...prev, ...parsedInfo }));
            }

            const savedBeneficiaries = localStorage.getItem('beneficiaries');
            if (savedBeneficiaries) {
                setBeneficiaries(JSON.parse(savedBeneficiaries));
            }

            const savedCompensations = localStorage.getItem('compensations');
             if (savedCompensations) {
                const parsedCompensations: Compensation[] = JSON.parse(savedCompensations);
                // Data migration/cleaning for old data structures
                const cleanedCompensations = parsedCompensations.map(comp => {
                    const q1 = { nofees: 0, value: 0, contrib: 0, ...comp.q1 };
                    const q2 = { nofees: 0, value: 0, contrib: 0, ...comp.q2 };
                    const q3 = { nofees: 0, value: 0, contrib: 0, ...comp.q3 };
                    const q4 = { nofees: 0, value: 0, contrib: 0, ...comp.q4 };

                    q1.calculated = calculateQuarterlyComp(q1.nofees, q1.value, q1.contrib);
                    q2.calculated = calculateQuarterlyComp(q2.nofees, q2.value, q2.contrib);
                    q3.calculated = calculateQuarterlyComp(q3.nofees, q3.value, q3.contrib);
                    q4.calculated = calculateQuarterlyComp(q4.nofees, q4.value, q4.contrib);

                    const discount = comp.discount || 0;
                    const netPayable = (q1.calculated + q2.calculated + q3.calculated + q4.calculated) - discount;

                    return { ...comp, q1, q2, q3, q4, discount, netPayable };
                });
                setCompensations(cleanedCompensations);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('institutionInfo', JSON.stringify(institutionInfo));
            localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
            localStorage.setItem('compensations', JSON.stringify(compensations));
        }
    }, [institutionInfo, beneficiaries, compensations, isLoaded]);

    const getNextBeneficiaryId = useCallback(() => {
        if (beneficiaries.length === 0) return 1;
        return Math.max(...beneficiaries.map(b => b.id)) + 1;
    }, [beneficiaries]);

    const addBeneficiary = useCallback((beneficiary: Omit<Beneficiary, 'id'>) => {
        setBeneficiaries(prev => [...prev, { ...beneficiary, id: getNextBeneficiaryId() }]);
    }, [getNextBeneficiaryId]);

    const updateBeneficiary = useCallback((updatedBeneficiary: Beneficiary) => {
        setBeneficiaries(prev => prev.map(b => b.id === updatedBeneficiary.id ? updatedBeneficiary : b));
    }, []);

    const deleteBeneficiary = useCallback((beneficiaryId: number) => {
        const newBeneficiaries = beneficiaries.filter(b => b.id !== beneficiaryId)
            .map((b, index) => ({...b, id: index + 1}));
        
        const oldIdToNewIdMap = new Map<number, number>();
        beneficiaries.forEach(b => {
            const newB = newBeneficiaries.find(nb => nb.name === b.name && nb.account === b.account);
            if (newB) {
                oldIdToNewIdMap.set(b.id, newB.id);
            }
        });

        setBeneficiaries(newBeneficiaries);
        setCompensations(prev =>
            prev.filter(c => c.beneficiaryId !== beneficiaryId)
                .map(c => ({...c, beneficiaryId: oldIdToNewIdMap.get(c.beneficiaryId) || c.beneficiaryId}))
        );
    }, [beneficiaries]);

    const upsertCompensation = useCallback((compensation: Compensation) => {
        setCompensations(prev => {
            const index = prev.findIndex(c => c.beneficiaryId === compensation.beneficiaryId);
            if (index > -1) {
                const newComps = [...prev];
                newComps[index] = compensation;
                return newComps;
            }
            return [...prev, compensation];
        });
    }, []);

    const deleteCompensation = useCallback((beneficiaryId: number) => {
        setCompensations(prev => prev.filter(c => c.beneficiaryId !== beneficiaryId));
    }, []);
    
    const restoreData = useCallback((data: { institutionInfo: InstitutionInfo, beneficiaries: Beneficiary[], compensations: Compensation[] }) => {
        if (data.institutionInfo && data.beneficiaries && data.compensations) {
            setInstitutionInfo(data.institutionInfo);
            setBeneficiaries(data.beneficiaries);
            setCompensations(data.compensations);
            alert('تم استعادة البيانات بنجاح.');
        } else {
            alert('ملف النسخة الاحتياطية غير صالح.');
        }
    }, []);

    return {
        institutionInfo,
        setInstitutionInfo,
        beneficiaries,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        compensations,
        upsertCompensation,
        deleteCompensation,
        restoreData
    };
};

export default useAppData;
