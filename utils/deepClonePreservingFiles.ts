export const deepClonePreservingFiles = (obj: any): any => {
    if (obj instanceof File) return obj;
  
    if (Array.isArray(obj)) {
      return obj.map(item => deepClonePreservingFiles(item));
    }
  
    if (obj && typeof obj === 'object') {
      const clone: any = {};
      for (const key in obj) {
        clone[key] = deepClonePreservingFiles(obj[key]);
      }
      return clone;
    }
  
    return obj;
  }
  