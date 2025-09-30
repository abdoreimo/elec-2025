
import React from 'react';
import type { Section } from '../types';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'bg-amber-400 text-white shadow-inner';
  const inactiveClasses = 'bg-white/50 hover:bg-amber-100 text-amber-900';
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out flex items-center gap-2 text-sm sm:text-base ${isActive ? activeClasses : inactiveClasses}`}
    >
      <i className={`fa-solid ${icon}`}></i>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'institution-info', label: 'معلومات المؤسسة', icon: 'fa-building' },
    { id: 'beneficiary-management', label: 'إدارة المستفيدين', icon: 'fa-users' },
    { id: 'compensation-management', label: 'إدارة التعويضات', icon: 'fa-money-bill-wave' },
    { id: 'reporting', label: 'التقارير والتصدير', icon: 'fa-file-alt' },
    { id: 'backup-restore', label: 'النسخ الاحتياطي', icon: 'fa-database' },
  ];

  return (
    <header className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-5 rounded-2xl shadow-xl text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-shadow">
        برنامج حساب تعويض 50% من استهلاك الكهرباء والغاز
      </h1>
      <nav className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {navItems.map(item => (
          <NavButton
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
          />
        ))}
      </nav>
    </header>
  );
};

export default Header;
