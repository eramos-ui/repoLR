import mongoose from 'mongoose';
const { Schema } = mongoose;

const casaSchema = new Schema({
    idCasa: {
        type: Number,
        required: true
    },
    codigoCasa: {
        type: String,
        required: true
    },
    idOrganizacion: {
        type: Number,
        required: true
    }
});
export const Casa = mongoose.models.Casa || mongoose.model('Casa', casaSchema, 'casa');