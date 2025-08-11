import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const claseMovimientoSchema = new Schema({
    idClaseMovimiento:{type: Number, required:true},
    descripcion:{type: String, required:true},
    ingresoGasto:{type: String, required:true},
    ingresoSalda:{type: Number, required:true},
    idOrganizacion:{type: Number, required:true},
},
{
    timestamps: true 
}
);
    export const ClaseMovimiento = models.ClaseMovimiento || model('ClaseMovimiento', claseMovimientoSchema,'claseMovimiento');