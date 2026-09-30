import React, { useState } from "react";

import {
    shareCredential
} from "../services/shareService";

function ShareCredential({
    credentialId,
    onClose
}) {

    const [username, setUsername] =
        useState("");

    const [permission, setPermission] =
        useState("VIEW");

    const [expiresAt, setExpiresAt] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!username.trim()) {
            setError(
                "Username is required."
            );
            return;
        }

        try {

            setLoading(true);

            await shareCredential(
                credentialId,
                {
                    username: username.trim(),
                    permission,
                    expiresAt:
                        expiresAt
                            ? expiresAt
                            : null
                }
            );

            alert(
                "Credential shared successfully."
            );

            onClose?.();

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data ||
                "Failed to share credential."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="share-modal">

            <h3>
                Share Credential
            </h3>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <select
                    value={permission}
                    onChange={(e) =>
                        setPermission(
                            e.target.value
                        )
                    }
                >
                    <option value="VIEW">
                        View
                    </option>

                    <option value="EDIT">
                        Edit
                    </option>

                    <option value="FULL_MANAGEMENT">
                        Full Management
                    </option>
                </select>

                <label>
                    Expiry
                </label>

                <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) =>
                        setExpiresAt(
                            e.target.value
                        )
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Sharing..."
                        : "Share Credential"}
                </button>

                <button
                    type="button"
                    onClick={onClose}
                >
                    Cancel
                </button>

            </form>

        </div>
    );
}

export default ShareCredential;