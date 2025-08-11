// components/FieldWrapper.tsx
import { FormikError } from '@/components/dynamicForm/FormikError';

export const FieldWrapper: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => {
  // const {type} =children;

  // console.log('children',children,children?.type.name)
  //  console.log('en FieldWrapper name',name);
  return   (
  <div>
    {children}
    <FormikError name={name} />
  </div>
  )
};