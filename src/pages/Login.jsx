import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };


    // =========================================================
    // HANDLE LOGIN
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        // =====================================================
        // VALIDATE USERNAME
        // =====================================================

        if (!formData.username.trim()) {

            setError(
                "Please enter your username."
            );

            return;
        }


        // =====================================================
        // VALIDATE PASSWORD
        // =====================================================

        if (!formData.password) {

            setError(
                "Please enter your password."
            );

            return;
        }


        setLoading(true);


        try {

            // =================================================
            // LOGIN API
            // =================================================

            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                {
                    username: formData.username.trim(),
                    password: formData.password
                }
            );


            // =================================================
            // GET JWT TOKEN
            // =================================================

            const token =
                response.data.token ||
                response.data.jwt ||
                response.data.accessToken;


            // =================================================
            // VALIDATE TOKEN
            // =================================================

            if (
                !token ||
                typeof token !== "string" ||
                token.split(".").length !== 3
            ) {

                throw new Error(
                    "Invalid authentication token received from server."
                );
            }


            // =================================================
            // SAVE TOKEN
            // =================================================

            localStorage.setItem(
                "token",
                token
            );


            // =================================================
            // SAVE USERNAME
            // =================================================

            localStorage.setItem(
                "username",
                response.data.username ||
                formData.username.trim()
            );


            // =================================================
            // REMOVE OLD AUTH DATA
            // =================================================

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "accessToken"
            );


            // =================================================
            // GO TO DASHBOARD
            // =================================================

            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                "Login failed:",
                error
            );


            // =================================================
            // GET BACKEND ERROR MESSAGE
            // =================================================

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data;


            if (
                typeof backendMessage === "string"
            ) {

                setError(
                    backendMessage
                );

            } else {

                setError(
                    "Invalid username or password."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-slate-950
                px-4
                py-10
            "
        >

            {/* =================================================
                LOGIN CARD
            ================================================= */}

            <div
                className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-6
                    shadow-2xl
                    sm:p-8
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        mb-8
                        text-center
                    "
                >

                    <div
                        className="
                            mx-auto
                            mb-4
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-indigo-600
                            text-2xl
                            shadow-lg
                            shadow-indigo-600/20
                        "
                    >
                        🔐
                    </div>


                    <h1
                        className="
                            text-3xl
                            font-bold
                            tracking-tight
                            text-white
                        "
                    >
                        SecureVault
                    </h1>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-slate-400
                        "
                    >
                        Login to your secure credential vault.
                    </p>

                </div>


                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-red-500/30
                            bg-red-500/10
                            px-4
                            py-3
                            text-sm
                            text-red-400
                        "
                    >

                        {error}

                    </div>
                )}


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* =================================================
                        USERNAME
                    ================================================= */}

                    <div>

                        <label
                            htmlFor="username"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-slate-200
                            "
                        >
                            Username
                        </label>


                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            autoComplete="username"
                            disabled={loading}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-950
                                px-4
                                py-3
                                text-sm
                                text-white
                                outline-none
                                placeholder:text-slate-500
                                transition
                                focus:border-indigo-500
                                focus:ring-2
                                focus:ring-indigo-500/20
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        />

                    </div>


                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <div>

                        <label
                            htmlFor="password"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-slate-200
                            "
                        >
                            Password
                        </label>


                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            disabled={loading}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-950
                                px-4
                                py-3
                                text-sm
                                text-white
                                outline-none
                                placeholder:text-slate-500
                                transition
                                focus:border-indigo-500
                                focus:ring-2
                                focus:ring-indigo-500/20
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        />

                    </div>


                    {/* =================================================
                        LOGIN BUTTON
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            rounded-xl
                            bg-indigo-600
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            shadow-lg
                            shadow-indigo-600/20
                            transition
                            hover:bg-indigo-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-indigo-500
                            focus:ring-offset-2
                            focus:ring-offset-slate-900
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >

                        {loading ? (

                            <span
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        h-4
                                        w-4
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-white/30
                                        border-t-white
                                    "
                                />

                                Logging in...

                            </span>

                        ) : (

                            "Login"

                        )}

                    </button>

                </form>


                {/* =================================================
                    REGISTER LINK
                ================================================= */}

                <div
                    className="
                        mt-6
                        text-center
                        text-sm
                        text-slate-400
                    "
                >

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="
                            font-semibold
                            text-indigo-400
                            transition
                            hover:text-indigo-300
                        "
                    >
                        Register
                    </Link>

                </div>

            </div>

        </div>
    );
}


export default Login;