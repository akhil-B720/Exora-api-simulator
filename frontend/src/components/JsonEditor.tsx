import React, { useState, useEffect } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  height = '240px',
  placeholder = '{\n  "message": "Enter JSON payload"\n}',
  readOnly = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setError(null);
      return;
    }
    try {
      JSON.parse(value);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [value]);

  const handleFormat = () => {
    if (!value || value.trim() === '') return;
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleClear = () => {
    onChange('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="border border-border-neutral rounded bg-bg-sidebar flex flex-col overflow-hidden text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-neutral bg-bg-surface text-content-muted text-xs">
        <span className="font-mono">JSON Payload</span>
        {!readOnly && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleFormat}
              className="px-2 py-0.5 rounded border border-border-neutral hover:bg-bg-hover hover:text-content-main transition-colors text-xs font-mono"
            >
              Format JSON
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-0.5 rounded border border-border-neutral hover:bg-bg-hover hover:text-content-main transition-colors text-xs font-mono"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          style={{ height }}
          className="w-full bg-bg-sidebar text-content-main font-mono text-xs p-3 outline-none resize-y leading-relaxed border-none block"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="px-3 py-1.5 bg-rose-950/30 border-t border-rose-900/50 text-rose-400 text-xs font-mono">
          Syntax Error: {error}
        </div>
      )}
    </div>
  );
};
