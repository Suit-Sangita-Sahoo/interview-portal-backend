package com.qsp.Vault;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginSecurityEventResponse {

    private Long id;

    private String username;

    private LocalDateTime loginDateTime;

    private LoginSecurityEventStatus status;

    private String ipAddress;

    private String userAgent;
}