package com.qsp.Vault;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShareResponse {

    private Long id;

    private Long credentialId;

    private String sharedUsername;

    private SharePermission permission;

    private LocalDateTime expiresAt;

    private boolean active;
}