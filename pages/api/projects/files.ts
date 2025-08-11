// pages/api/project/files.ts
//¿Se usa?
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import type { IProject, ITecho, IEmpalme, IInstalacion } from '@/types/IProject';
import { FilesType } from '@/types/interfaces';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }

  const { idProject } = req.query;

  if (!idProject) {
    return res.status(400).json({ error: 'Se requiere el parámetro idProject.' });
  }

  try {
    await connectDB();    
    const project = await Project.findOne({ idProject: Number(idProject) }).lean<IProject>();
    const idForKml=project?._id.toString();
    // const project = await Project.findOne({ idProject: Number(idProject) });
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const archivos: FilesType[] = [];
    // KML y Excel
    if (project.kmlFileName && project.kmlFileName !=="No subido"){ 
      const email = project.userModification || '';
      console.log('project.kmlFileName',project.idProject);
      archivos.push(
        { 
          _id: idForKml,//id del proyecto porque el archivo kml está en project 
          descripcion: 'Archivo KML',
          fileClass: "KML",
          fileType:'kml',
          filePath:project.kmlFileName,
          filename:project.kmlFileName,
          nroAgua:0,
          nroInstalacion:0,
          email
        });
    }
    if (project.excelFileId && project.excelFileId !=="No subido") {
      const email = project.userModification || '';
      archivos.push(
      {
        _id: project.excelFileId.toString(),
        descripcion: 'Archivo Excel',
        fileClass: "Excel",
        fileType:'excel',
        filePath:project.excelFileId,
        filename:project.excelFileId,
        nroAgua:0,
        nroInstalacion:0,
        email
      });}

    // Empalmes
    (project.empalmesGrid || []).forEach((emp:IEmpalme & { _id?: string }) => {
        const empalmeId = emp._id?.toString() || '';
        const email = project.userModification || '';
        (['boleta', 'poder', 'f2', 'diagrama', 'otrasImagenes'] as (keyof IEmpalme)[]).forEach(campo => {
        if (emp[campo] && emp[campo] !=="No subido") {
          archivos.push({
            _id: empalmeId,
            descripcion: `Empalme ${campo}`,
            fileClass: 'empalme',
            filePath: `empalmes/${emp[campo]}`,
            fileType: 'image/*', // o según extensión real
            filename: String(emp[campo]),
            nroInstalacion: emp.nroEmpalme,
            email
          });
        }
      });
    });

    // Instalaciones
    project.instalacionesGrid?.forEach((inst:IInstalacion & { _id?: string }) => {
      const instalacionId = inst._id?.toString() || '';
      const email = project.userModification || '';
      if (inst.memoriaCalculo && inst.memoriaCalculo !=="No subido") {
        const descripcion = inst.descripcionInstalacion ? `Edificio ${inst.descripcionInstalacion}` : `Instalación N° ${inst.nroInstalacion}`;
        // console.log('inst',inst);
        archivos.push({
          _id: instalacionId,
          descripcion: `Memoria de Cálculo instalación ${descripcion}, agua N° ${inst.nroAguas}`,
          fileClass: 'memoriaCalculo',
          filePath: `instalaciones/${inst.memoriaCalculo}`,
          fileType: 'image/*',
          filename:inst.memoriaCalculo,
          nroAgua:inst.nroAguas,
          nroInstalacion:inst.nroInstalacion,
          email
        });
      }
    });
    // Techos
    (project.techoGrid || []).forEach((techo: ITecho & { _id?: string }) => {
      const email = project.userModification || '';
      const techoId = techo._id?.toString() || '';
      if (techo.imagen && techo.imagen !=="No subido") {
        archivos.push({
          _id: techoId,
          descripcion: `Imagen Techo Agua ${techo.nroAgua}`,
          fileClass: 'techo',
          filePath: `techos/${techo.imagen}`,
          fileType: 'image/*',
          filename: techo.imagen,
          nroAgua: techo.nroAgua,
          nroInstalacion: techo.nroInstalacion,
          email
        });
      }
    });
    return res.status(200).json({ archivos });
  } catch (error) {
    console.error('❌ Error en la API /project/files:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
