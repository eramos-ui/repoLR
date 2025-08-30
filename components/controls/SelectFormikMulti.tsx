// SelectFormikMulti.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useField } from 'formik';
import { CommonProps, Option } from './Select.types';

export type SelectFormikMultiProps = CommonProps & {
  name: string; // requerido
  value?: Array<string | number>; // Formik lo maneja igual, pero permitimos controlado
  onValueChange?: (vals: Array<string | number>) => void; // side-effects opcional
  maxHeight?: string;
  overflowY?: 'auto' | 'scroll' | 'hidden' | 'visible';
};

export const SelectFormikMulti: React.FC<SelectFormikMultiProps> = (props) => {
  const {
    label, name, options, style, width='100%', required=false, theme='light',
    captionPosition='top', id, enabled=true, visible=true,
    onValueChange, maxHeight='150px', overflowY='auto',
    value, // opcionalmente controlado desde arriba
  } = props;

  // Formik
  const [field, , helpers] = useField<string[] | number[] | undefined>(name);

  // Mapa de opciones
  const optionMap = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(String(o.value), o);
    return m;
  }, [options]);

  // Valor externo (Formik o prop.value), normalizado a string[]
  const external = useMemo(() => {
    const base = (value ?? (field.value ?? [])) as Array<string | number>;
    return base.map(String);
  }, [value, field.value]);

  const [selected, setSelected] = useState<string[]>(external);
  useEffect(() => setSelected(external), [external]);

  if (!visible) return null;

  // Coerción a números si corresponde
  const coerceArray = (arr: string[]) => {
    const base = (value ?? field.value ?? []) as Array<string | number>;
    const expectNumber =
      base.some(v => typeof v === 'number') ||
      (arr.length > 0 && arr.every(v => typeof optionMap.get(v)?.value === 'number'));
    return expectNumber ? arr.map(Number) : arr;
  };

  const setFormik = (vals: Array<string | number>) => {
    helpers.setValue(vals as any);
    helpers.setTouched(true, false);
  };

  const toggle = (raw: string | number) => {
    const s = String(raw);
    const updated = selected.includes(s) ? selected.filter(v => v !== s) : [...selected, s];
    setSelected(updated);

    const out = coerceArray(updated);
    setFormik(out);
    onValueChange?.(out);
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
