
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const projectActivitySchema = new Schema({
    idProjectActivity: {type: Number, required: true},
    idActivity: {type: Number, required: true},
    numActividad: {type: String, required: true},
    actividad: {type: String, required: true},
    fechaInicio: {type: String, required: false},
    fechaTermino: {type: String, required: false},
    duracion: {type: Number, required: false},   
    presupuesto: {type: Number, required: false},
    usuarioModificacion: {type: String, required: true},
    idProject: {type: Number, required: true},
    idProcessInstance: {type: Number, required: true},
    userResponsable: {type: String, required: false},
    formaEjecucion: {type: String, required: false},
    userEjecutor: {type: String, required: false},
  
},
{
    timestamps: true
}
);
export const ProjectActivity = models.ProjectActivity || model('ProjectActivity', projectActivitySchema,'projectActivity');