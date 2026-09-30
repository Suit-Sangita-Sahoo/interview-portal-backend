import axios from "axios";

const API_URL = "http://localhost:8080/api/vault";

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
   SHARE CREDENTIAL
========================================================= */

export const shareCredential = async (
    credentialId,
    data
) => {
    const response = await axios.post(
        `${API_URL}/shares/${credentialId}`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET SHARES
========================================================= */

export const getCredentialShares = async (
    credentialId
) => {
    const response = await axios.get(
        `${API_URL}/shares/${credentialId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   REMOVE SHARE
========================================================= */

export const removeShare = async (shareId) => {
    const response = await axios.delete(
        `${API_URL}/shares/${shareId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};