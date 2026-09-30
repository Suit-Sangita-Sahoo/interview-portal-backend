import api from "./api";

export const getCredentials = async () => {

    const response = await api.get(
        "/api/vault/credentials"
    );

    return response.data;
};

export const addCredential = async (credential) => {

    const response = await api.post(
        "/api/vault/credentials",
        credential
    );

    return response.data;
};

export const getCredential = async (id) => {

    const response = await api.get(
        `/api/vault/credentials/${id}`
    );

    return response.data;
};

export const updateCredential = async (
    id,
    credential
) => {

    const response = await api.put(
        `/api/vault/credentials/${id}`,
        credential
    );

    return response.data;
};

export const deleteCredential = async (id) => {

    const response = await api.delete(
        `/api/vault/credentials/${id}`
    );

    return response.data;
};