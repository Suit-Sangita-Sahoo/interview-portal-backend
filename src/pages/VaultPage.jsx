import React, { useEffect, useState } from "react";
import axios from "axios";

function Vault() {

    const [credentials, setCredentials] = useState([]);

    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showGenerator, setShowGenerator] = useState(false);

    const [length, setLength] = useState(12);
    const [uppercase, setUppercase] = useState(true);
    const [lowercase, setLowercase] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [special, setSpecial] = useState(true);

    const [generatedPassword, setGeneratedPassword] = useState("");
    const [strength, setStrength] = useState("");

    const token = localStorage.getItem("token");

    // Get credentials
    const fetchCredentials = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/vault/credentials",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCredentials(response.data);

        } catch (error) {

            console.error("Error fetching credentials:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.reload();
            }

        }
    };

    useEffect(() => {

        if (token) {
            fetchCredentials();
        }

    }, []);

    // Add credential
    const handleAddCredential = async (e) => {

        e.preventDefault();

        if (!title || !username || !password) {
            setMessage("Title, username and password are required.");
            return;
        }

        try {

            setLoading(true);
            setMessage("");

            await axios.post(
                "http://localhost:8080/api/vault/credentials",
                {
                    title: title,
                    username: username,
                    password: password
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Credential saved successfully.");

            setTitle("");
            setUsername("");
            setPassword("");

            fetchCredentials();

        } catch (error) {

            console.error("Error adding credential:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to save credential."
            );

        } finally {

            setLoading(false);

        }
    };

    // Password strength
    const checkStrength = (value) => {

        let score = 0;

        if (value.length >= 8) score++;
        if (value.length >= 12) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (score <= 2) {
            return "Weak";
        }

        if (score <= 4) {
            return "Medium";
        }

        return "Strong";
    };

    // Generate password
    const generatePassword = () => {

        let characters = "";

        if (uppercase) {
            characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        if (lowercase) {
            characters += "abcdefghijklmnopqrstuvwxyz";
        }

        if (numbers) {
            characters += "0123456789";
        }

        if (special) {
            characters += "!@#$%^&*()_+-=[]{}";
        }

        if (!characters) {
            setMessage("Select at least one password rule.");
            return;
        }

        let result = "";

        for (let i = 0; i < length; i++) {

            const randomIndex = Math.floor(
                Math.random() * characters.length
            );

            result += characters[randomIndex];
        }

        setGeneratedPassword(result);
        setStrength(checkStrength(result));
        setMessage("");
    };

    // Use generated password
    const useGeneratedPassword = () => {

        setPassword(generatedPassword);

        setStrength(checkStrength(generatedPassword));

        setShowGenerator(false);
    };

    // Logout
    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("username");

        window.location.reload();
    };

    return (

        <div className="min-h-screen bg-gray-100 p-6">

            {/* Header */}

            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center mb-6">

                    <div>
                        <h1 className="text-3xl font-bold">
                            SecureVault
                        </h1>

                        <p className="text-gray-500">
                            Welcome, {localStorage.getItem("username")}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>

                </div>

                {/* Add Credential */}

                <div className="bg-white rounded-xl shadow-md p-6 mb-6">

                    <h2 className="text-2xl font-bold mb-5">
                        Add Credential
                    </h2>

                    <form onSubmit={handleAddCredential}>

                        {/* Title */}

                        <label className="block font-medium mb-2">
                            Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Example: Gmail"
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                        />

                        {/* Username */}

                        <label className="block font-medium mb-2">
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username or email"
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                        />

                        {/* Password */}

                        <label className="block font-medium mb-2">
                            Password
                        </label>

                        <div className="flex gap-2 mb-3">

                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setStrength(checkStrength(e.target.value));
                                }}
                                placeholder="Enter password"
                                className="flex-1 border rounded-lg px-4 py-2"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="bg-gray-200 px-4 rounded-lg"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                        {/* Strength */}

                        {password && (
                            <p className="mb-4">
                                Password Strength:{" "}
                                <strong>
                                    {strength}
                                </strong>
                            </p>
                        )}

                        {/* Generator button */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowGenerator(!showGenerator)
                            }
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg mb-4"
                        >
                            Generate Password
                        </button>

                        {/* Generator */}

                        {showGenerator && (

                            <div className="border rounded-lg p-5 mb-5 bg-gray-50">

                                <h3 className="text-xl font-bold mb-4">
                                    Password Generator
                                </h3>

                                <label className="block mb-2">
                                    Length: {length}
                                </label>

                                <input
                                    type="range"
                                    min="8"
                                    max="32"
                                    value={length}
                                    onChange={(e) =>
                                        setLength(Number(e.target.value))
                                    }
                                    className="w-full mb-4"
                                />

                                <div className="space-y-2 mb-4">

                                    <label className="block">
                                        <input
                                            type="checkbox"
                                            checked={uppercase}
                                            onChange={(e) =>
                                                setUppercase(e.target.checked)
                                            }
                                            className="mr-2"
                                        />
                                        Uppercase
                                    </label>

                                    <label className="block">
                                        <input
                                            type="checkbox"
                                            checked={lowercase}
                                            onChange={(e) =>
                                                setLowercase(e.target.checked)
                                            }
                                            className="mr-2"
                                        />
                                        Lowercase
                                    </label>

                                    <label className="block">
                                        <input
                                            type="checkbox"
                                            checked={numbers}
                                            onChange={(e) =>
                                                setNumbers(e.target.checked)
                                            }
                                            className="mr-2"
                                        />
                                        Numbers
                                    </label>

                                    <label className="block">
                                        <input
                                            type="checkbox"
                                            checked={special}
                                            onChange={(e) =>
                                                setSpecial(e.target.checked)
                                            }
                                            className="mr-2"
                                        />
                                        Special Characters
                                    </label>

                                </div>

                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Generate
                                </button>

                                {generatedPassword && (

                                    <div className="mt-5">

                                        <p className="font-medium mb-2">
                                            Generated Password:
                                        </p>

                                        <div className="bg-white border rounded-lg p-3 break-all mb-3">
                                            {generatedPassword}
                                        </div>

                                        <p className="mb-3">
                                            Strength:{" "}
                                            <strong>
                                                {strength}
                                            </strong>
                                        </p>

                                        <button
                                            type="button"
                                            onClick={useGeneratedPassword}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                        >
                                            Use This Password
                                        </button>

                                    </div>

                                )}

                            </div>

                        )}

                        {message && (
                            <p className="text-blue-600 mb-4">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            {loading ? "Saving..." : "Save Credential"}
                        </button>

                    </form>

                </div>

                {/* Credentials */}

                <div className="bg-white rounded-xl shadow-md p-6">

                    <h2 className="text-2xl font-bold mb-5">
                        My Credentials
                    </h2>

                    {credentials.length === 0 ? (

                        <p className="text-gray-500">
                            No credentials saved yet.
                        </p>

                    ) : (

                        <div className="space-y-4">

                            {credentials.map((credential) => (

                                <div
                                    key={credential.id}
                                    className="border rounded-lg p-4"
                                >

                                    <h3 className="text-xl font-bold">
                                        {credential.title}
                                    </h3>

                                    <p className="text-gray-600 mt-2">
                                        Username:{" "}
                                        {credential.username}
                                    </p>

                                    <p className="text-gray-600">
                                        Password:{" "}
                                        {credential.password}
                                    </p>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Vault;