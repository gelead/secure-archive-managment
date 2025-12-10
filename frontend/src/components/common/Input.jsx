import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-slate-300 mb-1 text-sm font-medium">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${className} ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;

