import axios from "axios";

const API_URL = "http://localhost:8080/api/vault/credentials";

/* =========================================================
   AUTH HEADERS
========================================================= */

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

/* =========================================================
   GET MY CREDENTIALS
========================================================= */

export const getCredentials = async () => {
    const response = await axios.get(
        API_URL,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET SHARED CREDENTIALS
========================================================= */

export const getSharedCredentials = async () => {
    const response = await axios.get(
        `${API_URL}/shared-with-me`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET SINGLE CREDENTIAL
========================================================= */

export const getCredential = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   ADD CREDENTIAL
========================================================= */

export const addCredential = async (credentialData) => {
    const response = await axios.post(
        API_URL,
        credentialData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   UPDATE CREDENTIAL
========================================================= */

export const updateCredential = async (
    id,
    credentialData
) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        credentialData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   DELETE CREDENTIAL
========================================================= */

export const deleteCredential = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};