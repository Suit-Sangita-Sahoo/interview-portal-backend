import api from "./api";

export const loginUser = async (data) => {
    const response = await api.post(
        "/api/auth/login",
        data
    );

    return response.data;
};

export const registerUser = async (data) => {
    const response = await api.post(
        "/api/auth/register",
        data
    );

    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
};