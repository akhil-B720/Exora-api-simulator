import React from 'react';
import type { HttpMethod } from '../types';

interface MethodBadgeProps {
  method: HttpMethod | string;
  size?: 'sm' | 'md';
}

export const MethodBadge: React.FC<MethodBadgeProps> = ({ method, size = 'md' }) => {
  const upper = (method || 'GET').toUpperCase();

  const getStyle = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-blue-950/40 text-blue-400 border-blue-900/60';
      case 'POST':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60';
      case 'PUT':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/60';
      case 'PATCH':
        return 'bg-purple-950/40 text-purple-400 border-purple-900/60';
      case 'DELETE':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/60';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border tracking-wider uppercase ${sizeClasses} ${getStyle(
        upper
      )}`}
    >
      {upper}
    </span>
  );
};
