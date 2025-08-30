// Select.types.ts
export type Option = { value: string | number; label: string };

export type CommonProps = {
  label: string;
  name?: string; // solo se usa en Formik*
  options: Option[];
  style?: React.CSSProperties;
  maxHeight?: string;
  overflowY?: 'auto' | 'scroll' | 'hidden' | 'visible';
  width?: string;
  placeholder?: string;
  required?: boolean;
  theme?: 'light' | 'dark';
  captionPosition?: 'top' | 'left';
  id?: string;
  enabled?: boolean;
  visible?: boolean;
};