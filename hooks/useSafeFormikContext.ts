import { useContext } from 'react';
import { FormikContext, FormikContextType, FormikValues } from 'formik';

export const useSafeFormikContext = <FormikValues>(): FormikContextType<FormikValues> | undefined => {
  return useContext(FormikContext);
}