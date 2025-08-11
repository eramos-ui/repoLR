import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventoSchema = new Schema({

    fechaEvento: {
        type: Date,
        required: true
    },
    ubicacion: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    }
});


export const Evento = mongoose.models.Evento || mongoose.model('Evento', eventoSchema, 'evento');