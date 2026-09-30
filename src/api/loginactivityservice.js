import axios from "axios";

const API_URL =
    "http://localhost:8080/api/security/login-history";


const getAuthHeaders = () => {

    const token =
        localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};


export const getLoginHistory = async () => {

    const response =
        await axios.get(
            API_URL,
            {
                headers: getAuthHeaders()
            }
        );

    return response.data;
};