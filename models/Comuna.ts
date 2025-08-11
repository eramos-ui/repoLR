import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const comunaSchema = new Schema({
    idComuna: {
        type: Number,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    idRegion: {
        type: Number,
        required: true
    }
});


export const Comuna = mongoose.models.Comuna || mongoose.model('Comuna', comunaSchema, 'comuna');