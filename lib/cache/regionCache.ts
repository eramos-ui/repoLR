import { Region } from '@/models/Region';
import { OptionsSelect } from '@/types/interfaces';
export type RegionType = {
    descripcion: string;
    romano: string;
    idRegion: number;
  };

  let regionCache: RegionType[] | null = null;

export async function getRegiones() {
  if (regionCache) return regionCache;

  try {
    regionCache = (await Region.find({}).sort({ idRegion: 1 }).lean()).map(r => ({
        descripcion: r.descripcion,
        romano: r.romano,
        idRegion: r.idRegion
      }));
    return regionCache;
  } catch (error) {
    console.error('❌ Error al cargar regiones:', error);
    return [];
  }
}
// 👇 Convertido a formato para select
export async function getRegionesOptions(): Promise<OptionsSelect[]> {
    const regiones = await getRegiones();
    return regiones.map(r => ({
      value: r.idRegion,
      label: r.descripcion
    }));
  }