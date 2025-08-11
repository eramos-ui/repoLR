import mongoose from 'mongoose';

const { Schema } = mongoose;

const empresaSchema = new Schema({

    razonSocial: {
        type: String,
        required: true
    },
    subNombre: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
});


export const Empresa = mongoose.models.Empresa || mongoose.model('Empresa', empresaSchema, 'empresa');