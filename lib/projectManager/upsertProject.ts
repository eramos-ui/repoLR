import { Project } from '@/models/Project';
import { Counter } from '@/models/Counter';
import { omit, isEqual } from 'lodash';

export const upsertProject = async (values: any, session: any) => {
  let { idProject } = values;
  const isNew = !idProject || idProject === 0;

  if (isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'project' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );
    idProject = counter.seq;
    values.idProject = idProject;
  }

  const { activities, ...generalData } = values;

  const currentProjectDoc = await Project.findOne({ idProject }).session(session).lean() as any;
  if (!currentProjectDoc) {
    await Project.create([{ idProject, ...generalData, activities }], { session });
  } else {
    const camposIgnorados = ['_id', '__v', 'createdAt', 'updatedAt', 'kmlFileContent'];
    const { activities: _ignore, _id, __v, createdAt, updatedAt, ...currentGeneral } = currentProjectDoc;
    const currentActivities = currentProjectDoc.activities ?? [];
    const activitiesChanged = !isEqual(currentActivities, activities);
    const generalChanged = !isEqual(
          omit(currentGeneral, camposIgnorados),
          omit(generalData, camposIgnorados)
        );
    if (generalChanged) console.log('🟡 Cambios detectados en datos generales');
    if (activitiesChanged) console.log('🟠 Cambios detectados en actividades');
    if (Object.keys(generalData).length > 0) {
      await Project.findOneAndUpdate({ idProject }, { ...generalData }, { session });
    }
    if (activities && activities.length > 0) {
      await Project.findOneAndUpdate({ idProject }, { activities }, { session });
    }
  }

  return { idProject, isNew };
};
