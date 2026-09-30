import React, {
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    addCredential
} from "../api/credentialservice";

function AddCredential() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        username: "",
        password: "",
        website: "",
        notes: ""
    });

    const [rules, setRules] = useState({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [generatedPassword, setGeneratedPassword] =
        useState("");

    /* =========================================================
       FORM CHANGE
    ========================================================= */

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
        setSuccess("");
    };

    /* =========================================================
       PASSWORD RULE CHANGE
    ========================================================= */

    const handleRuleChange = (event) => {

        const {
            name,
            type,
            checked,
            value
        } = event.target;

        setRules((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : Number(value)
        }));

        setError("");
        setSuccess("");
    };

    /* =========================================================
       PASSWORD GENERATOR
    ========================================================= */

    const generatePassword = () => {

        let characterSets = [];

        if (rules.uppercase) {

            characterSets.push(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            );
        }

        if (rules.lowercase) {

            characterSets.push(
                "abcdefghijklmnopqrstuvwxyz"
            );
        }

        if (rules.numbers) {

            characterSets.push(
                "0123456789"
            );
        }

        if (rules.special) {

            characterSets.push(
                "!@#$%^&*()_+-=[]{}|;:,.<>?"
            );
        }

        if (characterSets.length === 0) {

            setError(
                "Select at least one password character type."
            );

            return;
        }

        const length = Math.max(
            4,
            Number(rules.length)
        );

        let password = "";

        /*
         * Guarantee at least one character
         * from every selected category.
         */

        characterSets.forEach(
            (characters) => {

                password +=
                    characters[
                        Math.floor(
                            Math.random() *
                            characters.length
                        )
                    ];
            }
        );

        /*
         * Combine all selected character sets.
         */

        const allCharacters =
            characterSets.join("");

        while (
            password.length < length
        ) {

            password +=
                allCharacters[
                    Math.floor(
                        Math.random() *
                        allCharacters.length
                    )
                ];
        }

        /*
         * Shuffle generated password.
         */

        password =
            password
                .split("")
                .sort(
                    () => Math.random() - 0.5
                )
                .join("");

        setGeneratedPassword(
            password
        );

        setSuccess(
            "Password generated successfully."
        );

        setError("");
    };

    /* =========================================================
       USE GENERATED PASSWORD
    ========================================================= */

    const useGeneratedPassword = () => {

        if (!generatedPassword) {

            setError(
                "Generate a password first."
            );

            return;
        }

        setFormData((previous) => ({
            ...previous,
            password: generatedPassword
        }));

        setSuccess(
            "Generated password added to the credential."
        );

        setError("");
    };

    /* =========================================================
       PASSWORD STRENGTH ANALYSIS
    ========================================================= */

    const passwordAnalysis = useMemo(() => {

        const password =
            formData.password || "";

        let score = 0;

        const suggestions = [];

        if (password.length >= 12) {

            score++;

        } else {

            suggestions.push(
                "Use at least 12 characters."
            );
        }

        if (/[A-Z]/.test(password)) {

            score++;

        } else {

            suggestions.push(
                "Add uppercase letters."
            );
        }

        if (/[a-z]/.test(password)) {

            score++;

        } else {

            suggestions.push(
                "Add lowercase letters."
            );
        }

        if (/[0-9]/.test(password)) {

            score++;

        } else {

            suggestions.push(
                "Add numbers."
            );
        }

        if (/[^A-Za-z0-9]/.test(password)) {

            score++;

        } else {

            suggestions.push(
                "Add special characters."
            );
        }

        let strength = "Very Weak";

        if (score >= 5) {

            strength = "Very Strong";

        } else if (score === 4) {

            strength = "Strong";

        } else if (score === 3) {

            strength = "Medium";

        } else if (score === 2) {

            strength = "Weak";
        }

        return {
            score,
            strength,
            suggestions
        };

    }, [formData.password]);

    /* =========================================================
       STRENGTH COLOR
    ========================================================= */

    const getStrengthColor = () => {

        switch (
            passwordAnalysis.strength
        ) {

            case "Very Strong":
                return "text-emerald-400";

            case "Strong":
                return "text-green-400";

            case "Medium":
                return "text-yellow-400";

            case "Weak":
                return "text-orange-400";

            default:
                return "text-red-400";
        }
    };

    const getStrengthBarColor = () => {

        switch (
            passwordAnalysis.strength
        ) {

            case "Very Strong":
                return "bg-emerald-500";

            case "Strong":
                return "bg-green-500";

            case "Medium":
                return "bg-yellow-500";

            case "Weak":
                return "bg-orange-500";

            default:
                return "bg-red-500";
        }
    };

    /* =========================================================
       SAVE CREDENTIAL
    ========================================================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.title.trim()) {

            setError(
                "Please enter a credential title."
            );

            return;
        }

        if (!formData.username.trim()) {

            setError(
                "Please enter a username."
            );

            return;
        }

        if (!formData.password) {

            setError(
                "Please enter or generate a password."
            );

            return;
        }

        setLoading(true);

        try {

            await addCredential({

                title:
                    formData.title.trim(),

                username:
                    formData.username.trim(),

                password:
                    formData.password,

                website:
                    formData.website.trim(),

                notes:
                    formData.notes
            });

            setSuccess(
                "Credential saved successfully."
            );

            setTimeout(() => {

                navigate(
                    "/dashboard"
                );

            }, 700);

        } catch (error) {

            console.error(
                "Failed to save credential:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                localStorage.clear();

                navigate(
                    "/login"
                );

                return;
            }

            setError(
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to save credential."
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

            <div className="mx-auto max-w-5xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold shadow-lg shadow-indigo-600/20">
                                +
                            </div>

                            <div>

                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Add Credential
                                </h1>

                                <p className="mt-1 text-sm text-slate-400">
                                    Store your credential securely
                                    in SecureVault.
                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                    >
                        ← Dashboard
                    </button>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

                        <span className="text-lg">
                            ⚠
                        </span>

                        <p>
                            {error}
                        </p>

                    </div>
                )}

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">

                        <span className="text-lg">
                            ✓
                        </span>

                        <p>
                            {success}
                        </p>

                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* =================================================
                        CREDENTIAL DETAILS
                    ================================================= */}

                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-7">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-lg">
                                🔐
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-white">
                                    Credential Details
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Enter the basic information
                                    for this credential.
                                </p>

                            </div>

                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                            {/* TITLE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Gmail"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                            </div>

                            {/* USERNAME */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Username or email"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                            </div>

                            {/* WEBSITE */}

                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Website
                                    <span className="ml-2 text-xs font-normal text-slate-500">
                                        Optional
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        PASSWORD GENERATOR
                    ================================================= */}

                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-7">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-lg">
                                ⚙
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-white">
                                    Password Rules
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Configure the password
                                    generator.
                                </p>

                            </div>

                        </div>

                        {/* LENGTH */}

                        <div className="mb-6">

                            <div className="mb-2 flex items-center justify-between">

                                <label className="text-sm font-medium text-slate-300">
                                    Password Length
                                </label>

                                <span className="rounded-lg bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-400">
                                    {rules.length}
                                </span>

                            </div>

                            <input
                                type="range"
                                name="length"
                                min="4"
                                max="128"
                                value={rules.length}
                                onChange={handleRuleChange}
                                className="w-full accent-indigo-500"
                            />

                            <div className="mt-1 flex justify-between text-xs text-slate-500">

                                <span>
                                    4
                                </span>

                                <span>
                                    128
                                </span>

                            </div>

                        </div>

                        {/* CHECKBOXES */}

                        <div className="grid gap-3 sm:grid-cols-2">

                            {/* UPPERCASE */}

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition hover:border-indigo-500/40">

                                <input
                                    type="checkbox"
                                    name="uppercase"
                                    checked={rules.uppercase}
                                    onChange={handleRuleChange}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-white">
                                        Uppercase
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        A-Z
                                    </p>

                                </div>

                            </label>

                            {/* LOWERCASE */}

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition hover:border-indigo-500/40">

                                <input
                                    type="checkbox"
                                    name="lowercase"
                                    checked={rules.lowercase}
                                    onChange={handleRuleChange}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-white">
                                        Lowercase
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        a-z
                                    </p>

                                </div>

                            </label>

                            {/* NUMBERS */}

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition hover:border-indigo-500/40">

                                <input
                                    type="checkbox"
                                    name="numbers"
                                    checked={rules.numbers}
                                    onChange={handleRuleChange}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-white">
                                        Numbers
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        0-9
                                    </p>

                                </div>

                            </label>

                            {/* SPECIAL */}

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition hover:border-indigo-500/40">

                                <input
                                    type="checkbox"
                                    name="special"
                                    checked={rules.special}
                                    onChange={handleRuleChange}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />

                                <div>

                                    <p className="text-sm font-medium text-white">
                                        Special Characters
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        ! @ # $ %
                                    </p>

                                </div>

                            </label>

                        </div>

                        {/* GENERATE */}

                        <button
                            type="button"
                            onClick={generatePassword}
                            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-500 active:scale-[0.99]"
                        >
                            ✨ Generate Password
                        </button>

                    </section>

                    {/* =================================================
                        GENERATED PASSWORD
                    ================================================= */}

                    {generatedPassword && (

                        <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 shadow-xl sm:p-7">

                            <div className="mb-5 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                                    ✨
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-white">
                                        Generated Password
                                    </h2>

                                    <p className="text-sm text-slate-400">
                                        Your generated password is
                                        ready to use.
                                    </p>

                                </div>

                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">

                                <input
                                    type="text"
                                    value={generatedPassword}
                                    readOnly
                                    className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm text-indigo-300 outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={useGeneratedPassword}
                                    className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
                                >
                                    ✓ Use Password
                                </button>

                            </div>

                        </section>
                    )}

                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-7">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                🔑
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-white">
                                    Password
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Enter your password or use
                                    the generated one.
                                </p>

                            </div>

                        </div>

                        <div className="relative">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-24 font-mono text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-white"
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </section>

                    {/* =================================================
                        STRENGTH ANALYSIS
                    ================================================= */}

                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-7">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                                🛡
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-white">
                                    Password Strength
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Your password is analyzed
                                    automatically.
                                </p>

                            </div>

                        </div>

                        {/* STRENGTH */}

                        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-5">

                            <div className="flex items-center justify-between">

                                <span className="text-sm text-slate-400">
                                    Strength
                                </span>

                                <span
                                    className={`font-bold ${getStrengthColor()}`}
                                >
                                    {passwordAnalysis.strength}
                                </span>

                            </div>

                            {/* SCORE BAR */}

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">

                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getStrengthBarColor()}`}
                                    style={{
                                        width: `${
                                            (
                                                passwordAnalysis.score /
                                                5
                                            ) * 100
                                        }%`
                                    }}
                                />

                            </div>

                            <div className="mt-3 flex justify-between text-xs text-slate-500">

                                <span>
                                    Score
                                </span>

                                <span>
                                    {passwordAnalysis.score}/5
                                </span>

                            </div>

                        </div>

                        {/* SUGGESTIONS */}

                        {passwordAnalysis.suggestions.length > 0 ? (

                            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                                <h3 className="font-semibold text-yellow-300">
                                    💡 Suggestions
                                </h3>

                                <ul className="mt-3 space-y-2">

                                    {passwordAnalysis.suggestions.map(
                                        (
                                            suggestion,
                                            index
                                        ) => (

                                            <li
                                                key={index}
                                                className="flex items-start gap-2 text-sm text-slate-300"
                                            >
                                                <span className="text-yellow-400">
                                                    •
                                                </span>

                                                {suggestion}

                                            </li>
                                        )
                                    )}

                                </ul>

                            </div>

                        ) : (

                            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                                <p className="text-sm font-medium text-emerald-300">
                                    ✓ Your password meets all
                                    strength checks.
                                </p>

                            </div>
                        )}

                    </section>

                    {/* =================================================
                        NOTES
                    ================================================= */}

                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-7">

                        <div className="mb-5">

                            <h2 className="text-lg font-bold text-white">
                                Notes
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Add optional information about
                                this credential.
                            </p>

                        </div>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Optional notes..."
                            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />

                    </section>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Saving Credential..."
                                : "🔒 Save Credential"}
                        </button>

                    </div>

                </form>

                {/* =================================================
                    SECURITY NOTICE
                ================================================= */}

                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">

                    <p className="text-xs leading-5 text-slate-500">
                        🔐 Your password is protected by the
                        SecureVault backend before being stored.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default AddCredential;