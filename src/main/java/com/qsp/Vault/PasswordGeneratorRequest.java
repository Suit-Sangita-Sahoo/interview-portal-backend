package com.qsp.Vault;

import jakarta.validation.Valid;

public class PasswordGeneratorRequest {

    private int length;

    private boolean uppercase;
    private boolean lowercase;
    private boolean numbers;
    private boolean special;

    public int getLength() {
        return length;
    }

    public boolean isUppercase() {
        return uppercase;
    }

    public boolean isLowercase() {
        return lowercase;
    }

    public boolean isNumbers() {
        return numbers;
    }

    public boolean isSpecial() {
        return special;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public void setUppercase(boolean uppercase) {
        this.uppercase = uppercase;
    }

    public void setLowercase(boolean lowercase) {
        this.lowercase = lowercase;
    }

    public void setNumbers(boolean numbers) {
        this.numbers = numbers;
    }

    public void setSpecial(boolean special) {
        this.special = special;
    }

	public String generate(@Valid PasswordGeneratorRequest request) {
		// TODO Auto-generated method stub
		return null;
	}
}