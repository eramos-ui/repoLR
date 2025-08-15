
// app/view/[gridFsId]/page.tsx
/*
Server component que no usa "use client"
*/
// components/FileViewer.tsx
/*
import Image from 'next/image';
import { ObjectId } from 'mongodb';
import { getBucket  } from "@/lib/db";
import React from 'react';


// Helper para bytes legibles
function fmtBytes(n?: number) {
  if (!n && n !== 0) return '';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

type Props = {
  gridFsId: string;            // _id del doc en uploads.files
  className?: string;
  // Para imágenes con <Image fill />
  aspectRatio?: `${number}/${number}` | string; // ej. "4/3" | "16/9"
  // Si quieres forzar "descarga" en vez de inline para tipos no imagen/pdf
  forceDownloadForOthers?: boolean;
};

export default async function FileViewer({
  gridFsId,
  className,
  aspectRatio = '4/3',
  forceDownloadForOthers = false,
}: Props) {
  if (!ObjectId.isValid(gridFsId)) {
    return <div className="text-sm text-red-600">ID de archivo inválido.</div>;
  }
  console.log('en view\[id] válido', gridFsId)
  const bucket = getBucket();
  const fileDoc = await bucket.find({ _id: new ObjectId(gridFsId) }).next();

  if (!fileDoc) {
    return <div className="text-sm text-muted-foreground">Archivo no encontrado.</div>;
  }

  // Metadata de GridFS
  const contentType: string = (fileDoc as any).contentType || 'application/octet-stream';
  const filename: string = fileDoc.filename || 'archivo';
  const length: number | undefined = (fileDoc as any).length;

  const downloadUrl = `/api/files/${gridFsId}`;

  // Render según tipo MIME
  if (contentType.startsWith('image/')) {
    // Usamos next/image con fill. Un contenedor con aspect-ratio ayuda con layout shift.
    return (
      <div
        className={`relative w-full ${className ?? ''}`}
        style={{ aspectRatio }}
        title={filename}
      >
        <Image
          src={downloadUrl}
          alt={filename}
          fill
          unoptimized
          sizes="100vw"
          className="object-contain rounded-xl border shadow"
          priority={false}
        />
      </div>
    );
  }

  if (contentType === 'application/pdf') {
    return (
      <div className={className}>
        <object
          data={downloadUrl}
          type="application/pdf"
          className="w-full h-[80vh] rounded-xl border shadow"
        >
          <a className="underline" href={downloadUrl} target="_blank" rel="noreferrer">
            Abrir {filename} ({fmtBytes(length)})
          </a>
        </object>
      </div>
    );
  }

  if (contentType.startsWith('audio/')) {
    return (
      <div className={className}>
        <audio controls className="w-full">
          <source src={downloadUrl} type={contentType} />
          Tu navegador no soporta audio HTML5.{' '}
          <a className="underline" href={downloadUrl} target="_blank" rel="noreferrer">
            Descargar
          </a>
        </audio>
        <div className="mt-1 text-xs text-muted-foreground">
          {filename} {length ? `• ${fmtBytes(length)}` : ''}
        </div>
      </div>
    );
  }

  if (contentType.startsWith('video/')) {
    return (
      <div className={className}>
        <video controls className="w-full rounded-xl border shadow">
          <source src={downloadUrl} type={contentType} />
          Tu navegador no soporta video HTML5.{' '}
          <a className="underline" href={downloadUrl} target="_blank" rel="noreferrer">
            Descargar
          </a>
        </video>
        <div className="mt-1 text-xs text-muted-foreground">
          {filename} {length ? `• ${fmtBytes(length)}` : ''}
        </div>
      </div>
    );
  }

  // Otros tipos (docx, zip, etc.)
  return (
    <div className={className}>
      {forceDownloadForOthers ? (
        <a className="underline" href={downloadUrl} download>
          Descargar {filename} {length ? `(${fmtBytes(length)})` : ''}
        </a>
      ) : (
        <a className="underline" href={downloadUrl} target="_blank" rel="noreferrer">
          Abrir {filename} {length ? `(${fmtBytes(length)})` : ''}
        </a>
      )}
      <div className="text-xs text-muted-foreground mt-1">{contentType}</div>
    </div>
  );
}
*/

/*
import { notFound } from "next/navigation";
import { getBucket, connectDB  } from "@/lib/db";
import Image from 'next/image';
import { ObjectId } from "mongodb";
import GoBackButton from '@/components/general/GoBackButton'; // ajusta el path según tu estructura

export default async function FileViewer({ params }: { params: { gridFsId: string } }) {
  const { gridFsId } = params;
  await connectDB();
  const bucket = getBucket();
  let file;
  try {
     file = await bucket.find({ _id: new ObjectId(gridFsId) }).next();
    // file = await FileMeta.findById(gridFsId).lean();
  } catch (error) {
    console.error("Error al buscar archivo:", error);
    return notFound();
  }
  console.log('en view file ',file)
  if (!file) return notFound();
  const downloadUrl = `/api/files/download/${gridFsId}`;
  // const downloadUrl = `/api/files/download/${file.gridFsId}`;

  const contentType = file?.contentType ?? "";
  const fileTyped = file as { contentType?: string };

  const filename=file?.filename ??"" as string ;
  if (!filename || filename.length === 0) return null;

  const isPDF = fileTyped.contentType === 'application/pdf';
  const isImage = fileTyped.contentType === "image/jpeg";

   return (
     <div className="p-4">
        <GoBackButton />
        <h2 className="text-xl font-semibold mb-4">{file.filename}</h2>
          {isImage && (
          <img
            src={downloadUrl}
            alt={file.filename}
            className="max-w-full h-auto border shadow"
          />
          )}
        {isPDF && (
          <iframe
            src={downloadUrl}
            className="w-full h-[80vh] border"
            title={file.filename}
          />
        )}
        {!isImage && !(contentType === "application/pdf") && (
          <div>
            <p>No se puede visualizar este tipo de archivo directamente.</p>
            <a
              href={downloadUrl}
              download={file.filename}
              className="text-blue-600 underline"
            >
              Descargar archivo
            </a>
          </div>
        )}

      </div>
   );
}
*/

// pages/view/[id].tsx
import GoBackButton from "@/components/general/GoBackButton";
import Image from "next/image";
import { notFound } from "next/navigation";

function cleanId(raw: string) {
  return decodeURIComponent(raw).replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}
export default function ViewPage({ params }: { params: { id: string } }) {
  const id = params.id.trim();
  const url = `/api/files/${id}`;

  return (
    <div className="p-6">
       <GoBackButton />
      <iframe
        src={url}
        className="w-full h-[80vh] rounded-xl border shadow"
        allow="fullscreen"
      />
      <p className="mt-2 text-xs text-gray-500">
        Si no se visualiza arriba,{" "}
        <a href={url} target="_blank" rel="noreferrer" className="underline">
          ábrelo en una pestaña nueva
        </a>.
      </p>
    </div>
  );
}