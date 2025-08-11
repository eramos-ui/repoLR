

export const fetchAvatarAsBlob= async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener el avatar actual');
    }
    return await response.blob();
  }