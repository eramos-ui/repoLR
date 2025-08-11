// src/utils/api/upload.ts
/*
Utilizado por EditForm de formularios dinámicos para upload dónde requiere buscar si hay File y aquí los sube
ya que puede ser más de un campo.
Usada en el grabar() de EditForm usando FormData y también consume la metadata (temaIds[], authorId, authorName) 
del archivo en /api/files/upload
*/
export interface UploadResponse {
    fileMetaId?: string;
    gridFsId?: string;
    [key: string]: any;
  }
  
  /**
   * Sube un único archivo junto con información adicional como temaIds y autor.
   * @param file Archivo a subir
   * @param extraData Otros datos a incluir en el FormData (temaIds, authorId, etc.)
   * @returns ID del archivo subido (fileMetaId o gridFsId)
   */
  export async function uploadOneFile(
    file: File,
    extraData: {
      linkDocument?:string;
      fuente?:string;
      temaIds?: (string | number)[];
      authorId?: string;
      authorName?: string;
      uploadedBy?:string;      
    }
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);  
    (extraData.temaIds ?? []).forEach((id) => {
      formData.append("temaIds[]", String(id));
    });
  
    if (extraData.authorId) {
      formData.append("authorId", extraData.authorId);
    }
  
    if (extraData.authorName) {
      formData.append("authorName", extraData.authorName);
    }
    if (extraData.uploadedBy) {
        formData.append("uploadedBy", extraData.uploadedBy);
    }
    if (extraData.linkDocument) {
      formData.append("linkDocument", extraData.linkDocument);
    }
    if (extraData.fuente) {
      formData.append("fuente", extraData.fuente);
    }
    const res = await fetch("/api/files/upload", {//consumo de la API pages/api/files/upload.ts
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || "Error al subir archivo");
    }
  
    const data: UploadResponse = await res.json();
    return data.fileMetaId ?? data.gridFsId ?? ""; // puedes ajustar el campo según lo que uses
  }
  
  /**
   * Busca entre los campos del formulario y sube los archivos encontrados.
   * Devuelve un objeto con los nombres de campo y sus IDs resultantes.
   */
  export async function normalizeAndUploadFiles(
    fields: { name: string; type: string }[],
    values: Record<string, any>,
    session?: { user?: { id?: string; name?: string } }
  ): Promise<Record<string, string>> {
    const uploadedFileIds: Record<string, string> = {};
    // console.log('en normalizeAndUploadFiles values',values)
  
    for (const field of fields) {
      if (field.type === "file" && values[field.name] instanceof File) {
        const file = values[field.name] as File;
        const authorName= (values.authorName)?values.authorName:'';
        const fuenteRaw = values.fuente;
        const fuente = fuenteRaw !== undefined ? Number(fuenteRaw) : undefined;
        const linkDocument=(values.linkDocument)?values.linkDocument:'';
        const fileId = await uploadOneFile(file, {
          fuente:fuente?.toString(),
          linkDocument,
          temaIds: values.tema,
          authorId: session?.user?.id,
          authorName: authorName,
          uploadedBy:session?.user?.id,
        });
  
        uploadedFileIds[field.name] = fileId;
      }
    }  
    return uploadedFileIds;
  }
  