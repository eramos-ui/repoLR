
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
import type { ProjectType } from '@/types/interfaces';
const empalmeSchema = new Schema({
    nroEmpalme:{type:Number, required:false},
    proveedor: {type:String, required:false},
    capacidad: {type:Number, required:false},
    distancia: {type:Number, required:false},
    nroCliente: {type:String, required:false},
    capacidadInyeccion: {type:Number, required:false},
    rutCliente: {type:String, required:false},
    boleta: {type:String, required:false},
    poder: {type:String, required:false},
    f2: {type:String, required:false},
    diagrama: {type:String, required:false},
    otrasImagenes: {type:String, required:false},
    fechaF3: {type:String, required:false}
},
{ _id: true }
)
const instalacionSchema = new Schema({
    nroInstalacion: {type:Number, required:false},
    nroAguas: {type:Number, required:false},
    formaTecho: {type:String, required:false},
    descripcionFormaTecho: {type:String, required:false},
    memoriaCalculo: {type:String, required:false},
},
    { _id: true }
)
const techoSchema = new Schema({
    nroInstalacion: {type:Number, required:false},    
    nroAgua: {type:Number, required:false},
    orientacion: {type:String, required:false},
    material: {type:String, required:false},
    area: {type:Number, required:false},
    pendiente: {type:Number, required:false},
    otrosElementos: {type:[String], required:false},
    imagen: {type:String, required:false},
},
{ _id: true }
)
const activitySchema = new Schema({
    numActividad: {type:String, required:false},
    actividad: {type:String, required:false},
    presupuesto: {type:Number, required:false},
    fechaInicio: {type:String, required:false},
    fechaTermino: {type:String, required:false},
    duracion: {type:Number, required:false},
},
    { _id: false })
const projectSchema = new Schema<ProjectType>({
    idProject: {type:Number, required:true},
    projectName: {type:String, required:true},
    ubicacionPanel: {type:String, required:true},
    idRegion: {type:Number, required:false},
    idComuna: {type:Number, required:false},
    nroEmpalmes: {type:Number, required:true},
    empalmesGrid: {type:[empalmeSchema], required:false},
    nroInstalaciones: {type:Number, required:false},
    instalacionesGrid: {type:[instalacionSchema], required:false},
    techoGrid: {type:[techoSchema], required:false},
    activities: {type:[activitySchema], required:false},
    state: {type:String, required:false},
    tipoTerreno: {type:String, required:false},
    nivelPiedras: {type:String, required:false},
    nivelFreatico: {type:Number, required:false},
    kmlFileName: { type: String, required: false },
    kmlFileContent: { type: String, required: false },
    excelFileId: { type: mongoose.Types.ObjectId, required: false }
},
{
    timestamps: true,
    _id: true
}
);
export const Project = models.Project || model('Project', projectSchema,'project');
export { empalmeSchema, instalacionSchema, techoSchema, activitySchema };