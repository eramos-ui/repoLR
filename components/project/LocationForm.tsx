import { useEffect, useState } from "react";
import { useFormikContext, Field } from "formik";

import { CustomSelect } from "@/components/controls/CustomSelect";
import { Comunas, OptionsSelect, ProjectFormValuesType } from "@/types/interfaces";
import { CustomInput } from "../controls";


interface LocationFormProps {
  regiones: OptionsSelect[];
  // comunas: Comunas[] | undefined ;
  errors: any;
  touched: any;
}
export const LocationForm: React.FC<LocationFormProps> = ({ regiones,  errors, touched }) => {
  const { values, setFieldValue } = useFormikContext<ProjectFormValuesType>(); // ✅ Especifica el tipo // Hook de Formik para manejar valores
  const [ regionSelected, setRegionSelected ] =useState<number>(0);
  // const [ comunaSelected, setComunaSelected ] =useState<number>(0);
  const [ comunasPorRegion, setComunasPorRegion ] = useState<OptionsSelect[]>(); 
  // console.log('En LocationForm regiones', regiones);
  // useEffect(() => {
  //   console.log('LocationForm useEffect comunasPorRegion', comunasPorRegion);
  // }, [comunasPorRegion]);
  const fetchComunas = async (idRegion: number): Promise<OptionsSelect[]> => {
    const res = await fetch(`/api/catalogs/comunas?idRegion=${idRegion}`);
    if (!res.ok) throw new Error('Error al cargar comunas');
    return await res.json();
   };
   useEffect(() => {
      if (regionSelected) {
        fetchComunas(regionSelected).then(setComunasPorRegion);
        // console.log('En LocationForm comunasPorRegion', comunasPorRegion);
      }
   }, [regionSelected]);
  return (
    <div className="mb-1 flex items-start space-x-2">
       <div className="w-2/6">
        <Field name="region">
          {({ field, form }: any) => {
            return (
            <CustomSelect
                name='region'
                label="Región"
                options={regiones}
                placeholder="Seleccione una región"
                required
                multiple={false}
                theme="light"
                captionPosition="top"
                style={{ marginBottom: "1rem" }}
                width="100%"
                error={touched.region && errors.region ? errors.region : undefined}
                {...field}
                onChange={(value:number) => {
                  // console.log('en LocationFormProps onChange value', value);  
                  const regionValue:number = value;
                  form.setFieldValue("region", regionValue);
                  setRegionSelected(regionValue); // ✅ Asegura que siempre sea un string
                  form.setFieldValue("comuna", 0); // 🔹 Reinicia comuna cuando cambia región
                }}
            />
            )
          }}
        </Field>
        {/* {errors.region && touched.region && <p className="text-red-500 text-sm">{errors.region}</p>} */}
      </div>
      <div className="w-1/6">
      {/* {comunasPorRegion && ( */}
        <Field
          as={CustomSelect}
          label="Comuna"
          name='comuna'
          options={comunasPorRegion || []}
          placeholder="Seleccione la comuna"
          disabled={!regionSelected}//para que ocupe el espacio de la comuna aunque no haya comuna
          width="100%"
          required
        />
      {/* )} */}
      </div>
      <div className="w-3/6">
        <Field
            name="direccion"
            type="text"
            as={CustomInput} // Usa CustomInput como componente renderizado
            label="Dirección"
            placeholder="Ingresa la dirección del proyecto"
            captionPosition="top"
            error={touched.direccion && errors.direccion ? errors.direccion : undefined}
            required
            theme="light"
            width="54%" // Define el ancho como un porcentaje
        />
      </div>      
    </div>
  );
};