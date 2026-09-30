package com.qsp.Vault;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShareCredentialRequest {

    private String username;

    private SharePermission permission;

    private LocalDateTime expiresAt;
}