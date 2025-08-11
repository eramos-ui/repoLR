import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const carteraGastoSchema = new Schema({
    nroMovimiento:{type:Number, required:true},
    fechaMovimiento:{type:Date, required:true},
    fechaDocumento:{type:Date, required:true},
    tipoDocumento:{type: String, required:true},
    nroDocumento:{type: Number, required:true},
    tipoDocumentoRef:{type: String, required:true},
    nroDocumentoRef:{type: Number, required:true},
    idCasa:{type: Number, required:true},
    mesPago:{type: Number, required:true},
    claseMovimiento:{type: Number, required:true},
    entradaSalida:{type: String, required:true},
    monto:{type: Number, required:true},
},
{
    timestamps: true 
}
);
export const CarteraGasto = models.CarteraGasto || model('CarteraGasto', carteraGastoSchema,'carteraGasto');