package com.qsp.Vault;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class LoginHistoryController {

    private final LoginMonitoringService loginMonitoringService;


    // =========================================================
    // GET CURRENT USER LOGIN HISTORY
    // =========================================================

    @GetMapping("/login-history")
    public ResponseEntity<
            List<LoginSecurityEventResponse>
            > getLoginHistory(
                    Authentication authentication) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                loginMonitoringService
                        .getLoginHistory(username)
        );
    }
}