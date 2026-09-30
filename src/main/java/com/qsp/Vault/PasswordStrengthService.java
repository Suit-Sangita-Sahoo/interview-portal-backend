package com.qsp.Vault;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PasswordStrengthService {

    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9]");

    private static final String[] LABELS = {"Very Weak", "Weak", "Medium", "Strong", "Very Strong"};

    public PasswordStrengthResult analyze(String password) {
        List<String> suggestions = new ArrayList<>();

        if (password == null || password.isEmpty()) {
            return PasswordStrengthResult.builder()
                    .score(0)
                    .label(LABELS[0])
                    .suggestions(List.of("Enter a password to see its strength"))
                    .build();
        }

        int length = password.length();
        boolean hasUpper = UPPER.matcher(password).find();
        boolean hasLower = LOWER.matcher(password).find();
        boolean hasDigit = DIGIT.matcher(password).find();
        boolean hasSpecial = SPECIAL.matcher(password).find();

        int varietyCount = (hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);

        // Length contributes 0-2 points, character variety contributes 0-2 points.
        int lengthScore;
        if (length < 8) {
            lengthScore = 0;
            suggestions.add("Use at least 8 characters (12+ is better)");
        } else if (length < 12) {
            lengthScore = 1;
            suggestions.add("Consider using 12 or more characters for extra strength");
        } else {
            lengthScore = 2;
        }

        int varietyScore = switch (varietyCount) {
            case 0, 1 -> 0;
            case 2 -> 1;
            case 3 -> 1;
            default -> 2; // all 4 types present
        };

        if (!hasUpper) suggestions.add("Add an uppercase letter");
        if (!hasLower) suggestions.add("Add a lowercase letter");
        if (!hasDigit) suggestions.add("Add a number");
        if (!hasSpecial) suggestions.add("Add a special character (e.g. !, @, #, %)");

        int score = Math.min(lengthScore + varietyScore, 4);

        if (score >= 3 && suggestions.isEmpty()) {
            suggestions.add("Good password -- no changes needed");
        }

        return PasswordStrengthResult.builder()
                .score(score)
                .label(LABELS[score])
                .suggestions(suggestions)
                .build();
    }
}
