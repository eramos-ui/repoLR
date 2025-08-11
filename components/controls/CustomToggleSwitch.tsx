import { useField, useFormikContext, FieldProps } from 'formik';

interface Props  extends Partial<FieldProps> {
  label: string;
  name: string;
  className?: string;
  id?: string;
  width:string; 
}
//NO HABILITADO*******************************
export const CustomToggleSwitch: React.FC<Props> = ({ field ,label, ...props }) => {//idem al checkbox, pero con botón deslizante
  //const { setFieldValue } = useFormikContext();
  //const [field, meta] = useField(props);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //setFieldValue(field.name, event.currentTarget.checked);
  };

  return (
    <div className="toggle-switch-container">
      <label className="toggle-switch-label" htmlFor={props.id || props.name}>
        {label}
      </label>
      <label className="toggle-switch">
        <input
          type="checkbox"
          {...field}
          onChange={handleChange}
          className="toggle-switch-input"
        />
        <span className="toggle-switch-slider"></span>
      </label>
      {/* {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null} */}
    </div>
  );
};