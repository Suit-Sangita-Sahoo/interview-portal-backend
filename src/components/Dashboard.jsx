import React, { useEffect, useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getCredentials,
    getSharedCredentials
} from "../api/credentialservice";

function Dashboard() {

    const navigate = useNavigate();

    const username =
        localStorage.getItem("username") || "User";

    const [credentials, setCredentials] = useState([]);
    const [sharedCredentials, setSharedCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCredentials = async () => {

        setLoading(true);
        setError("");

        try {

            const [own, shared] = await Promise.all([
                getCredentials(),
                getSharedCredentials()
            ]);

            setCredentials(
                Array.isArray(own) ? own : []
            );

            setSharedCredentials(
                Array.isArray(shared) ? shared : []
            );

        } catch (error) {

            console.error(
                "Unable to load credentials:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.clear();

                navigate("/login", {
                    replace: true
                });

                return;
            }

            setError(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to load credentials."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadCredentials();
    }, []);

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("username");

        navigate("/login", {
            replace: true
        });
    };

    return (
        <div className="min-h-screen bg-slate-950">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="border-b border-slate-800 bg-slate-900">

                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-600/20">
                                S
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    SecureVault
                                </h1>

                                <p className="text-sm text-slate-400">
                                    Secure credential management
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <Link
                            to="/add-credential"
                            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                            + Add Credential
                        </Link>

                        <Link
                            to="/teams"
                            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                        >
                            Team Vault
                        </Link>

                        <button
                            onClick={logout}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Welcome */}

                <div className="mb-8">

                    <p className="text-sm font-medium text-indigo-400">
                        Dashboard
                    </p>

                    <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">
                        Welcome, {username}
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Manage your credentials and shared access
                        securely.
                    </p>

                </div>

                {/* Error */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>

                )}

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">

                        <div className="text-center">

                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

                            <p className="mt-4 text-slate-400">
                                Loading credentials...
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="space-y-10">

                        {/* =================================================
                            MY CREDENTIALS
                        ================================================= */}

                        <section>

                            <div className="mb-5 flex items-center justify-between">

                                <div>

                                    <h3 className="text-xl font-bold text-white">
                                        My Credentials
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Credentials owned by you.
                                    </p>

                                </div>

                                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400">
                                    {credentials.length}
                                </span>

                            </div>

                            {credentials.length === 0 ? (

                                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                                        🔐
                                    </div>

                                    <h4 className="mt-4 font-semibold text-white">
                                        No credentials yet
                                    </h4>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Add your first credential to
                                        start using SecureVault.
                                    </p>

                                    <Link
                                        to="/add-credential"
                                        className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                                    >
                                        Add Credential
                                    </Link>

                                </div>

                            ) : (

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                    {credentials.map(
                                        (credential) => (

                                            <div
                                                key={credential.id}
                                                className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-indigo-500/40"
                                            >

                                                <div className="flex items-start justify-between">

                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-lg">
                                                        🔑
                                                    </div>

                                                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                                        Owned
                                                    </span>

                                                </div>

                                                <h4 className="mt-5 truncate text-lg font-bold text-white">
                                                    {credential.title}
                                                </h4>

                                                <p className="mt-2 truncate text-sm text-slate-400">
                                                    {credential.username}
                                                </p>

                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {credential.website ||
                                                        "No website"}
                                                </p>

                                                <Link
                                                    to={`/credentials/${credential.id}`}
                                                    className="mt-5 block rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 transition hover:bg-indigo-600 hover:text-white"
                                                >
                                                    View Credential
                                                </Link>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </section>

                        {/* =================================================
                            SHARED WITH ME
                        ================================================= */}

                        <section>

                            <div className="mb-5 flex items-center justify-between">

                                <div>

                                    <h3 className="text-xl font-bold text-white">
                                        Shared With Me
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Credentials other users have
                                        shared with you.
                                    </p>

                                </div>

                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                                    {sharedCredentials.length}
                                </span>

                            </div>

                            {sharedCredentials.length === 0 ? (

                                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                                        👥
                                    </div>

                                    <p className="mt-3 text-sm text-slate-400">
                                        No credentials have been
                                        shared with you.
                                    </p>

                                </div>

                            ) : (

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                    {sharedCredentials.map(
                                        (credential) => (

                                            <div
                                                key={`shared-${credential.id}`}
                                                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-emerald-500/30"
                                            >

                                                <div className="flex items-start justify-between">

                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                                                        🤝
                                                    </div>

                                                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                                        Shared
                                                    </span>

                                                </div>

                                                <h4 className="mt-5 truncate text-lg font-bold text-white">
                                                    {credential.title}
                                                </h4>

                                                <p className="mt-2 text-sm text-slate-400">
                                                    Owner:{" "}
                                                    <span className="text-slate-300">
                                                        {credential.ownerUsername ||
                                                            "Unknown"}
                                                    </span>
                                                </p>

                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {credential.username}
                                                </p>

                                                <Link
                                                    to={`/credentials/${credential.id}`}
                                                    className="mt-5 block rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 transition hover:bg-emerald-600 hover:text-white"
                                                >
                                                    Open Shared Credential
                                                </Link>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </section>

                    </div>
                )}

            </main>

        </div>
    );
}

export default Dashboard;