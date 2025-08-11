import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

// Subschema para Context
const contextSchema = new Schema({
  idContext: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: false },
}, { _id: false });

// Subschema para Roles
const roleSchema = new Schema({
  idRol: { type: Number, required: true },
  nombre: { type: String, required: true }, // Corregí la propiedad a nombre (es más consistente en español)
  description: { type: String, required: false },
}, { _id: false });
const onExitActionsSchema = new Schema<Record<string, string>>(
  {},
  { _id: false, strict: false }
);
// Subschema para ActivityProperties
const activityPropertySchema = new Schema({
  idActivity: { type: Number, required: true },
  key: { type: String, required: true },
  nameActivity: { type: String, required: false },
  description: { type: String, required: false },
  url: { type: String, required: false },
  rolOption: { type: String, required: false },
  rol: { type: String, required: false },
  userSpecific: { type: String, required: false },
  isAutomatic: { type: Boolean, required: false },
  isJoin: { type: Boolean, required: false },
  tipoJoin: { type: String, required: false },
  isSubProcess: { type: Boolean, required: false },
  triggerSubprocess: { type: String, required: false },
  decisionValue: { type: String, required: false },
  type: { type: String, required: false },
  onExitActions: {
    type: Map,
    of: String,
    required: false
  }
}, { _id: false });

// Subschema para Subprocess
const subProcessSchema = new Schema({
  idProcess: { type: Number, required: true },
  processName: { type: String, required: true },
}, { _id: false });

// Subschema para Connectors (nuevo)
const connectorSchema = new Schema({
  key: { type: String, required: true },
  beginItemKey: { type: String, required: true },
  endItemKey: { type: String, required: true },
  points: { type: Array, required: false },
  texts: { type: Map, of: String, required: false }, // Los texts vienen como un Map {"0.4": "completado"}
}, { _id: false });

// Subschema para Shapes (nuevo)
const shapeSchema = new Schema({
  key: { type: String, required: true },
  type: { type: String, required: true },
  text: { type: String, required: false },
  x: { type: Number, required: false },
  y: { type: Number, required: false },
  width: { type: Number, required: false },
  height: { type: Number, required: false },
}, { _id: false });

// Subschema para Page (nuevo)
const pageSchema = new Schema({
  width: { type: Number, required: false },
  height: { type: Number, required: false },
  pageColor: { type: Number, required: false },
  pageWidth: { type: Number, required: false },
  pageHeight: { type: Number, required: false },
  pageLandscape: { type: Boolean, required: false },
}, { _id: false });

// Subschema para Diagram completo (nuevo)
const diagramContentSchema = new Schema({
  page: { type: pageSchema, required: false },
  connectors: { type: [connectorSchema], default: [] },
  shapes: { type: [shapeSchema], default: [] },
}, { _id: false });

// Modelo Diagram principal
const diagramSchema = new Schema({
  idProcess: { type: Number, required: true, unique: true },
  processName: { type: String, required: true },
  diagram: { type: diagramContentSchema, required: true }, // Aquí ahora es un objeto, no string
  context: { type: [contextSchema], required: false },
  roles: { type: [roleSchema], required: false },
  activityProperties: { type: [activityPropertySchema], required: false },
  subProcess: { type: [subProcessSchema], required: false },
  isSubprocess: { type: Boolean, required: false },
  isValid: { type: Boolean, required: false },
}, { timestamps: true });

export const Diagram = models.Diagram || model('Diagram', diagramSchema, 'diagram');











// import mongoose from 'mongoose';
// const { Schema, model, models } = mongoose;

// // Subschema para Context
// const contextSchema = new Schema({
//   idContext: { type: Number, required: true },
//   name: { type: String, required: true },
//   type: { type: String, required: true },
//   description: { type: String, required: false },
// }, { _id: false });

// // Subschema para Roles
// const roleSchema = new Schema({
//   idRol: { type: Number, required: true },
//   Nombre: { type: String, required: true },
//   description: { type: String, required: false },
// }, { _id: false });

// // Subschema para ActivityProperties
// const activityPropertySchema = new Schema({
//   idActivity: { type: Number, required: true },
//   key: { type: String, required: true },
//   nameActivity: { type: String, required: false },
//   description: { type: String, required: false },
//   url: { type: String, required: false },
//   rolOption: { type: String, required: false },
//   rol: { type: String, required: false },
//   userSpecific: { type: String, required: false },
//   isAutomatic: { type: Boolean, required: false },
//   isJoin: { type: Boolean, required: false },
//   tipoJoin: { type: String, required: false },
//   isSubProcess: { type: Boolean, required: false },
//   triggerSubprocess: { type: String, required: false },
//   decisionValue: { type: String, required: false },
//   type: { type: String, required: false },
// }, { _id: false });

// // Subschema para Subprocess
// const subProcessSchema = new Schema({
//   idProcess: { type: Number, required: true },
//   processName: { type: String, required: true },
// }, { _id: false }); 

// const diagramSchema = new Schema({
//   idProcess: {
//     type: Number,
//     required: true,
//     unique: true,
//   },
//   processName: {
//     type: String,
//     required: true,
//   },
//   diagram: {
//     type: String, // Aquí puedes luego cambiar si quieres una estructura JSON
//     required: true,
//   },
//   context: {
//     type: [contextSchema],
//     required: false,
//   },
//   roles: {
//     type: [roleSchema],
//     required: false,
//   },
//   activityProperties: {
//     type: [activityPropertySchema],
//     required: false,
//   },
//   subProcess: {
//     type: [subProcessSchema],
//     required: false,
//   },
//   isSubprocess: {
//     type: Boolean,
//     required: false,
//   },
//   isValid: {
//     type: Boolean,
//     required: false,
//   },
// }, {
//   timestamps: true,
// });

// export const Diagram = models.Diagram || model('Diagram', diagramSchema, 'diagram');

// import mongoose from 'mongoose';
// const { Schema, model, models } = mongoose;

// const diagramSchema = new Schema({
//   idProcess: {
//     type: Number,
//     required: true,
//     unique: true,
//   },
//   processName: {
//     type: String,
//     required: true,
//   },
//   diagram: {
//     type: String,
//     required: true,
//   },
//   context: {
//     type: String,
//     required: false,
//   },
//   roles: {
//     type: [Schema.Types.Mixed], // array de objetos mixtos
//     required: false,
//   },
//   activityProperties: {
//     type: String,
//     required: false,
//   },
//   subProcess: {
//     type: [Schema.Types.Mixed], // array de objetos mixtos
//     required: false,
//   },
//   isSubprocess: {
//     type: Boolean,
//     required: false,
//   },
//   isValid: {
//     type: Boolean,
//     required: false,
//   },
// }, {
//   timestamps: true, // createdAt, updatedAt automáticos
// });

// export const Diagram = models.Diagram || model('Diagram', diagramSchema, 'diagram');
