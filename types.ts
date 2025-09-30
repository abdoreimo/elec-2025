
export interface InstitutionInfo {
  republic: string;
  ministry: string;
  directorate: string;
  institution: string;
  fiscalYear: string;
  financialMonth: string;
  treasuryAccount: string;
  treasuryKey: string;
  orderNumber: string;
  transferNumber: string;
}

export interface Beneficiary {
  id: number;
  name: string;
  account: string; // CCP
  meter: string;
}

export interface QuarterData {
  nofees: number;
  value: number;
  contrib: number;
  calculated: number;
}

export interface Compensation {
  beneficiaryId: number;
  q1: QuarterData;
  q2: QuarterData;
  q3: QuarterData;
  q4: QuarterData;
  discount: number;
  netPayable: number;
}

export type Section = 
  | 'institution-info'
  | 'beneficiary-management'
  | 'compensation-management'
  | 'reporting'
  | 'backup-restore';
