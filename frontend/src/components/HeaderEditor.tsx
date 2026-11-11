import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from './icons';

interface HeaderRow {
  key: string;
  value: string;
}

interface HeaderEditorProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  value,
  onChange,
  title = 'Response Headers',
}) => {
  const [rows, setRows] = useState<HeaderRow[]>([]);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setRows([]);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        const loadedRows: HeaderRow[] = Object.entries(parsed).map(([k, v]) => ({
          key: k,
          value: String(v),
        }));
        setRows(loadedRows);
        return;
      }
    } catch {
      // Ignore parse failure on external change
    }
  }, [value]);

  const updateSerialized = (newRows: HeaderRow[]) => {
    setRows(newRows);
    const obj: Record<string, string> = {};
    newRows.forEach((r) => {
      if (r.key.trim()) {
        obj[r.key.trim()] = r.value;
      }
    });
    onChange(Object.keys(obj).length > 0 ? JSON.stringify(obj, null, 2) : '');
  };

  const handleAddRow = () => {
    updateSerialized([...rows, { key: '', value: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    updateSerialized(updated);
  };

  const handleChangeRow = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...rows];
    updated[index][field] = val;
    updateSerialized(updated);
  };

  return (
    <div className="border border-border-neutral rounded bg-bg-surface flex flex-col overflow-hidden text-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-neutral text-xs text-content-muted">
        <span className="font-mono">{title}</span>
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-border-neutral hover:bg-bg-hover hover:text-content-main transition-colors text-xs font-mono"
        >
          <PlusIcon size={12} />
          <span>Add Header</span>
        </button>
      </div>

      <div className="p-3 space-y-2">
        {rows.length === 0 ? (
          <div className="text-content-faint text-xs italic py-1">
            No headers configured. Default headers (e.g. Content-Type) will be inferred.
          </div>
        ) : (
          rows.map((row, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Header Name (e.g. X-Trace-Id)"
                value={row.key}
                onChange={(e) => handleChangeRow(idx, 'key', e.target.value)}
                className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-2.5 py-1 text-xs text-content-main font-mono outline-none focus:border-border-focus"
              />
              <input
                type="text"
                placeholder="Header Value"
                value={row.value}
                onChange={(e) => handleChangeRow(idx, 'value', e.target.value)}
                className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-2.5 py-1 text-xs text-content-main font-mono outline-none focus:border-border-focus"
              />
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="p-1 rounded text-content-muted hover:text-status-error hover:bg-bg-hover transition-colors"
                title="Remove header"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
