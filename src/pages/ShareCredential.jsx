import React, { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getCredential
} from "../api/credentialservice";

import {
    shareCredential,
    getCredentialShares,
    removeShare
} from "../api/shareservice";

function ShareCredential() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [credential, setCredential] = useState(null);

    const [username, setUsername] = useState("");
    const [permission, setPermission] = useState("VIEW");
    const [expiresAt, setExpiresAt] = useState("");

    const [shares, setShares] = useState([]);

    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const credentialData =
                await getCredential(id);

            setCredential(credentialData);

            const shareData =
                await getCredentialShares(id);

            setShares(
                Array.isArray(shareData)
                    ? shareData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load sharing information:",
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
                      "Unable to load sharing information."
            );

        } finally {

            setLoading(false);

        }
    };

    const handleShare = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        if (!expiresAt) {
            setError("Please select an expiry date and time.");
            return;
        }

        try {

            setSharing(true);

            await shareCredential(
                id,
                {
                    username: username.trim(),
                    permission: permission,
                    expiresAt: expiresAt
                }
            );

            setSuccess(
                "Credential shared successfully."
            );

            setUsername("");
            setPermission("VIEW");
            setExpiresAt("");

            await loadData();

        } catch (error) {

            console.error(
                "Failed to share credential:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("username");

                navigate("/login", {
                    replace: true
                });

                return;
            }

            if (
                error.response?.status === 403
            ) {

                setError(
                    "You do not have permission to share this credential."
                );

                return;
            }

            setError(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message ||
                      "Unable to share credential."
            );

        } finally {

            setSharing(false);

        }
    };

    const handleRemoveShare = async (shareId) => {

        const confirmed = window.confirm(
            "Remove this user's access?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await removeShare(shareId);

            setSuccess(
                "Access removed successfully."
            );

            await loadData();

        } catch (error) {
    console.error("Failed to share credential:", error);

    console.error(
        "Backend status:",
        error.response?.status
    );

    console.error(
        "Backend response:",
        error.response?.data
    );

    alert(
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to share credential."
    );
}
    };

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <p className="text-gray-600">
                    Loading...
                </p>

            </div>
        );

    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}

            <header className="bg-white border-b border-gray-200">

                <div className="max-w-4xl mx-auto px-4 py-4">

                    <Link
                        to={`/credentials/${id}`}
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Credential
                    </Link>

                </div>

            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">

                {/* Credential Title */}

                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-gray-800">
                        Share Credential
                    </h1>

                    <p className="text-gray-500 mt-1">
                        {credential?.title ||
                            "Credential"}
                    </p>

                </div>

                {/* Messages */}

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3">
                        {success}
                    </div>
                )}

                {/* Share Form */}

                <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">

                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Share With User
                    </h2>

                    <form
                        onSubmit={handleShare}
                        className="space-y-5"
                    >

                        {/* Username */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter user's username"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Enter the SecureVault username of the person.
                            </p>

                        </div>

                        {/* Permission */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Permission
                            </label>

                            <select
                                value={permission}
                                onChange={(e) =>
                                    setPermission(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >

                                <option value="VIEW">
                                    View Only
                                </option>

                                <option value="EDIT">
                                    View & Edit
                                </option>

                                <option value="FULL_MANAGEMENT">
                                    Full Management
                                </option>

                            </select>

                        </div>

                        {/* Expiry */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Access Expiry
                            </label>

                            <input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) =>
                                    setExpiresAt(
                                        e.target.value
                                    )
                                }
                                min={
                                    new Date()
                                        .toISOString()
                                        .slice(0, 16)
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Access will expire automatically at this time.
                            </p>

                        </div>

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={sharing}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {sharing
                                ? "Sharing..."
                                : "Share Credential"}
                        </button>

                    </form>

                </div>

                {/* Existing Shares */}

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">

                    <div className="px-6 py-5 border-b border-gray-200">

                        <h2 className="text-xl font-bold text-gray-800">
                            Shared Users
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage users who have access to this credential.
                        </p>

                    </div>

                    {shares.length === 0 ? (

                        <div className="p-8 text-center">

                            <div className="text-4xl mb-3">
                                👥
                            </div>

                            <p className="text-gray-500">
                                This credential has not been shared yet.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-gray-200">

                            {shares.map((share) => (

                                <div
                                    key={share.id}
                                    className="p-5"
                                >

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                        <div>

                                            <h3 className="font-semibold text-gray-800">
                                                {share.username}
                                            </h3>

                                            <div className="flex flex-wrap gap-2 mt-2">

                                                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {share.permission}
                                                </span>

                                                <span
                                                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                        share.active
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {share.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </div>

                                            {share.expiresAt && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Expires:{" "}
                                                    {new Date(
                                                        share.expiresAt
                                                    ).toLocaleString()}
                                                </p>
                                            )}

                                        </div>

                                        {share.active && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveShare(
                                                        share.id
                                                    )
                                                }
                                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium"
                                            >
                                                Remove Access
                                            </button>
                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default ShareCredential;