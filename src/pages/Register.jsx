import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ==============================
    // PASSWORD GENERATOR SETTINGS
    // ==============================

    const [passwordLength, setPasswordLength] = useState(12);

    const [useUppercase, setUseUppercase] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSpecial, setUseSpecial] = useState(true);

    const [showGenerator, setShowGenerator] = useState(false);

    // ==============================
    // GENERATE PASSWORD
    // ==============================

    const generatePassword = () => {

        let characters = "";

        if (useUppercase) {
            characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        if (useLowercase) {
            characters += "abcdefghijklmnopqrstuvwxyz";
        }

        if (useNumbers) {
            characters += "0123456789";
        }

        if (useSpecial) {
            characters += "!@#$%^&*()_+-=[]{}|;:,.<>?";
        }

        // At least one character type must be selected
        if (!characters) {
            setMessage("Select at least one character type.");
            return;
        }

        let generatedPassword = "";

        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(
                Math.random() * characters.length
            );

            generatedPassword += characters[randomIndex];
        }

        setPassword(generatedPassword);
        setConfirmPassword(generatedPassword);

        setMessage("");
    };

    // ==============================
    // PASSWORD STRENGTH
    // ==============================

    const getPasswordStrength = () => {

        if (!password) {
            return {
                text: "No password",
                color: "text-gray-400",
                width: "0%"
            };
        }

        let score = 0;

        if (password.length >= 8) {
            score++;
        }

        if (password.length >= 12) {
            score++;
        }

        if (/[A-Z]/.test(password)) {
            score++;
        }

        if (/[a-z]/.test(password)) {
            score++;
        }

        if (/[0-9]/.test(password)) {
            score++;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        }

        if (score <= 2) {
            return {
                text: "Weak",
                color: "text-red-600",
                bar: "bg-red-500",
                width: "33%"
            };
        }

        if (score <= 4) {
            return {
                text: "Medium",
                color: "text-yellow-600",
                bar: "bg-yellow-500",
                width: "66%"
            };
        }

        return {
            text: "Strong",
            color: "text-green-600",
            bar: "bg-green-500",
            width: "100%"
        };
    };

    const passwordStrength = getPasswordStrength();

    // ==============================
    // REGISTER
    // ==============================

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");

        if (
            !username.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            setMessage("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/api/auth/register",
                {
                    username: username.trim(),
                    email: email.trim(),
                    password: password
                }
            );

            console.log("Register response:", response.data);

            setMessage(
                "Registration successful. Redirecting to login..."
            );

            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            console.error("Registration error:", error);

            if (error.response) {

                const errorData = error.response.data;

                setMessage(
                    typeof errorData === "string"
                        ? errorData
                        : errorData?.message ||
                          "Registration failed"
                );

            } else {
                setMessage("Cannot connect to backend.");
            }

        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // LOGIN
    // ==============================

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

                {/* HEADER */}

                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    SecureVault
                </h1>

                <p className="text-gray-500 text-center mb-6">
                    Create your secure vault account
                </p>

                <form onSubmit={handleRegister}>

                    {/* USERNAME */}

                    <label className="block mb-2 font-medium text-gray-700">
                        Username
                    </label>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Enter username"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* EMAIL */}

                    <label className="block mb-2 font-medium text-gray-700">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter email"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* PASSWORD */}

                    <div className="flex justify-between items-center mb-2">

                        <label className="font-medium text-gray-700">
                            Password
                        </label>

                        <button
                            type="button"
                            onClick={() =>
                                setShowGenerator(!showGenerator)
                            }
                            className="text-sm text-blue-600 font-medium hover:underline"
                        >
                            {showGenerator
                                ? "Hide Generator"
                                : "Generate Password"}
                        </button>

                    </div>

                    <input
                        type="text"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter password"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* PASSWORD STRENGTH */}

                    {password && (
                        <div className="mb-4">

                            <div className="flex justify-between text-sm mb-1">

                                <span className="text-gray-500">
                                    Password Strength
                                </span>

                                <span
                                    className={`font-semibold ${passwordStrength.color}`}
                                >
                                    {passwordStrength.text}
                                </span>

                            </div>

                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

                                <div
                                    className={`h-full ${passwordStrength.bar} transition-all duration-300`}
                                    style={{
                                        width:
                                            passwordStrength.width
                                    }}
                                />

                            </div>

                        </div>
                    )}

                    {/* PASSWORD GENERATOR */}

                    {showGenerator && (

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">

                            <h3 className="font-semibold text-gray-800 mb-4">
                                Password Generator
                            </h3>

                            {/* LENGTH */}

                            <div className="mb-4">

                                <div className="flex justify-between mb-2">

                                    <label className="text-sm font-medium text-gray-700">
                                        Password Length
                                    </label>

                                    <span className="text-sm font-bold text-blue-600">
                                        {passwordLength}
                                    </span>

                                </div>

                                <input
                                    type="range"
                                    min="6"
                                    max="32"
                                    value={passwordLength}
                                    onChange={(e) =>
                                        setPasswordLength(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full accent-blue-600"
                                />

                            </div>

                            {/* CHARACTER OPTIONS */}

                            <div className="space-y-2 mb-4">

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        checked={useUppercase}
                                        onChange={(e) =>
                                            setUseUppercase(
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 accent-blue-600"
                                    />

                                    <span className="text-sm">
                                        Uppercase (A-Z)
                                    </span>

                                </label>

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        checked={useLowercase}
                                        onChange={(e) =>
                                            setUseLowercase(
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 accent-blue-600"
                                    />

                                    <span className="text-sm">
                                        Lowercase (a-z)
                                    </span>

                                </label>

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        checked={useNumbers}
                                        onChange={(e) =>
                                            setUseNumbers(
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 accent-blue-600"
                                    />

                                    <span className="text-sm">
                                        Numbers (0-9)
                                    </span>

                                </label>

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        checked={useSpecial}
                                        onChange={(e) =>
                                            setUseSpecial(
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 accent-blue-600"
                                    />

                                    <span className="text-sm">
                                        Special Characters
                                    </span>

                                </label>

                            </div>

                            {/* GENERATE BUTTON */}

                            <button
                                type="button"
                                onClick={generatePassword}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
                            >
                                Generate Password
                            </button>

                        </div>
                    )}

                    {/* CONFIRM PASSWORD */}

                    <label className="block mb-2 font-medium text-gray-700">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(
                                e.target.value
                            )
                        }
                        placeholder="Confirm password"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* MESSAGE */}

                    {message && (
                        <p className="text-sm text-red-500 mb-4">
                            {message}
                        </p>
                    )}

                    {/* REGISTER */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                    >
                        {loading
                            ? "Registering..."
                            : "Register"}
                    </button>

                </form>

                {/* LOGIN */}

                <p className="text-center mt-5 text-gray-600">

                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={handleLogin}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Login
                    </button>

                </p>

            </div>

        </div>
    );
}

export default Register;