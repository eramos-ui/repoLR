import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const fuenteSchema = new Schema({
    value: {
        type: Number,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    }           
});


export const Fuente = mongoose.models.Fuente || mongoose.model('Fuente', fuenteSchema, 'fuente');