package com.qsp.Vault;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginMonitoringService {

    private final LoginEventRepository eventRepository;

    private final UserRepository userRepository;


    // =========================================================
    // RECORD SUCCESSFUL LOGIN
    // =========================================================

    public void recordSuccessfulLogin(
            String username,
            HttpServletRequest request) {

        VaultUser user = userRepository
                .findByUsername(username)
                .orElse(null);


        LoginSecurityEvent event =
                new LoginSecurityEvent();


        // User who successfully logged in
        event.setUser(user);


        // Username used during login
        event.setAttemptedUsername(username);


        // Login status
        event.setStatus(
                LoginSecurityEventStatus.SUCCESS
        );


        // IP address
        event.setIpAddress(
                getClientIpAddress(request)
        );


        // Browser / device information
        event.setUserAgent(
                getUserAgent(request)
        );


        // Save event in database
        eventRepository.save(event);
    }


    // =========================================================
    // RECORD FAILED LOGIN
    // =========================================================

    public void recordFailedLogin(
            String attemptedUsername,
            HttpServletRequest request) {

        String username =
                attemptedUsername == null
                        ? ""
                        : attemptedUsername.trim();


        VaultUser user = null;


        // =====================================================
        // TRY TO FIND USER
        // =====================================================

        if (!username.isBlank()) {

            user = userRepository
                    .findByUsername(username)
                    .orElse(null);
        }


        // =====================================================
        // CREATE SECURITY EVENT
        // =====================================================

        LoginSecurityEvent event =
                new LoginSecurityEvent();


        // If the username exists, associate the event
        // with that user.
        //
        // If the username does not exist,
        // user will remain null.
        event.setUser(user);


        // Store attempted username
        event.setAttemptedUsername(
                username.isBlank()
                        ? "UNKNOWN"
                        : username
        );


        // Login status
        event.setStatus(
                LoginSecurityEventStatus.FAILURE
        );


        // IP address
        event.setIpAddress(
                getClientIpAddress(request)
        );


        // Browser / device information
        event.setUserAgent(
                getUserAgent(request)
        );


        // Save event
        eventRepository.save(event);
    }


    // =========================================================
    // GET LOGIN HISTORY FOR CURRENT USER
    // =========================================================

    public List<LoginSecurityEventResponse>
    getLoginHistory(String username) {

        VaultUser user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "User not found."
                                )
                        );


        return eventRepository
                .findByUserOrderByOccurredAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET CLIENT IP ADDRESS
    // =========================================================

    private String getClientIpAddress(
            HttpServletRequest request) {

        if (request == null) {
            return "UNKNOWN";
        }


        String ipAddress =
                request.getRemoteAddr();


        if (ipAddress == null
                || ipAddress.isBlank()) {

            return "UNKNOWN";
        }


        return ipAddress;
    }


    // =========================================================
    // GET USER AGENT
    // =========================================================

    private String getUserAgent(
            HttpServletRequest request) {

        if (request == null) {
            return "UNKNOWN";
        }


        String userAgent =
                request.getHeader("User-Agent");


        if (userAgent == null
                || userAgent.isBlank()) {

            return "UNKNOWN";
        }


        return userAgent;
    }


    // =========================================================
    // CONVERT ENTITY TO RESPONSE DTO
    // =========================================================

    private LoginSecurityEventResponse toResponse(
            LoginSecurityEvent event) {

        return new LoginSecurityEventResponse(
                event.getId(),
                event.getAttemptedUsername(),
                event.getOccurredAt(),
                event.getStatus(),
                event.getIpAddress(),
                event.getUserAgent()
        );
    }
}