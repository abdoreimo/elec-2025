
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, ...props }) => {
  const baseClasses = "px-5 py-2.5 rounded-full font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

  const colorClasses = {
    primary: 'bg-amber-500 hover:bg-amber-600',
    success: 'bg-green-600 hover:bg-green-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-stone-800',
    info: 'bg-sky-500 hover:bg-sky-600',
  };

  return (
    <button className={`${baseClasses} ${colorClasses[variant]}`} {...props}>
      {icon && <i className={`fa-solid ${icon}`}></i>}
      {children}
    </button>
  );
};

export default Button;
