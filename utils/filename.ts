// utils/filename.ts
import path from 'path';

// 1) latin1 -> utf8 (corrige "maÃ±ana" -> "mañana")
export function fixEncodingLatin1ToUtf8(s: string) {
  return Buffer.from(s, 'latin1').toString('utf8');
}

// 2) Normaliza Unicode (NFC) y limpia caracteres problemáticos
export function sanitizeFilename(input: string) {
  // normaliza tildes/ñ
  let name = input.normalize('NFC');

  // quita rutas y separadores
  name = name.replace(/[/\\]/g, '_').replace(/\0/g, '');

  // separa base/extensión
  const { name: base, ext } = path.parse(name);

  // permite letras (incluye acentos latinos), números, espacios y .-_+
  const safeBase = base.replace(/[^a-zA-Z0-9\u00C0-\u024F ._\-+]/g, '_').trim();

  // evita nombres reservados Windows
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  const finalBase = reserved.test(safeBase) ? `_${safeBase}` : safeBase || 'archivo';

  // extensión en minúsculas
  const safeExt = (ext || '').toLowerCase();

  // limita longitud total (ej. 180 chars)
  let finalName = `${finalBase}${safeExt}`;
  if (finalName.length > 180) {
    const keep = Math.max(1, 180 - safeExt.length);
    finalName = `${finalBase.slice(0, keep)}${safeExt}`;
  }
  return finalName;
}

// Atajo completo
export function normalizeOriginalName(original: string) {
  return sanitizeFilename(fixEncodingLatin1ToUtf8(original));
}
