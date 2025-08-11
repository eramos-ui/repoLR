import mongoose,{ Schema, model, models } from 'mongoose';
const MAX_TAGS=5;
import { ESTADOS, Estado, TRANSICIONES_PERMITIDAS } from '@/data/estados';

const estadoHistorySchema = new Schema(
  {
    estado: { type: String, enum: ESTADOS, required: true, default: 'SUBIDO', index: true },
    changedBy:  { type: Schema.Types.ObjectId, ref: 'User' }, // quién cambió el estado
    changedAt:  { type: Date, default: Date.now },
    reason:     { type: String }, // comentario opcional (motivo)
  },
  { _id: false }
);
 
const fileSchema = new Schema(
  {
    gridFsId: { type: Schema.Types.ObjectId, required: true, index: true },
    filename: { type: String, required: true, index: true },
    mimeType: { type: String, required: true, index: true },
    size: { type: Number, required: true },
    sha256: { type: String, index: true, sparse: true, unique: false }, // puedes poner unique si quieres deduplicar estrictamente
    kind: { type: String, enum: ['pdf', 'image', 'other'], required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },  // Autor del documento (quien lo redactó/emitió)
    authorName: { type: String, index: true }, // denormalizado para búsqueda por texto

    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },  // Quién subió el archivo (sube ≠ autor)

    temaIds: { type: [Schema.Types.Mixed], index: true }, // máx 5 (valida como ya vimos)
    /*Los tags en el modelo de metadata son un mecanismo para categorizar y buscar archivos fácilmente(filtrar). 
     Son simplemente etiquetas libres (palabras clave) que puedes asociar a un archivo.
    */
    tags: {
      type: [String],
      validate: {
        validator: (arr: string[]) =>
          Array.isArray(arr) &&
          arr.length <= MAX_TAGS &&
          arr.every((t) => typeof t === 'string' && t.length <= 64),
        message: `Tags inválidos o demasiados (máx. ${MAX_TAGS}).`,
      },
      index: true,
    },  
    // linkDocument:{ type: String },
    fuente: { type: Number, index: true }, 
    estado: { type: String, enum: ESTADOS, required: true, default: 'SUBIDO', index: true },
    estadoHistory: { type: [estadoHistorySchema], default: [] },    // Historial de cambios de estado
  
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);
//índices para listado 
fileSchema.index({temaIds: 1, estado: 1, createdAt: -1 });

// Método helper para cambiar estado con validación
fileSchema.methods.cambiarEstado = async function (
  nextEstado: Estado,
  opts?: { changedBy?: string; reason?: string }
) {
  const current: Estado = this.estado;
  const allowed = TRANSICIONES_PERMITIDAS[current] || [];
  if (!allowed.includes(nextEstado)) {
    throw new Error(`Transición no permitida: ${current} → ${nextEstado}`);
  }

  this.estado = nextEstado;
  this.estadoHistory.push({
    estado: nextEstado,
    changedBy: opts?.changedBy,
    reason: opts?.reason,
  });

  await this.save();
  return this;
};
export const FileMeta =  (models.File as mongoose.Model<any>) || model('File', fileSchema, 'files');