import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getCredential,
    updateCredential
} from "../api/credentialservice";

function EditCredential() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [credential, setCredential] = useState({
        title: "",
        username: "",
        password: "",
        url: "",
        notes: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadCredential();
    }, [id]);

    const loadCredential = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getCredential(id);

            setCredential({
                title: data.title || "",
                username: data.username || "",
                password: data.password || "",
                url: data.url || "",
                notes: data.notes || ""
            });

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

    const handleChange = (e) => {

        const { name, value } = e.target;

        setCredential((previous) => ({
            ...previous,
            [name]: value
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!credential.title.trim()) {
            setError("Title is required.");
            return;
        }

        if (!credential.username.trim()) {
            setError("Username is required.");
            return;
        }

        if (!credential.password) {
            setError("Password is required.");
            return;
        }

        try {

            setSaving(true);

            await updateCredential(
                id,
                {
                    title: credential.title.trim(),
                    username: credential.username.trim(),
                    password: credential.password,
                    url: credential.url.trim(),
                    notes: credential.notes.trim()
                }
            );

            setSuccess(
                "Credential updated successfully."
            );

            setTimeout(() => {
                navigate(`/credentials/${id}`);
            }, 800);

        } catch (error) {

            console.error(
                "Failed to update credential:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                setError(
                    "You do not have permission to edit this credential."
                );
                return;
            }

            setError(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message ||
                      "Unable to update credential."
            );

        } finally {

            setSaving(false);

        }
    };

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <p className="text-gray-600">
                    Loading credential...
                </p>

            </div>
        );

    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}

            <header className="bg-white border-b border-gray-200">

                <div className="max-w-3xl mx-auto px-4 py-4">

                    <Link
                        to={`/credentials/${id}`}
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Credential
                    </Link>

                </div>

            </header>

            {/* Main */}

            <main className="max-w-3xl mx-auto px-4 py-8">

                <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">

                    <h1 className="text-2xl font-bold text-gray-800">
                        Edit Credential
                    </h1>

                    <p className="text-gray-500 mt-1 mb-6">
                        Update your saved credential.
                    </p>

                    {/* Error */}

                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Success */}

                    {success && (
                        <div className="mb-5 bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Title */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={credential.title}
                                onChange={handleChange}
                                placeholder="Example: Gmail"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Username */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={credential.username}
                                onChange={handleChange}
                                placeholder="Username or email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Password */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <input
                                type="text"
                                name="password"
                                value={credential.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* URL */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Website URL
                            </label>

                            <input
                                type="url"
                                name="url"
                                value={credential.url}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Notes */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={credential.notes}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Additional notes..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />

                        </div>

                        {/* Buttons */}

                        <div className="flex flex-col sm:flex-row gap-3 pt-3">

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                            <Link
                                to={`/credentials/${id}`}
                                className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg"
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default EditCredential;