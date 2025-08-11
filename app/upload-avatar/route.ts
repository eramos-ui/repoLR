import { NextRequest, NextResponse } from 'next/server';
//import formidable, { File } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

// Deshabilitar el manejo automático de Body por Next.js para permitir la subida de archivos
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export async function POST(req: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), '/public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Leer el cuerpo de la solicitud como buffer
    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, file.name);

    // Guardar el archivo en el sistema de archivos
    await fs.writeFile(filePath, buffer);

    const avatarUrl = `/uploads/${file.name}`;
    return NextResponse.json({ avatarUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
