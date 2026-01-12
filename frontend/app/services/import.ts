import api from "./axios";



export const importSQL = async (file:File) => {
    const formData = new FormData();
    formData.append('sqlfile',file);

    const response = await api.post('/import/import-data', formData);

    return response.data;
}

