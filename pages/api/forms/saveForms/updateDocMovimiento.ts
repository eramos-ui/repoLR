// /pages/api/forms/saveForms/updateDocMovimiento.ts
/*
Aquí se graba el formulario dinámico de la coleción DocGasto y DocIngreso de la BD 
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { DocGasto } from '@/models/DocGasto';
import { DocIngreso } from '@/models/DocIngreso';
import { getSaldoCasaFondo } from '@/lib/movimientos/getSaldoCasaFondo';
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { getIngresosNoOcupados } from '@/lib/movimientos/getIngresosNoOcupados';
import { getSaldoGasto } from '@/lib/movimientos/getSaldoGasto';
import { CarteraGasto } from '@/models/CarteraGasto';
import { ClaseMovimiento } from '@/models/ClaseMovimiento';
import { User } from '@/models/User';
import { Familia } from '@/models/Familia';
import { Casa } from '@/models/Casa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();
    const añoMesActual = año * 100 + mes;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  const fechaDocumento = new Date(req.body.fechaDocumento);
  const { tipoDocumento,  nroDocumento, idCasa, idUserModification, claseMovimiento, monto, comentario, idFamilia } = req.body;
  console.log('en updateDocMovimiento tipoDocumento',tipoDocumento);
  // const casas = await Casa.find({});
  const familias = await Familia.find({ //devuelve un array? y findOne no anda
      mesInicio: { $lte: añoMesActual },
      mesTermino: { $gte: añoMesActual }
      }).lean();
  if (!tipoDocumento && (tipoDocumento==="INGRESO" && tipoDocumento==="GASTO")) {
    return res.status(400).json({ error: "tipoDocumento debe ser 'GASTO' o 'INGRESO'" });
  }
  const docUsuario=await User.findOne({_id:idUserModification, vigente:true});
  const idUsuario=docUsuario?.idUser;
  console.log('en updateDocMovimiento docUsuario',docUsuario,idUsuario);
  console.log('en updateDocMovimiento req.body',tipoDocumento, fechaDocumento, nroDocumento, idCasa, idUserModification,idUsuario, idFamilia)
  // Seleccionar el modelo adecuado
  const Model = tipoDocumento === "GASTO" ? DocGasto : DocIngreso;
  // Buscar el nroDocumento más alto
  const ultimo = await Model.findOne({ tipoDocumento })
  .sort({ nroDocumento: -1 })
  .select("nroDocumento")
  .lean() as { nroDocumento?: number } | null;
  let nuevoNro = 1;

  if (ultimo && typeof ultimo.nroDocumento === "number") {
    nuevoNro = ultimo.nroDocumento + 1;
  }
  let nuevoNroCarteraGasto=1;
  const ultimoNroCarteraGasto = await CarteraGasto.findOne()
  .sort({nroMovimiento: -1})
  .select("nroMovimiento")
  .lean() as {nroMovimiento?: number} | null;
  if (ultimoNroCarteraGasto && typeof ultimoNroCarteraGasto.nroMovimiento === "number") {
    nuevoNroCarteraGasto = ultimoNroCarteraGasto.nroMovimiento + 1;
  }    
  console.log('nuevoNroCarteraGasto',nuevoNroCarteraGasto);

  let nuevoNroCarteraIngreso=1;
  const ultimoNroCarteraIngreso = await CarteraIngreso.findOne()
  .sort({nroMovimiento: -1})
  .select("nroMovimiento")
  .lean() as {nroMovimiento?: number} | null;
  if (ultimoNroCarteraIngreso && typeof ultimoNroCarteraIngreso.nroMovimiento === "number") {
    nuevoNroCarteraIngreso = ultimoNroCarteraIngreso.nroMovimiento + 1;
  }
  console.log('nuevoNroCarteraIngreso',nuevoNroCarteraIngreso);

  const clases = await ClaseMovimiento.find({ idOrganizacion: 1 }); 
  console.log('en updateDocMovimiento ultimo',ultimo,nuevoNro);



  let abono = monto;
  // const fechaDocumento = nuevoDoc.createdAt;
  let nuevoDoc:any;
   
  if ( tipoDocumento === "INGRESO"){
      if (!idFamilia ) {
        return res.status(400).json({ error: "idFamilia debe ser obligatorio para 'INGRESO'" });
      }
      const idFamiliaNumber=Number(idFamilia);
      const familia=familias.find(familia => familia.idFamilia === idFamiliaNumber);
      const idCasa=familia?familia.idCasa:0;

      nuevoDoc = new Model({
        tipoDocumento,
        nroDocumento: nuevoNro,
        idCasa:familia?idCasa:0,
        idUsuario,
        monto,
        comentario,//es para los gasstos
        claseMovimiento:0,//es para los gastos
        createAt: new Date(fechaDocumento),
        updatedAt: new Date(hoy),
      });
          // await nuevoDoc.save();
      console.log('en updateDocMovimiento Ingreso nuevoDoc',nuevoDoc);
    

      const docIngreso=await DocIngreso.findOne({ tipoDocumento: "INGRESO"})
      .sort({ nroDocumento: -1 })      
      .lean() as { nroDocumento?: number } | null;

      // console.log('en updateDocMovimiento docIngreso',docIngreso);
      const claseMov=(claseMovimiento === 0)? undefined: claseMovimiento;
      const deudas = await getSaldoCasaFondo(idCasa, claseMov);
      console.log('Deudas', deudas, idCasa,claseMovimiento)
      for (const deuda of deudas) {
        const {
          tipoDocumentoRef,
          nroDocumentoRef,
          claseMovimiento: claseMovimientoDeuda,
          mesPago,
          saldo: montoDeuda,
        } = deuda;
  
        if (abono <= 0) break;
  
        const aPagar = abono >= montoDeuda ? montoDeuda : abono;
        abono -= aPagar;
        const newCarteraIngreso = {
          tipoDocumento,
          nroDocumento: nuevoNroCarteraIngreso,
          tipoDocumentoRef,
          nroDocumentoRef,
          fechaDocumento,
          fechaMovimiento: hoy,
          idCasa, 
          mesPago,
          claseMovimiento: claseMovimientoDeuda,
          entradaSalida: 'S',
          monto: aPagar,
         }
         console.log('newCarteraIngreso',newCarteraIngreso)
        //  await CarteraIngreso.create(newCarteraIngreso);
       }
    }
    if ( tipoDocumento === "GASTO"){
      // // Paso 1: Insertar el documento GASTO
      nuevoDoc = await DocGasto.create({
        createAt: new Date(),
        tipoDocumento,
        nroDocumento,
        idCasa,
        idUsuario,
        claseMovimiento,
        monto,
        comentario,
      });
      const newCarteraGasto = {
        nroMovimiento: nuevoNroCarteraGasto,
        tipoDocumento,
        nroDocumento,
        tipoDocumentoRef: tipoDocumento,
        nroDocumentoRef: nroDocumento,
        fechaDocumento,
        fechaMovimiento: new Date(),
        claseMovimiento,
        entradaSalida: 'E',
        monto,
      }
      console.log('newCarteraGasto',newCarteraGasto)
      // Insertar en CarteraGasto como ENTRADA
      // await CarteraGasto.create({
      //   nroMovimiento: nuevoNroCarteraGasto,
      //   tipoDocumento,
      //   nroDocumento,
      //   tipoDocumentoRef: tipoDocumento,
      //   nroDocumentoRef: nroDocumento,
      //   fechaDocumento,
      //   fechaMovimiento: new Date(),
      //   claseMovimiento,
      //   entradaSalida: 'E',
      //   monto,
      // });
      nuevoNroCarteraGasto=nuevoNroCarteraGasto+1;
      // Paso 2: Obtener ingresos no ocupados
      let ingresos = await getIngresosNoOcupados(1); // idUsuario para obtener idOrganizacion
      console.log('ingresos',ingresos.length);
      // console.log('ingresos[0]',ingresos[0]); 
      // console.log('ingresos[1]',ingresos[1]);
      // Paso 3: Obtener gastos pendientes (SaldoGasto)
      let gastosConSaldo = await getSaldoGasto(1); //los gastos que tienen saldo por pagar
      console.log('gastosConSaldo',gastosConSaldo.length)
      // Paso 4: Compensación cruzada
       for (const ingreso of ingresos) {
        //  console.log('ingreso',ingreso);
         let saldoIngreso = ingreso.monto;
         const claseIngreso = ingreso.claseMovimiento;
         for (let i = 0; i < gastosConSaldo.length && saldoIngreso > 0; ) {
          const gasto = gastosConSaldo[i];
          const claseIngresoSalda=clases.find( (c:any )=> c.idClaseMovimiento===gasto.claseMovimiento);
          // console.log('claseIngresoSalda',claseIngresoSalda.ingresoSalda,claseIngreso)
          if (claseIngresoSalda.ingresoSalda !== claseIngreso) {
            i++;
            continue;
          }
          // console.log('gasto',gasto)
          const montoGasto = gasto.saldo;
          const abona = Math.min(saldoIngreso, montoGasto);
          if (abona > 0){
            const newCarteraGasto = {//se registra en la cartera si hay abono
              nroMovimiento: nuevoNroCarteraGasto,
              tipoDocumento,
              nroDocumento,
              tipoDocumentoRef: gasto.tipoDocumentoRef,
              nroDocumentoRef: gasto.nroDocumentoRef,
              fechaDocumento: ingreso.fechaDocumento,
              fechaRegistro: new Date(),
              claseMovimiento: gasto.claseMovimiento,
              entradaSalida: 'S',
              monto: abona,
            }
            saldoIngreso -= abona;
            gasto.saldo -= abona;
          }
          if (gasto.saldo <= 0) {
            gastosConSaldo.splice(i, 1);
          } else {
            i++;
          }
          //console.log('newCarteraGasto',i,saldoIngreso,gasto.saldo)
        }

/*
        for (let i = 0; i < gastosConSaldo.length && saldoIngreso > 0; ) {
          const gasto = gastosConSaldo[i];

          if (gasto.ingresoSalda !== claseIngreso) {
            i++;
            continue;
          }

          const montoGasto = gasto.saldo;
          const abona = Math.min(saldoIngreso, montoGasto);
          const newCarteraGasto = {
            tipoDocumento,
            nroDocumento,
            tipoDocumentoRef: gasto.tipoDocumentoRef,
            nroDocumentoRef: gasto.nroDocumentoRef,
            fechaDocumento: ingreso.fechaDocumento,
            fechaRegistro: new Date(),
            claseMovimiento: gasto.claseMovimiento,
            entradaSalida: 'S',
            monto: abona,
          }
          console.log('newCarteraGasto',newCarteraGasto)
          // Insertar en CarteraGasto como SALIDA
          // await CarteraGasto.create({
          //   tipoDocumento,
          //   nroDocumento,
          //   tipoDocumentoRef: gasto.tipoDocumentoRef,
          //   nroDocumentoRef: gasto.nroDocumentoRef,
          //   fechaDocumento: ingreso.fechaDocumento,
          //   fechaRegistro: new Date(),
          //   claseMovimiento: gasto.claseMovimiento,
          //   entradaSalida: 'S',
          //   monto: abona,
          // });

          saldoIngreso -= abona;
          gasto.saldo -= abona;

          if (gasto.saldo <= 0) {
            gastosConSaldo.splice(i, 1);
          } else {
            i++;
          }
          */
       //} 
      } //fin del for de ingresos
    }


    return res.status(200).json({ message: 'Documento creado e imputado correctamente', nuevoDoc});
}