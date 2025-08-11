
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const anexoSchema = new Schema({
    fileId: {type: String, required: true},
    fileType: {type: String, required: true},
    fileName: {type: String, required: true},
    fileSize: {type: Number, required: true},
  
}) 
const mensajeSchema = new Schema({
    email: {type: String, required: true},
    asunto: {type: String, required: true},
    cuerpoEmail: {type: String, required: true},
})
const projectEmailSchema = new Schema({
    idProject: {type:Number, required:true},
    idProjectActivity: {type: Number, required: true},
    emailProveedor: {type: String, required: true},
    nombreProveedor: { type: String, required: true }, 
    contacto: {type: String, required: true},
    idActivity: {type: Number, required: true},
    actividad: {type: String, required: true},
    mensaje: {type: mensajeSchema, required: true},
    token: {type: String, required: true},
    anexos: {type: [anexoSchema], }
},
{
    timestamps: true ,
    _id: true
 }
);
export const ProjectEmail = models.ProjectEmail || model('ProjectEmail', projectEmailSchema,'projectEmail');

