package com.qsp.Vault;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final LoginMonitoringService loginMonitoringService;


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        // =====================================================
        // VALIDATE USERNAME
        // =====================================================

        if (request.getUsername() == null
                || request.getUsername().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Username is required");
        }


        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }


        // =====================================================
        // VALIDATE PASSWORD
        // =====================================================

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Password is required");
        }


        // =====================================================
        // CHECK EMAIL
        // =====================================================

        if (userRepository.existsByEmail(
                request.getEmail().trim())) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }


        // =====================================================
        // CHECK USERNAME
        // =====================================================

        if (userRepository.findByUsername(
                request.getUsername().trim()).isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body("Username already exists");
        }


        // =====================================================
        // CREATE USER
        // =====================================================

        VaultUser user = new VaultUser();

        user.setUsername(
                request.getUsername().trim()
        );

        user.setEmail(
                request.getEmail().trim()
        );


        // =====================================================
        // ENCRYPT PASSWORD
        // =====================================================

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        // =====================================================
        // SAVE USER
        // =====================================================

        userRepository.save(user);


        return ResponseEntity
                .ok("Registration successful");
    }



    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        // =====================================================
        // GET USERNAME SAFELY
        // =====================================================

        String username =
                request.getUsername() == null
                        ? ""
                        : request.getUsername().trim();


        // =====================================================
        // VALIDATE USERNAME
        // =====================================================

        if (username.isBlank()) {

            // Record failed login attempt
            loginMonitoringService.recordFailedLogin(
                    username,
                    httpRequest
            );

            return ResponseEntity
                    .badRequest()
                    .body("Username is required");
        }


        // =====================================================
        // VALIDATE PASSWORD
        // =====================================================

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            // Record failed login attempt
            loginMonitoringService.recordFailedLogin(
                    username,
                    httpRequest
            );

            return ResponseEntity
                    .badRequest()
                    .body("Password is required");
        }


        // =====================================================
        // FIND USER
        // =====================================================

        Optional<VaultUser> optionalUser =
                userRepository.findByUsername(username);


        // =====================================================
        // USER NOT FOUND
        // =====================================================

        if (optionalUser.isEmpty()) {

            System.out.println(
                    "LOGIN FAILED: USER NOT FOUND - "
                    + username
            );


            // Record failed login attempt
            loginMonitoringService.recordFailedLogin(
                    username,
                    httpRequest
            );


            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }


        VaultUser user = optionalUser.get();


        // =====================================================
        // CHECK PASSWORD
        // =====================================================

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );


        System.out.println(
                "LOGIN USERNAME: "
                + user.getUsername()
        );

        System.out.println(
                "PASSWORD MATCHES: "
                + passwordMatches
        );


        // =====================================================
        // PASSWORD DOES NOT MATCH
        // =====================================================

        if (!passwordMatches) {

            System.out.println(
                    "LOGIN FAILED: PASSWORD DOES NOT MATCH"
            );


            // Record failed login attempt
            loginMonitoringService.recordFailedLogin(
                    username,
                    httpRequest
            );


            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }


        // =====================================================
        // GENERATE JWT
        // =====================================================

        String token =
                jwtService.generateToken(
                        user.getUsername()
                );


        // =====================================================
        // RECORD SUCCESSFUL LOGIN
        // =====================================================

        loginMonitoringService.recordSuccessfulLogin(
                user.getUsername(),
                httpRequest
        );


        // =====================================================
        // DEBUG
        // =====================================================

        System.out.println(
                "LOGIN SUCCESSFUL FOR: "
                + user.getUsername()
        );

        System.out.println(
                "JWT PARTS: "
                + token.split("\\.").length
        );


        // =====================================================
        // RETURN RESPONSE
        // =====================================================

        return ResponseEntity.ok(
                new LoginResponse(
                        "Login successful",
                        token,
                        user.getUsername()
                )
        );
    }
}