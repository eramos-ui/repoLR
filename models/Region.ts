import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const regionSchema = new Schema({
    descripcion: {
        type: String,
        required: true
    },
    romano: {
        type: String,
        required: true
    },
    idRegion: {
        type: Number,
        required: true
    }
});


export const Region = mongoose.models.Region || mongoose.model('Region', regionSchema, 'region');