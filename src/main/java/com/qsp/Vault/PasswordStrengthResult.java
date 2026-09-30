package com.qsp.Vault;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class PasswordStrengthResult {
    private int score;          // 0 - 4
    private String label;       // Very Weak, Weak, Medium, Strong, Very Strong
    private List<String> suggestions;
}
