import React from 'react';

interface StatusBadgeProps {
  status: number | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const code = typeof status === 'number' ? status : parseInt(status, 10);

  let style = 'bg-gray-800 text-gray-300 border-gray-700';

  if (!isNaN(code)) {
    if (code >= 200 && code < 300) {
      style = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60';
    } else if (code >= 300 && code < 400) {
      style = 'bg-blue-950/40 text-blue-400 border-blue-900/60';
    } else if (code >= 400 && code < 500) {
      style = 'bg-amber-950/40 text-amber-400 border-amber-900/60';
    } else if (code >= 500) {
      style = 'bg-rose-950/40 text-rose-400 border-rose-900/60';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono font-medium ${style}`}
    >
      {status}
    </span>
  );
};
