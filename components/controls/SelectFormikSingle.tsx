// SelectFormikSingle.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useField } from 'formik';
import { CommonProps, Option } from './Select.types';

export type SelectFormikSingleProps = CommonProps & {
  name: string; // requerido
  value?: string | number;
  onValueChange?: (value: string | number) => void; // side-effects opcional
};

export const SelectFormikSingle: React.FC<SelectFormikSingleProps> = (props) => {
  const {
    label, name, options, placeholder='Seleccione una opción',
    style, width='100%', required=false, theme='light',
    captionPosition='top', id, enabled=true, visible=true, value,
    onValueChange,
  } = props;

  const [field, , helpers] = useField<string | number | ''>(name);

  const optionMap = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(String(o.value), o);
    return m;
  }, [options]);

  const [selected, setSelected] = useState<string>(field.value != null ? String(field.value) : '');
  useEffect(() => setSelected(field.value != null ? String(field.value) : ''), [field.value]);

  if (!visible) return null;

  const coerce = (s: string) => {
    if (typeof field.value === 'number') return Number(s);
    const opt = optionMap.get(s);
    if (opt && typeof opt.value === 'number') return Number(s);
    return s;
  };

  const setFormik = (val: string | number | '') => {
    helpers.setValue(val);
    helpers.setTouched(true, false);
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
          const out = s === '' ? '' : coerce(s);
          setFormik(out);
          onValueChange?.(out === '' ? '' : (out as string | number));
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
