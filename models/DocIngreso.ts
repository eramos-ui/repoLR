import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const docIngresoSchema = new Schema({
    createAt:{type:Date, required:true},
    tipoDocumento:{type: String, required:true},
    nroDocumento:{type: Number, required:true},
    idCasa:{type: Number, required:true},
    idUsuario:{type: Number, required:true},
    // mesPago:{type: Number, required:true},
    claseMovimiento:{type: Number, required:true},
    monto:{type: Number, required:true},
    comentario:{type: String, required:false},
},
{
    timestamps: true 
}
);
export const DocIngreso = models.DocIngreso || model('DocIngreso', docIngresoSchema,'docIngreso');