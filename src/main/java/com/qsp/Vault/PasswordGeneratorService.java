package com.qsp.Vault;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PasswordGeneratorService {

    private final SecureRandom random = new SecureRandom();

    private final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private final String NUMBERS = "0123456789";
    private final String SPECIAL = "!@#$%^&*()-_=+";

    public String generate(PasswordGeneratorRequest request) {

        int length = request.getLength();

        if (length < 4 || length > 100) {
            throw new IllegalArgumentException(
                    "Password length must be between 4 and 100"
            );
        }

        StringBuilder availableCharacters = new StringBuilder();

        List<Character> password = new ArrayList<>();

        if (request.isUppercase()) {
            availableCharacters.append(UPPERCASE);
            password.add(randomCharacter(UPPERCASE));
        }

        if (request.isLowercase()) {
            availableCharacters.append(LOWERCASE);
            password.add(randomCharacter(LOWERCASE));
        }

        if (request.isNumbers()) {
            availableCharacters.append(NUMBERS);
            password.add(randomCharacter(NUMBERS));
        }

        if (request.isSpecial()) {
            availableCharacters.append(SPECIAL);
            password.add(randomCharacter(SPECIAL));
        }

        if (availableCharacters.length() == 0) {
            throw new IllegalArgumentException(
                    "Select at least one character type"
            );
        }

        if (password.size() > length) {
            throw new IllegalArgumentException(
                    "Password length is too small for selected rules"
            );
        }

        while (password.size() < length) {
            password.add(
                    randomCharacter(availableCharacters.toString())
            );
        }

        Collections.shuffle(password, random);

        StringBuilder result = new StringBuilder();

        for (Character character : password) {
            result.append(character);	
        }

        return result.toString();
    }

    private char randomCharacter(String characters) {

        return characters.charAt(
                random.nextInt(characters.length())
        );
    }
}