// components/FormikError.tsx
import { useField } from 'formik';

interface FormikErrorProps {
  name: string;
  className?: string;
}

export const FormikError: React.FC<FormikErrorProps> = ({ name, className = "text-red-500 text-sm mt-1" }) => {
  const [, meta] = useField(name);
   // console.log('en FormikError name',name)
   // return null;
   if (!meta.touched || !meta.error) return null;
  //  if(name === 'tema' ) return null;

    return <div className={className}>{meta.error}</div>;
};