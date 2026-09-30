import React, { useEffect, useState } from "react";
import api from "../api/api";

function PasswordStrength({ password }) {

    const [result, setResult] = useState(null);

    useEffect(() => {

        if (!password) {
            setResult(null);
            return;
        }

        const checkStrength = async () => {

            try {

                const response = await api.post(
                    "/api/vault/password/strength",
                    {
                        password
                    }
                );

                setResult(response.data);

            } catch (error) {

                console.error(
                    "Strength check failed:",
                    error
                );

            }
        };

        checkStrength();

    }, [password]);

    if (!password || !result) {
        return null;
    }

    return (
        <div className="password-strength">

            <p>
                Strength:
                <strong>
                    {" "}{result.strength}
                </strong>
            </p>

            <p>
                Score: {result.score}
            </p>

            {result.suggestions &&
                result.suggestions.length > 0 && (

                <div>

                    <strong>
                        Suggestions:
                    </strong>

                    <ul>
                        {result.suggestions.map(
                            (suggestion, index) => (
                                <li key={index}>
                                    {suggestion}
                                </li>
                            )
                        )}
                    </ul>

                </div>
            )}

        </div>
    );
}

export default PasswordStrength;