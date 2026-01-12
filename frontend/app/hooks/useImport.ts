// hooks/useImport.ts
import { useMutation } from '@tanstack/react-query';
import { importSQL } from '../services/import';

export const useImportSQL = () => {
  return useMutation({
    mutationFn: (file: File) => importSQL(file),
  });
};


