package com.qsp.Vault;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vault/password")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordGeneratorService
            generatorService;

    private final PasswordStrengthService
            strengthService;

    @PostMapping("/generate")
    public Map<String, Object> generate(
            @Valid
            @RequestBody
            PasswordGeneratorRequest request) {

        String password =
                generatorService.generate(request);

        PasswordStrengthResult strength =
                strengthService.analyze(
                        password
                );

        return Map.of(
                "password",
                password,
                "strength",
                strength
        );
    }

    @PostMapping("/strength")
    public PasswordStrengthResult strength(
            @RequestBody
            Map<String, String> body) {

        return strengthService.analyze(
                body.getOrDefault(
                        "password",
                        ""
                )
        );
    }
}