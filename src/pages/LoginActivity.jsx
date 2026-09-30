import React, {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getLoginHistory
} from "../api/loginactivityservice";


function LoginActivity() {

    const navigate = useNavigate();

    const [events, setEvents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD LOGIN HISTORY
    // =========================================================

    useEffect(() => {

        const loadHistory = async () => {

            try {

                setLoading(true);

                setError("");

                const data =
                    await getLoginHistory();

                setEvents(
                    Array.isArray(data)
                        ? data
                        : []
                );

            }
            catch (error) {

                console.error(
                    "Failed to load login history:",
                    error
                );

                if (
                    error.response?.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "username"
                    );

                    navigate("/login");

                    return;
                }

                setError(
                    error.response?.data ||
                    "Unable to load login activity."
                );

            }
            finally {

                setLoading(false);
            }
        };


        loadHistory();

    }, [navigate]);


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (value) => {

        if (!value) {
            return "Unknown";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toLocaleString();
    };


    // =========================================================
    // GET BROWSER TEXT
    // =========================================================

    const getBrowserText = (userAgent) => {

        if (
            !userAgent ||
            userAgent === "UNKNOWN"
        ) {
            return "Unknown device/browser";
        }

        return userAgent;
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="
            min-h-screen
            bg-slate-950
            text-white
            px-4
            py-8
            sm:px-6
            lg:px-8
        ">

            <div className="
                mx-auto
                max-w-6xl
            ">

                {/* HEADER */}

                <div className="
                    mb-8
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">

                    <div>

                        <p className="
                            mb-2
                            text-sm
                            font-medium
                            text-indigo-400
                        ">
                            SECURITY
                        </p>

                        <h1 className="
                            text-3xl
                            font-bold
                            tracking-tight
                        ">
                            Login Activity
                        </h1>

                        <p className="
                            mt-2
                            text-sm
                            text-slate-400
                        ">
                            Review your recent login
                            attempts and account activity.
                        </p>

                    </div>


                    <Link
                        to="/dashboard"
                        className="
                            inline-flex
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-900
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-slate-200
                            transition
                            hover:bg-slate-800
                        "
                    >
                        ← Back to Dashboard
                    </Link>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="
                        mb-6
                        rounded-xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-300
                    ">
                        {error}
                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className="
                        rounded-2xl
                        border
                        border-slate-800
                        bg-slate-900
                        p-8
                        text-center
                        text-slate-400
                    ">
                        Loading login activity...
                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    events.length === 0 && (

                    <div className="
                        rounded-2xl
                        border
                        border-slate-800
                        bg-slate-900
                        p-10
                        text-center
                    ">

                        <div className="
                            mx-auto
                            mb-4
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-800
                            text-2xl
                        ">
                            🔐
                        </div>

                        <h2 className="
                            text-lg
                            font-semibold
                        ">
                            No login activity yet
                        </h2>

                        <p className="
                            mt-2
                            text-sm
                            text-slate-400
                        ">
                            Your login attempts will
                            appear here.
                        </p>

                    </div>

                )}


                {/* EVENTS */}

                {!loading &&
                    events.length > 0 && (

                    <div className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-800
                        bg-slate-900
                    ">

                        <div className="
                            overflow-x-auto
                        ">

                            <table className="
                                min-w-full
                                text-left
                            ">

                                <thead className="
                                    border-b
                                    border-slate-800
                                    bg-slate-950/70
                                ">

                                    <tr>

                                        <th className="
                                            px-6
                                            py-4
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                            text-slate-400
                                        ">
                                            Date / Time
                                        </th>

                                        <th className="
                                            px-6
                                            py-4
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                            text-slate-400
                                        ">
                                            Status
                                        </th>

                                        <th className="
                                            px-6
                                            py-4
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                            text-slate-400
                                        ">
                                            IP Address
                                        </th>

                                        <th className="
                                            px-6
                                            py-4
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                            text-slate-400
                                        ">
                                            Device / Browser
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {events.map(
                                        (event) => {

                                        const success =
                                            event.status ===
                                            "SUCCESS";

                                        return (

                                            <tr
                                                key={
                                                    event.id
                                                }
                                                className="
                                                    border-b
                                                    border-slate-800
                                                    last:border-b-0
                                                    hover:bg-slate-800/40
                                                "
                                            >

                                                <td className="
                                                    whitespace-nowrap
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    text-slate-200
                                                ">

                                                    {formatDate(
                                                        event.loginDateTime
                                                    )}

                                                </td>


                                                <td className="
                                                    px-6
                                                    py-5
                                                ">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            rounded-full
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            ${
                                                                success
                                                                ? "bg-emerald-500/10 text-emerald-400"
                                                                : "bg-red-500/10 text-red-400"
                                                            }
                                                        `}
                                                    >
                                                        {success
                                                            ? "SUCCESS"
                                                            : "FAILURE"}
                                                    </span>

                                                </td>


                                                <td className="
                                                    whitespace-nowrap
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    text-slate-300
                                                ">

                                                    {event.ipAddress ||
                                                        "Unknown"}

                                                </td>


                                                <td className="
                                                    max-w-xl
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    leading-6
                                                    text-slate-400
                                                ">

                                                    <div className="
                                                        max-w-md
                                                        truncate
                                                    ">

                                                        {getBrowserText(
                                                            event.userAgent
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}


export default LoginActivity;