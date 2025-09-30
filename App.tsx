
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Ticker from './components/Ticker';
import InstitutionInfoSection from './components/InstitutionInfoSection';
import BeneficiaryManagementSection from './components/BeneficiaryManagementSection';
import CompensationManagementSection from './components/CompensationManagementSection';
import ReportingSection from './components/ReportingSection';
import BackupRestoreSection from './components/BackupRestoreSection';
import useAppData from './hooks/useAppData';
import type { Section } from './types';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('institution-info');
  const appData = useAppData();

  const renderSection = useCallback(() => {
    switch (activeSection) {
      case 'institution-info':
        return <InstitutionInfoSection {...appData} />;
      case 'beneficiary-management':
        return <BeneficiaryManagementSection {...appData} />;
      case 'compensation-management':
        return <CompensationManagementSection {...appData} />;
      case 'reporting':
        return <ReportingSection {...appData} />;
      case 'backup-restore':
        return <BackupRestoreSection {...appData} />;
      default:
        return <InstitutionInfoSection {...appData} />;
    }
  }, [activeSection, appData]);

  return (
    <div className="bg-amber-50 min-h-screen text-stone-800">
      <div 
        className="fixed inset-0 z-0 opacity-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpolygon fill='%23FBBF24' points='60 0 120 30 120 90 60 120 0 90 0 30'/%3E%3C/svg%3E")`,
          backgroundSize: '30px'
        }}
      ></div>
      <div className="relative z-10 p-4 sm:p-6 pb-20">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="mt-6">
          {renderSection()}
        </main>
      </div>
      <Ticker />
    </div>
  );
}

export default App;
