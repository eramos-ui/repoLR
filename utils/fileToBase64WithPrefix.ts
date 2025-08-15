// Convierte un File/Blob a dataURL base64: "data:<mime>;base64,...."
export async function fileToBase64WithPrefix(file: File | Blob): Promise<string> {
    const buf = await (file as File).arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const type = (file as File).type || 'application/octet-stream';
    return `data:${type};base64,${b64}`;
  }