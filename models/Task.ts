

import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    idTask: { type: Number, required: true },
    taskStatus: { type: String, required: true  },
    taskLockDate: { type: Date, required: false  },
    userlock: { type: String, required: false },
    taskFinishDate: { type: Date, required: false },
    userFinish: { type: String, required: false },
    idProcessInstance: { type: Number, required: true },
    idActivity: { type: Number, required: true },
    specificUser: { type: String, required: false },
    idUserCreate: { type: String, required: true },
    fecha: { type: Date, required: false },
    idProcess: { type: Number, required: true },
    processName: { type: String, required: true },
    nameActivity: { type: String, required: false },
    isAutomatic: { type: Boolean, required: true },
    url: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);
export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema,'task');    
