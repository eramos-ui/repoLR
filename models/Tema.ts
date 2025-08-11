import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const temaSchema = new Schema({
    value: {
        type: Number,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    }           
});

export const Tema = mongoose.models.Tema || mongoose.model('Tema', temaSchema, 'tema');