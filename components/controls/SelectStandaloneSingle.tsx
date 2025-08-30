// SelectStandaloneSingle.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { CommonProps, Option } from './Select.types';

export type SelectStandaloneSingleProps = CommonProps & {
  value?: string | number;
  onValueChange?: (value: string | number) => void;
};

export const SelectStandaloneSingle: React.FC<SelectStandaloneSingleProps> = (props) => {
  const {
    label, name, options, placeholder = 'Seleccione una opción',
    style, width = '100%', required = false, theme = 'light',
    captionPosition = 'top', id, enabled = true, visible = true,
    value, onValueChange,
  } = props;

  // hooks SIEMPRE al tope
  const optionMap = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(String(o.value), o);
    return m;
  }, [options]);

  const [selected, setSelected] = useState<string>(value != null ? String(value) : '');
  useEffect(() => setSelected(value != null ? String(value) : ''), [value]);

  if (!visible) return null;

  const coerce = (s: string) => {
    if (typeof value === 'number') return Number(s);
    const opt = optionMap.get(s);
    if (opt && typeof opt.value === 'number') return Number(s);
    return s;
  };

  return (
    <div className={`custom-select-container ${theme} ${captionPosition}`}>
      <label className={`custom-select-label ${captionPosition}`} style={style}>
        {label} {required && '*'}
      </label>
      <select
        id={id}
        name={name}
        value={selected}
        onChange={(e) => {
          const s = e.target.value;
          setSelected(s);
          onValueChange?.(coerce(s));
        }}
        className="custom-select"
        style={{ ...style, width }}
        disabled={!enabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};
