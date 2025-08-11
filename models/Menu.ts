import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
// Subschema para los submenús
const submenuSchema = new Schema({
    id:{type:Number, required:true},
    menuId:{type:Number, required:true},
    name: { type: String, required: true },
    title: { type: String, required: true },
    path: { type: String, required: false },
    formId: { type: Number, required: false },
    icon: { type: String, required: true },
    isValid: { type: Boolean, required: true },
    orden: { type: Number, required: false },
    perfiles: { type: [String], required: true }, // Asegúrate de que en la base sea un array, no un string JSON
    system: { type: String, required: true },
    idProcess: { type: Number, required: false },
    idActivity: { type: Number, required: false },
    processType: { type: String, required: true },
    isAutomatic: { type: Boolean, required: true },
    nameActivity: { type: String, required: false },
    isUserSpecific: { type: Boolean, required: true }
  });
  // Esquema principal del menú
const menuSchema = new Schema({
    id:{type:Number, required:true},
    name: { type: String, required: true },
    title: { type: String, required: true },
    path: { type: String, required: false },
    icon: { type: String, required: true },
    menutype: { type: String, required: true },
    isValid: { type: Boolean, required: true, default: true },
    orden: { type: Number, required: false },
    system: { type: String, required: true },
    submenus: { type: [submenuSchema], required: false }, // Opcional: algunos menús no tienen submenús
    processType: { type: String, required: true }
  });
  
  // Índice único para el campo name
  menuSchema.index({ name: 1 }, { unique: true });
  
  // Exportación del modelo
  export const Menu = models.Menu || model('Menu', menuSchema, 'menu');
