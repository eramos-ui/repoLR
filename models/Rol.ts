import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const rolSchema = new Schema({
    value: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        required: true
    }           
});
// rolSchema.index({ name: 1 }, { unique: true });


export const Rol = mongoose.models.Rol || mongoose.model('Rol', rolSchema, 'rol');