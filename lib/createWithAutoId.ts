import { getNextSequence } from './getNextSequence';
import { Model } from 'mongoose';

/**
 * Crea un documento en una colección con un campo autoincremental.
 * @param model Mongoose model (ej. Task, Project)
 * @param counterName nombre usado en la colección counters (ej. "task")
 * @param idField nombre del campo autoincremental (ej. "idTask")
 * @param data datos adicionales del documento
 */
export async function createWithAutoId<T>(
    model: Model<T>,
    counterName: string,
    idField: keyof T,
    data: Partial<T>
  ): Promise<T> {
    const nextId = await getNextSequence(counterName);
    return model.create({ [idField]: nextId, ...data });
  }