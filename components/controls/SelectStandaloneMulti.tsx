// SelectStandaloneMulti.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { CommonProps, Option } from './Select.types';

export type SelectStandaloneMultiProps = CommonProps & {
  value?: Array<string | number>;
  onValueChange?: (value: Array<string | number>) => void;
  maxHeight?: string;
  overflowY?: 'auto' | 'scroll' | 'hidden' | 'visible';
};

export const SelectStandaloneMulti: React.FC<SelectStandaloneMultiProps> = (props) => {
  const {
    label, name, options, style, width = '100%', required = false, theme = 'light',
    captionPosition = 'top', id, enabled = true, visible = true,
    value = [], onValueChange, maxHeight = '150px', overflowY = 'auto',
  } = props;

  const optionMap = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(String(o.value), o);
    return m;
  }, [options]);

  const [selected, setSelected] = useState<string[]>(value.map(String));
  useEffect(() => setSelected(value.map(String)), [value]);

  if (!visible) return null;

  const coerceArray = (arr: string[]) => {
    const expectNumber =
      (value.some(v => typeof v === 'number')) ||
      (arr.length > 0 && arr.every(v => typeof optionMap.get(v)?.value === 'number'));
    return expectNumber ? arr.map(Number) : arr;
  };

  const toggle = (raw: string | number) => {
    const s = String(raw);
    const updated = selected.includes(s) ? selected.filter(v => v !== s) : [...selected, s];
    setSelected(updated);
    onValueChange?.(coerceArray(updated));
  };

  return (
    <div className={`custom-select-container ${theme} ${captionPosition}`}>
      <label className={`custom-select-label ${captionPosition}`} style={style}>
        {label} {required && '*'}
      </label>

      <div
        className="custom-multiple-select"
        style={{ ...style, width, maxHeight, overflowY }}
      >
        {options.map((o) => {
          const valStr = String(o.value);
          const checked = selected.includes(valStr);
          return (
            <label key={valStr} className="custom-option">
              <input
                type="checkbox"
                name={name || id}
                checked={checked}
                onChange={() => toggle(o.value)}
                disabled={!enabled}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </div>
  );
};
