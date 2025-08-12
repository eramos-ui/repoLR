import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cardSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // Guardaremos el nombre del ícono como string
    orden: { type: Number, required: true },
    pathRelative: { type: String, required: false },    // si la página del submenu requiere path relativo
    menuId: { type: Number, required: false },    // ID del menú principal (necesario para permiso)
    submenuId: { type: Number, required: false }  // ID del submenú si aplica (necesario para permiso)
  });


export const Card = mongoose.models.Card || mongoose.model('Card', cardSchema, 'card');