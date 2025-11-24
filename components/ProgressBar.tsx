import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, ((current) / total) * 100));

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%` }}
      ></div>
      <p className="text-xs text-gray-500 text-right mt-1">
        문제 {current + 1} / {total}
      </p>
    </div>
  );
};