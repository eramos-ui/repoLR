// pages/api/files/getAprobados.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { FileMeta } from "@/models/FileMeta";
import { Fuente } from "@/models/Fuente";
import { getUsersVigentes } from "@/app/services/users/getUsersVigentes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let fuentes:any[]=[];
  let usuarios:any[]=[];
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { idTema } = req.query;//9999 son
  // console.log('idTema',idTema)
  try{
    await connectDB();
    // const casas = await Casa.find({});
    fuentes = await Fuente.find({ //devuelve un array? y findOne no anda
        }).lean();  

  } catch (err) {
      console.log('Error');
      res.status(500).json({ error: "Error al leer fuentes" });
  };
  try{
    usuarios = await getUsersVigentes() 

    } catch (err) {
        console.log('Error');
        res.status(500).json({ error: "Error al leer usuarios vigentes" });
    };

    if (!idTema) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: idTema' });
      }  
  if (Number(idTema) > 0){
    console.log('idTema',idTema)
  }
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método no permitido" });
    }
   

    let itemsLeidos = await FileMeta.aggregate([
      {
        $addFields: {
          estadoActual: {
            $arrayElemAt: ["$estadoHistory.estado", -1],
          },
          reason:{
            $arrayElemAt: ["$estadoHistory.reason", -1],
          }
        },
      },
      {
        $match: {
          estadoActual: "APROBADO",
        },
      },
      {
        $project: {
          _id: 1,
          gridFsId: 1,
          filename: 1,
          authorName: 1,
          fuente: 1,
          updatedAt:1,
          estadoActual: 1,
          reason:1,
          authorId:1,
          uploadedBy:1,
          temaIds:1,
         },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ]);
    // console.log('itemsLeidos',itemsLeidos,idTema)
  
    if (Number(idTema)<9999){
      itemsLeidos=itemsLeidos.filter( it => it.temaIds.includes(idTema));
    }
    // console.log('fuentes',fuentes)
    // console.log('usuarios',usuarios)
  // Mapear SOLO lo que necesito en la grilla
    const items = itemsLeidos.map((it) => {
      // const lastHistory = (it.lastHistory ?? []).slice(-1)[0];
    //   console.log('en API getSubidos it',it)
      const lastReason = it.reason ?? null;
      const estadoActual=it.estadoActual ?? null;
      // const gridFsId = String(it.gridFsId);
      const gridFsId = String(it.gridFsId);
      const fechaSubido=(new Date( it.updatedAt)).toISOString().split('T')[0];
      const [year, month, day] = fechaSubido?.split("-") || [];
      const fechaSubidoFormatted = `${day}/${month}/${year}`;
      const origenDescripcion=fuentes.find( x => x.idFuente === it.fuente).descripcion;
      let authorName=it.authorName;
      if (it.authorId && !authorName ){
         authorName=usuarios.find( u => u._id.toString() ===it.authorId.toString()).name;
        //  console.log('autor',authorName)
      }else if(it.uploadedBy && !authorName) {
        authorName=usuarios.find( u => u._id.toString() ===it.uploadedBy.toString()).name;
      }
      let  filename=it.filename
      if (it.filename.includes('/')){
         filename=it.filename.split('/')[1]; //para extraer el id
      }
      return {
        fileMetaId: String(it._id),//id de files (FileMeta)
        gridFsId,//id del archivo (uploads.files)
        filename,
        updatedAt: fechaSubidoFormatted,     // timestamp del doc (por timestamps:true)
        estadoActual: estadoActual,     // estado actual
        reason: lastReason,          // motivo del último cambio (si existe)
        fuente:origenDescripcion,
        authorSubidoPor:authorName,
        // URLs útiles por si quieres botones Ver/Descargar:
        // viewUrl: makeAbsUrl(req, `/api/files/${encodeURIComponent(gridFsId)}?disposition=inline`),
        // downloadUrl: makeAbsUrl(req, `/api/files/${encodeURIComponent(gridFsId)}?disposition=attachment`),
      };
    });
    res.status(200).json({ items });
  } catch (error) {
    console.error("Error en getSubidos:", error);
    res.status(500).json({ error: "Error al obtener archivos en estado SUBIDO" });
  }
}
