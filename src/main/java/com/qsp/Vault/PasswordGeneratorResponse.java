package com.qsp.Vault;

import java.util.List;

public class PasswordGeneratorResponse {

    private String password;
    private String strength;
    private List<String> suggestions;

    public PasswordGeneratorResponse(
            String password,
            String strength,
            List<String> suggestions) {

        this.password = password;
        this.strength = strength;
        this.suggestions = suggestions;
    }

    public String getPassword() {
        return password;
    }

    public String getStrength() {
        return strength;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }
}