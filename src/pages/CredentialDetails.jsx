import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCredential } from "../api/credentialservice";

function CredentialDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [credential, setCredential] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState("");

    useEffect(() => {
        loadCredential();
    }, [id]);

    const loadCredential = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getCredential(id);

            setCredential(data);

        } catch (error) {

            console.error(
                "Failed to load credential:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");

                navigate("/login", {
                    replace: true
                });

                return;
            }

            setError(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message ||
                      "Unable to load credential."
            );

        } finally {

            setLoading(false);

        }
    };

    const copyToClipboard = async (value, type) => {

        try {

            await navigator.clipboard.writeText(value);

            setCopied(type);

            setTimeout(() => {
                setCopied("");
            }, 1500);

        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );

        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600">
                        Loading credential...
                    </p>

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

                <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">

                    <div className="text-4xl mb-4">
                        ⚠️
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Unable to load credential
                    </h2>

                    <p className="text-red-500 mb-6">
                        {error}
                    </p>

                    <Link
                        to="/dashboard"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
                    >
                        Back to Dashboard
                    </Link>

                </div>

            </div>
        );
    }

    if (!credential) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}

            <header className="bg-white border-b border-gray-200">

                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

                    <Link
                        to="/dashboard"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        ← Dashboard
                    </Link>

                    <h1 className="text-xl font-bold text-gray-800">
                        Credential Details
                    </h1>

                    <div className="w-20"></div>

                </div>

            </header>

            {/* Content */}

            <main className="max-w-3xl mx-auto px-4 py-8">

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">

                    {/* Credential Header */}

                    <div className="bg-blue-600 px-6 py-6 text-white">

                        <div className="flex items-center gap-4">

                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                                🔐
                            </div>

                            <div>

                                <h2 className="text-2xl font-bold">
                                    {credential.title}
                                </h2>

                                <p className="text-blue-100 mt-1">
                                    Secure Credential
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Credential Information */}

                    <div className="p-6 space-y-6">

                        {/* Username */}

                        <div>

                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Username
                            </label>

                            <div className="flex gap-2">

                                <input
                                    type="text"
                                    value={credential.username || ""}
                                    readOnly
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard(
                                            credential.username || "",
                                            "username"
                                        )
                                    }
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                >
                                    {copied === "username"
                                        ? "Copied!"
                                        : "Copy"}
                                </button>

                            </div>

                        </div>

                        {/* Password */}

                        <div>

                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Password
                            </label>

                            <div className="flex gap-2">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        credential.password || ""
                                    }
                                    readOnly
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard(
                                            credential.password || "",
                                            "password"
                                        )
                                    }
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                >
                                    {copied === "password"
                                        ? "Copied!"
                                        : "Copy"}
                                </button>

                            </div>

                        </div>

                        {/* URL */}

                        {credential.url && (
                            <div>

                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Website URL
                                </label>

                                <a
                                    href={credential.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-blue-600 hover:underline break-all"
                                >
                                    {credential.url}
                                </a>

                            </div>
                        )}

                        {/* Notes */}

                        {credential.notes && (
                            <div>

                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                    Notes
                                </label>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 whitespace-pre-wrap">
                                    {credential.notes}
                                </div>

                            </div>
                        )}

                    </div>

                    {/* Actions */}

                    <div className="border-t border-gray-200 px-6 py-5 flex flex-wrap gap-3">

                        <Link
                            to={`/credentials/${credential.id}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
                        >
                            Edit
                        </Link>

                        <Link
                            to={`/credentials/${credential.id}/share`}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium"
                        >
                            Share
                        </Link>

                        <Link
                            to="/dashboard"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium"
                        >
                            Back
                        </Link>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default CredentialDetails;