package com.qsp.Vault;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CredentialResponse {

    private Long id;

    private String title;

    private String username;

    private String password;

    private String website;

    private String notes;

    private String ownerUsername;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}