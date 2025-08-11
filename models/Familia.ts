import mongoose from 'mongoose';
const { Schema } = mongoose;

const familiaSchema = new Schema({
    idFamilia: {
        type: Number,
        required: true
    },
    familia: {
        type: String,
        required: true
    },
    mesInicio: {
        type: Number,
        required: true
    },
    mesTermino: {
        type: Number,
        required: true
    },
    idCasa: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
export const Familia = mongoose.models.Familia || mongoose.model('Familia', familiaSchema, 'familia');