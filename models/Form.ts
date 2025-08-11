import mongoose, { Schema, models } from 'mongoose';

const globalStyleSchema = new Schema({
  backgroundColor: String,
  color: String,
  fontFamily: String,
})
const buttonsSchema = new Schema({
  action: String,
  backgroundColor: String,
  borderRadius: String,
  color: String,
  id: String,
  padding: String,
  text: String,
})
const conditionalStyleSchema = new Schema({
  value: String,
})
const optionsSchema = new Schema({
  label: String,
  value: String,
})
const validationsSchema = new Schema({
  type: String,
  message: String,
})
const formSizeSchema = new Schema({
  width: String,
  maxWidth: String,
})
const columnsSchema = new Schema({
  name: String,
  label: String,
  visible: Boolean,  
  typeColumn: String,
})
const modalStyleContentSchema = new Schema({
  width: String,
  height: String,
  margin: String,
  padding: String,
  borderRadius: String,
})
const editFormConfigSchema = new Schema({
  formTitle: String,
  formSize: formSizeSchema,
  modalStyles: modalStyleContentSchema,
})
const tableSchema = new Schema({
  type: String,
  name: String,
  label: String,
  labelGridAdd: String,
  titleGrid:String,
  objectGrid:String,
  columns:[columnsSchema],
  columnWidths: [String],
  rowHeight: String,
  gridWidth: String,
  actions:[String],
  width: String,
  row:Number,
  borderColor: String,
  borderWidth: String,
  padding: String,
  marginBottom: String,
  spFetchSaveGrid: String,
  requiredPassword: Boolean,
  editFormConfig: editFormConfigSchema,
  apiGetRows: String,
})
const requiredIfSchema = new Schema({
  field: String,
  equal: String,
})
const inputPropsSchema = new Schema({
  minLength: Number,
  maxLength: Number,
})
const editFieldsSchema = new Schema({
  type: String,
  visible: Boolean,
  autocomplete: String,
  formatNumber: Boolean,
  value: String,
  width: String,
  row:Number, //fila en el form de edición
  placeholder: String,
  label: String,
  name: String,
  inputProps: inputPropsSchema,
  validations:[validationsSchema],
  conditionalStyle: conditionalStyleSchema,
  formSize: formSizeSchema,
  options:[optionsSchema],
  requiredIf: requiredIfSchema,
})
const jsonFormSchema = new Schema({
  formTitle:String,
  theme:String,
  formSize:formSizeSchema,
  buttons:[buttonsSchema],
  table: tableSchema,
  editFields:[editFieldsSchema],
  globalStyles:globalStyleSchema,
})

const FormSchema = new Schema({
  formId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  valid: { type: Boolean, required: true },
  jsonForm: { type: Schema.Types.Mixed, required: true },//Debería tiparse
  // jsonForm:{type:jsonFormSchema, required:true},
});

export const Form = models.Form || mongoose.model('Form', FormSchema,'form');
