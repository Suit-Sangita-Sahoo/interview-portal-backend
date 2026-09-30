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
   CREATE TEAM
========================================================= */

export const createTeam = async (data) => {
    const response = await axios.post(
        `${API_URL}/teams`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET MY TEAMS
========================================================= */

export const getMyTeams = async () => {
    const response = await axios.get(
        `${API_URL}/teams`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET TEAM
========================================================= */

export const getTeam = async (teamId) => {
    const response = await axios.get(
        `${API_URL}/teams/${teamId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   ADD TEAM MEMBER
========================================================= */

export const addTeamMember = async (
    teamId,
    data
) => {
    const response = await axios.post(
        `${API_URL}/teams/${teamId}/members`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET TEAM MEMBERS
========================================================= */

export const getTeamMembers = async (
    teamId
) => {
    const response = await axios.get(
        `${API_URL}/teams/${teamId}/members`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   REMOVE TEAM MEMBER
========================================================= */

export const removeTeamMember = async (
    teamId,
    memberId
) => {
    const response = await axios.delete(
        `${API_URL}/teams/${teamId}/members/${memberId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   SHARE CREDENTIAL WITH TEAM
========================================================= */

export const shareCredentialWithTeam = async (
    teamId,
    credentialId,
    permission = "VIEW"
) => {
    const response = await axios.post(
        `${API_URL}/teams/${teamId}/credentials/${credentialId}`,
        {
            permission
        },
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   GET TEAM CREDENTIALS
========================================================= */

export const getTeamCredentials = async (
    teamId
) => {
    const response = await axios.get(
        `${API_URL}/teams/${teamId}/credentials`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

/* =========================================================
   REMOVE CREDENTIAL FROM TEAM
========================================================= */

export const removeCredentialFromTeam = async (
    teamId,
    credentialId
) => {
    const response = await axios.delete(
        `${API_URL}/teams/${teamId}/credentials/${credentialId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};