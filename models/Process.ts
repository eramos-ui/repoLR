import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const attributesSchema = new Schema({
    idAttribute:{type:String, required:true},
    value:{type:String, required:true}
})
const processSchema = new Schema({
    idProcessInstance:{type:Number, required:true},
    idProcess:{type:Number, required:true},
    isProcessInstanceOpen:{type:Boolean, required:true},
    processName:{type:String, required:true},
    isSubProcess:{type:Boolean, required:true},
    // orden:{type:Number, required:true},
    tipoDocumento:{type:String, required:true},
    nroDocumento:{type:Number, required:true},
    infotodo:{type:String, required:true},
    attributes: { type: [attributesSchema], required: false },
},
{
    timestamps: true 
}
);
export const Process = models.Process || model('Process', processSchema,'process');

