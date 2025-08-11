import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const rolewkfSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    processName: {
        type: String,
        required: true
    },
    isSubproceso: {
        type: Boolean,
        required: true
    }
    ,orden :{
        type: Number,
        required: true
    }           
});
rolewkfSchema.index({ name: 1 }, { unique: true });


export const Rolewkf = mongoose.models.Rolewkf || mongoose.model('Rolewkf', rolewkfSchema, 'rolewkf');