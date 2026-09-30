import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/vault";

function TeamVault() {

    // =========================================================
    // STATE
    // =========================================================

    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const [members, setMembers] = useState([]);
    const [credentials, setCredentials] = useState([]);

    const [loading, setLoading] = useState(true);
    const [membersLoading, setMembersLoading] = useState(false);
    const [credentialsLoading, setCredentialsLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [memberError, setMemberError] = useState("");

    const [showCreateTeam, setShowCreateTeam] =
        useState(false);

    const [showAddMember, setShowAddMember] =
        useState(false);

    const [teamName, setTeamName] = useState("");

    const [memberUsername, setMemberUsername] =
        useState("");

    const [memberRole, setMemberRole] =
        useState("MEMBER");

    const [creatingTeam, setCreatingTeam] =
        useState(false);

    const [addingMember, setAddingMember] =
        useState(false);

    const [removingMemberId, setRemovingMemberId] =
        useState(null);

    // =========================================================
    // AUTH CONFIG
    // =========================================================

    const getAuthConfig = () => {

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "Authentication token not found."
            );
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };
    };

    // =========================================================
    // ERROR MESSAGE HELPER
    // =========================================================

    const getErrorMessage = (
        err,
        fallback = "Something went wrong."
    ) => {

        if (typeof err?.response?.data === "string") {
            return err.response.data;
        }

        if (err?.response?.data?.message) {
            return err.response.data.message;
        }

        if (err?.message) {
            return err.message;
        }

        return fallback;
    };

    // =========================================================
    // LOAD TEAMS
    // =========================================================

    const loadTeams = async () => {

        try {

            setLoading(true);
            setError("");

            const config = getAuthConfig();

            const response = await axios.get(
                `${API_BASE_URL}/teams`,
                config
            );

            const teamData =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setTeams(teamData);

            if (teamData.length === 0) {

                setSelectedTeam(null);
                setMembers([]);
                setCredentials([]);

                return;
            }

            setSelectedTeam(
                currentSelectedTeam => {

                    if (!currentSelectedTeam) {
                        return teamData[0];
                    }

                    const existingTeam =
                        teamData.find(
                            team =>
                                Number(team.id) ===
                                Number(
                                    currentSelectedTeam.id
                                )
                        );

                    return (
                        existingTeam ||
                        teamData[0]
                    );
                }
            );

        } catch (err) {

            console.error(
                "Error loading teams:",
                err
            );

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to access Team Vault."
                );

            } else if (err.response?.status === 405) {

                setError(
                    "GET /api/vault/teams is not available. Restart the Spring Boot backend after updating TeamController."
                );

            } else {

                setError(
                    getErrorMessage(
                        err,
                        "Unable to load teams."
                    )
                );
            }

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // LOAD MEMBERS
    // =========================================================

    const loadMembers = async teamId => {

        if (!teamId) {

            setMembers([]);

            return;
        }

        try {

            setMembersLoading(true);
            setMemberError("");

            const config = getAuthConfig();

            const response = await axios.get(
                `${API_BASE_URL}/teams/${teamId}/members`,
                config
            );

            setMembers(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading members:",
                err
            );

            if (err.response?.status === 403) {

                setMemberError(
                    "You are not authorized to view these members."
                );

            } else if (err.response?.status === 404) {

                setMemberError(
                    "Team was not found."
                );

            } else if (err.response?.status === 405) {

                setMemberError(
                    "GET team members endpoint is missing in the backend."
                );

            } else {

                setMemberError(
                    getErrorMessage(
                        err,
                        "Unable to load team members."
                    )
                );
            }

            setMembers([]);

        } finally {

            setMembersLoading(false);
        }
    };

    // =========================================================
    // LOAD CREDENTIALS
    // =========================================================

    const loadCredentials = async teamId => {

        if (!teamId) {

            setCredentials([]);

            return;
        }

        try {

            setCredentialsLoading(true);

            const config = getAuthConfig();

            const response = await axios.get(
                `${API_BASE_URL}/teams/${teamId}/credentials`,
                config
            );

            setCredentials(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading credentials:",
                err
            );

            setCredentials([]);

        } finally {

            setCredentialsLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadTeams();

    }, []);

    // =========================================================
    // TEAM CHANGE
    // =========================================================

    useEffect(() => {

        if (!selectedTeam?.id) {

            setMembers([]);
            setCredentials([]);

            return;
        }

        loadMembers(selectedTeam.id);
        loadCredentials(selectedTeam.id);

    }, [selectedTeam]);

    // =========================================================
    // CREATE TEAM
    // =========================================================

    const handleCreateTeam = async event => {

        event.preventDefault();

        if (!teamName.trim()) {

            setError(
                "Team name is required."
            );

            return;
        }

        try {

            setCreatingTeam(true);
            setError("");

            const config = getAuthConfig();

            const response = await axios.post(
                `${API_BASE_URL}/teams`,
                {
                    name: teamName.trim()
                },
                config
            );

            const createdTeam = response.data;

            setTeamName("");
            setShowCreateTeam(false);

            await loadTeams();

            if (createdTeam?.id) {

                setSelectedTeam(createdTeam);
            }

        } catch (err) {

            console.error(
                "Create team error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to create team."
                )
            );

        } finally {

            setCreatingTeam(false);
        }
    };

    // =========================================================
    // ADD MEMBER
    // =========================================================

    const handleAddMember = async event => {

        event.preventDefault();

        if (!selectedTeam?.id) {

            setMemberError(
                "Please select a team first."
            );

            return;
        }

        if (!memberUsername.trim()) {

            setMemberError(
                "Member username is required."
            );

            return;
        }

        try {

            setAddingMember(true);
            setMemberError("");

            const config = getAuthConfig();

            await axios.post(
                `${API_BASE_URL}/teams/${selectedTeam.id}/members`,
                {
                    username:
                        memberUsername.trim(),

                    role: memberRole
                },
                config
            );

            setMemberUsername("");
            setMemberRole("MEMBER");

            setShowAddMember(false);

            await loadMembers(
                selectedTeam.id
            );

        } catch (err) {

            console.error(
                "Add member error:",
                err
            );

            if (err.response?.status === 400) {

                setMemberError(
                    getErrorMessage(
                        err,
                        "Invalid member information."
                    )
                );

            } else if (
                err.response?.status === 403
            ) {

                setMemberError(
                    "You are not authorized to add members."
                );

            } else if (
                err.response?.status === 404
            ) {

                setMemberError(
                    "User or team was not found."
                );

            } else {

                setMemberError(
                    getErrorMessage(
                        err,
                        "Unable to add member."
                    )
                );
            }

        } finally {

            setAddingMember(false);
        }
    };

    // =========================================================
    // REMOVE MEMBER
    // =========================================================

    const handleRemoveMember = async member => {

        if (!selectedTeam?.id) {
            return;
        }

        const userId =
            member?.user?.id ||
            member?.userId ||
            member?.id;

        if (!userId) {

            setMemberError(
                "Unable to determine member user ID."
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to remove this member?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setRemovingMemberId(userId);
            setMemberError("");

            const config = getAuthConfig();

            await axios.delete(
                `${API_BASE_URL}/teams/${selectedTeam.id}/members/${userId}`,
                config
            );

            await loadMembers(
                selectedTeam.id
            );

        } catch (err) {

            console.error(
                "Remove member error:",
                err
            );

            setMemberError(
                getErrorMessage(
                    err,
                    "Unable to remove member."
                )
            );

        } finally {

            setRemovingMemberId(null);
        }
    };

    // =========================================================
    // MEMBER HELPERS
    // =========================================================

    const getMemberName = member => {

        return (
            member?.user?.username ||
            member?.username ||
            member?.user?.email ||
            member?.email ||
            "Unknown user"
        );
    };

    const getMemberEmail = member => {

        return (
            member?.user?.email ||
            member?.email ||
            "No email"
        );
    };

    const getMemberRole = member => {

        return (
            member?.role ||
            "MEMBER"
        );
    };

    // =========================================================
    // CREDENTIAL HELPERS
    // =========================================================

    const getCredentialTitle = item => {

        return (
            item?.title ||
            item?.credential?.title ||
            "Untitled credential"
        );
    };

    const getCredentialWebsite = item => {

        return (
            item?.website ||
            item?.credential?.website ||
            ""
        );
    };

    const getCredentialUsername = item => {

        return (
            item?.username ||
            item?.credential?.username ||
            ""
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

                <div className="text-center">

                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                    <p className="text-sm text-slate-600">
                        Loading Team Vault...
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}

            <header className="border-b border-slate-200 bg-white">

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Team Vault
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage teams, members and shared credentials.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowCreateTeam(true)
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            + Create Team
                        </button>

                    </div>

                </div>

            </header>

            {/* ERROR */}

            {error && (

                <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">

                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        {error}

                    </div>

                </div>
            )}

            {/* MAIN */}

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* TEAMS */}

                    <aside className="lg:col-span-4">

                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-200 px-5 py-4">

                                <h2 className="font-semibold text-slate-900">
                                    Your Teams
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Select a team to manage members.
                                </p>

                            </div>

                            {teams.length === 0 ? (

                                <div className="px-5 py-10 text-center">

                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                                        👥
                                    </div>

                                    <p className="text-sm font-medium text-slate-700">
                                        No teams yet
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Create your first team to get started.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCreateTeam(true)
                                        }
                                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Create Team
                                    </button>

                                </div>

                            ) : (

                                <div className="divide-y divide-slate-100">

                                    {teams.map(team => {

                                        const isSelected =
                                            Number(
                                                selectedTeam?.id
                                            ) ===
                                            Number(team.id);

                                        return (

                                            <button
                                                key={team.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedTeam(
                                                        team
                                                    )
                                                }
                                                className={`w-full px-5 py-4 text-left transition ${
                                                    isSelected
                                                        ? "bg-blue-50"
                                                        : "hover:bg-slate-50"
                                                }`}
                                            >

                                                <div className="flex items-center justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <p
                                                            className={`truncate text-sm font-semibold ${
                                                                isSelected
                                                                    ? "text-blue-700"
                                                                    : "text-slate-900"
                                                            }`}
                                                        >
                                                            {team.name}
                                                        </p>

                                                    </div>

                                                    <span
                                                        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                                                            isSelected
                                                                ? "bg-blue-600"
                                                                : "bg-slate-300"
                                                        }`}
                                                    />

                                                </div>

                                            </button>
                                        );
                                    })}

                                </div>
                            )}

                        </div>

                    </aside>

                    {/* RIGHT CONTENT */}

                    <section className="lg:col-span-8">

                        {!selectedTeam ? (

                            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                                    👥
                                </div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Select a team
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    Select a team from the left to view members and credentials.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-6">

                                {/* TEAM HEADER */}

                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>

                                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                                Team
                                            </p>

                                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                                {selectedTeam.name}
                                            </h2>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddMember(true)
                                            }
                                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            + Add Member
                                        </button>

                                    </div>

                                </div>

                                {/* MEMBERS */}

                                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                                    <div className="border-b border-slate-200 px-5 py-4">

                                        <h3 className="font-semibold text-slate-900">
                                            Team Members
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {members.length} member
                                            {members.length === 1
                                                ? ""
                                                : "s"}
                                        </p>

                                    </div>

                                    {memberError && (

                                        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {memberError}
                                        </div>

                                    )}

                                    {membersLoading ? (

                                        <div className="px-5 py-10 text-center">

                                            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                                            <p className="text-sm text-slate-500">
                                                Loading members...
                                            </p>

                                        </div>

                                    ) : members.length === 0 ? (

                                        <div className="px-5 py-10 text-center">

                                            <p className="text-sm font-medium text-slate-700">
                                                No members found
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Add a member to this team.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="divide-y divide-slate-100">

                                            {members.map(member => {

                                                const userId =
                                                    member?.user?.id ||
                                                    member?.userId ||
                                                    member?.id;

                                                const name =
                                                    getMemberName(
                                                        member
                                                    );

                                                return (

                                                    <div
                                                        key={
                                                            member.id
                                                        }
                                                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                    >

                                                        <div className="flex min-w-0 items-center gap-3">

                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">

                                                                {name
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}

                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                                    {name}
                                                                </p>

                                                                <p className="truncate text-xs text-slate-500">
                                                                    {getMemberEmail(
                                                                        member
                                                                    )}
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <div className="flex items-center gap-3">

                                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                                {getMemberRole(
                                                                    member
                                                                )}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveMember(
                                                                        member
                                                                    )
                                                                }
                                                                disabled={
                                                                    removingMemberId ===
                                                                    userId
                                                                }
                                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {removingMemberId ===
                                                                userId
                                                                    ? "Removing..."
                                                                    : "Remove"}
                                                            </button>

                                                        </div>

                                                    </div>
                                                );
                                            })}

                                        </div>
                                    )}

                                </div>

                                {/* CREDENTIALS */}

                                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                                    <div className="border-b border-slate-200 px-5 py-4">

                                        <h3 className="font-semibold text-slate-900">
                                            Shared Credentials
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Credentials available to this team.
                                        </p>

                                    </div>

                                    {credentialsLoading ? (

                                        <div className="px-5 py-10 text-center">

                                            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                                            <p className="text-sm text-slate-500">
                                                Loading credentials...
                                            </p>

                                        </div>

                                    ) : credentials.length === 0 ? (

                                        <div className="px-5 py-10 text-center">

                                            <p className="text-sm font-medium text-slate-700">
                                                No shared credentials
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                No credentials have been added to this team.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="divide-y divide-slate-100">

                                            {credentials.map(item => (

                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {getCredentialTitle(
                                                                item
                                                            )}
                                                        </p>

                                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">

                                                            {getCredentialWebsite(
                                                                item
                                                            ) && (

                                                                <span>
                                                                    {getCredentialWebsite(
                                                                        item
                                                                    )}
                                                                </span>
                                                            )}

                                                            {getCredentialUsername(
                                                                item
                                                            ) && (

                                                                <span>
                                                                    {getCredentialUsername(
                                                                        item
                                                                    )}
                                                                </span>
                                                            )}

                                                        </div>

                                                    </div>

                                                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        VIEW
                                                    </span>

                                                </div>
                                            ))}

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}

                    </section>

                </div>

            </main>

            {/* =================================================
                CREATE TEAM MODAL
            ================================================= */}

            {showCreateTeam && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">

                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                        <div className="border-b border-slate-200 px-5 py-4">

                            <div className="flex items-center justify-between">

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Create Team
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateTeam(false);
                                        setTeamName("");
                                    }}
                                    className="text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        <form
                            onSubmit={handleCreateTeam}
                            className="space-y-5 p-5"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Team Name
                                </label>

                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={event =>
                                        setTeamName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter team name"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    autoFocus
                                />

                            </div>

                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateTeam(false);
                                        setTeamName("");
                                    }}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creatingTeam}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creatingTeam
                                        ? "Creating..."
                                        : "Create Team"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                ADD MEMBER MODAL
            ================================================= */}

            {showAddMember && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">

                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                        <div className="border-b border-slate-200 px-5 py-4">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Add Member
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Add an existing user to{" "}
                                        {selectedTeam?.name}.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddMember(false);
                                        setMemberUsername("");
                                        setMemberRole("MEMBER");
                                        setMemberError("");
                                    }}
                                    className="text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        <form
                            onSubmit={handleAddMember}
                            className="space-y-5 p-5"
                        >

                            {memberError && (

                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {memberError}
                                </div>

                            )}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Member Username
                                </label>

                                <input
                                    type="text"
                                    value={memberUsername}
                                    onChange={event =>
                                        setMemberUsername(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter existing username"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    autoFocus
                                />

                                <p className="mt-1.5 text-xs text-slate-500">
                                    The username must already exist in SecureVault.
                                </p>

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Role
                                </label>

                                <select
                                    value={memberRole}
                                    onChange={event =>
                                        setMemberRole(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="MEMBER">
                                        MEMBER
                                    </option>

                                    <option value="ADMIN">
                                        ADMIN
                                    </option>

                                </select>

                            </div>

                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddMember(false);
                                        setMemberUsername("");
                                        setMemberRole("MEMBER");
                                        setMemberError("");
                                    }}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={addingMember}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {addingMember
                                        ? "Adding..."
                                        : "Add Member"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default TeamVault;