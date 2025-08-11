import crypto from 'crypto';
import fs from 'fs';

// export const  generateFileHash=(filePath: string): string => {
//     const fileBuffer = fs.readFileSync(filePath);
//     const hashSum = crypto.createHash('sha256');
//     hashSum.update(fileBuffer);
//     return hashSum.digest('hex');
//   }
export const generateFileHash=(file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const buffer = Buffer.from(event.target.result as ArrayBuffer);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(buffer);
        resolve(hashSum.digest('hex'));
      } else {
        reject(new Error('Error leyendo el archivo'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}