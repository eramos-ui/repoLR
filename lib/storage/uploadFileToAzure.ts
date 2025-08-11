// lib/server/azure/uploadFileToAzure.ts
import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = "documentos"; // Ajusta al nombre real de tu container


export async function uploadFileToAzure({
  fileName,
  fileData, // base64
  fileType,
  fileClass,
  userId,
  rowId,
}: {
  fileName: string;
  fileData: string; // base64
  fileType: string;
  fileClass: string;
  userId: string;
  rowId: string;
}): Promise<string> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const blobPath = `${fileClass}/${userId}/${rowId}/${fileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  const buffer = Buffer.from(fileData, "base64");

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: fileType },
  });

  return blockBlobClient.url;
}
