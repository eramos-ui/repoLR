export interface ITask {
    idTask: number;
    taskStatus?: 'A' | 'F';
    taskLockDate?: string;
    userlock?: string;
    taskFinishDate?: string;
    userFinish?: string;
    idProcessInstance?: number;
    idActivity?: number;
    specificUser?: string;
    idUserCreate?: string;
    fecha?: string;
    idProcess?: number;
    processName?: string;
    nameActivity?: string;
    isAutomatic?: string; // puede ser 'true' | 'false' como string si viene así
    url?: string;
    createdAt?: string;
    updatedAt?: string;
  }