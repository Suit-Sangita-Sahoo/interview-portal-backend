import React, { useState } from "react";

function PasswordGenerator({ onUsePassword }) {

    const [length, setLength] = useState(16);
    const [uppercase, setUppercase] = useState(true);
    const [lowercase, setLowercase] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [special, setSpecial] = useState(true);

    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const generatePassword = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await api.post(
                "/api/vault/password/generate",
                {
                    length,
                    uppercase,
                    lowercase,
                    numbers,
                    special
                }
            );

            setPassword(response.data.password);
            setStrength(response.data.strength);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data ||
                "Unable to generate password."
            );

        } finally {
            setLoading(false);
        }
    };

    const usePassword = () => {

        if (password && onUsePassword) {
            onUsePassword(password);
        }
    };

    return (
        <div className="password-generator">

            <h3>Password Generator</h3>

            <label>
                Length
            </label>

            <input
                type="number"
                min="8"
                max="128"
                value={length}
                onChange={(e) =>
                    setLength(Number(e.target.value))
                }
            />

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={uppercase}
                        onChange={(e) =>
                            setUppercase(e.target.checked)
                        }
                    />
                    Uppercase
                </label>
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={lowercase}
                        onChange={(e) =>
                            setLowercase(e.target.checked)
                        }
                    />
                    Lowercase
                </label>
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={numbers}
                        onChange={(e) =>
                            setNumbers(e.target.checked)
                        }
                    />
                    Numbers
                </label>
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={special}
                        onChange={(e) =>
                            setSpecial(e.target.checked)
                        }
                    />
                    Special Characters
                </label>
            </div>

            <button
                type="button"
                onClick={generatePassword}
                disabled={loading}
            >
                {loading
                    ? "Generating..."
                    : "Generate Password"}
            </button>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            {password && (
                <div>

                    <h4>Generated Password</h4>

                    <input
                        type="text"
                        value={password}
                        readOnly
                    />

                    {strength && (
                        <div>

                            <p>
                                Strength:{" "}
                                <strong>
                                    {strength.strength}
                                </strong>
                            </p>

                            <p>
                                Score:{" "}
                                {strength.score}
                            </p>

                        </div>
                    )}

                    <button
                        type="button"
                        onClick={usePassword}
                    >
                        Use Password
                    </button>

                </div>
            )}

        </div>
    );
}

export default PasswordGenerator;