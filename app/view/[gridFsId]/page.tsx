
// app/view/[gridFsId]/page.tsx
/*
Server component que no usa "use client"
*/
import { notFound } from "next/navigation";
import { getBucket, connectDB  } from "@/lib/db";
// import { FileMeta } from '@/models/FileMeta';
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
