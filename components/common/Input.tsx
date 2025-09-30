
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 font-semibold text-amber-900">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 outline-none"
      />
    </div>
  );
};

export default Input;
