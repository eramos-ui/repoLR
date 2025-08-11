import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const docGastoSchema = new Schema({
    createAt:{type:Date, required:true},
    tipoDocumento:{type: String, required:true},
    nroDocumento:{type: Number, required:true},
    idCasa:{type: Number, required:true},
    idUsuario:{type: Number, required:true},
    // mesPago:{type: Number, required:true},
    claseMovimiento:{type: Number, required:true},
    monto:{type: Number, required:true},
    comentario:{type: String, required:true},
},
{
    timestamps: true 
}
);
export const DocGasto = models.DocGasto || model('DocGasto', docGastoSchema,'docGasto');