package com.qsp.Vault;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vault/credentials")
@RequiredArgsConstructor
public class CredentialController {

    private final CredentialService credentialService;

    // ==============================
    // ADD CREDENTIAL
    // ==============================

    @PostMapping
    public ResponseEntity<CredentialResponse> addCredential(
            @RequestBody CredentialRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        CredentialResponse response =
                credentialService.addCredential(
                        username,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // ==============================
    // GET ALL CREDENTIALS
    // ==============================

    @GetMapping
    public ResponseEntity<List<CredentialResponse>> getCredentials(
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                credentialService.getCredentialsForUser(username)
        );
    }

    // ==============================
    // GET ONE CREDENTIAL
    // ==============================

    @GetMapping("/{id}")
    public ResponseEntity<CredentialResponse> getCredential(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                credentialService.getCredentialForUser(
                        id,
                        username
                )
        );
    }

    // ==============================
    // UPDATE CREDENTIAL
    // ==============================

    @PutMapping("/{id}")
    public ResponseEntity<CredentialResponse> updateCredential(
            @PathVariable Long id,
            @RequestBody CredentialRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                credentialService.updateCredential(
                        id,
                        username,
                        request
                )
        );
    }
    
    @GetMapping("/shared-with-me")
    public ResponseEntity<List<CredentialResponse>> getSharedCredentials(
            Authentication authentication) {

        return ResponseEntity.ok(
                credentialService.getSharedCredentials(
                        authentication.getName()
                )
        );
    }

    // ==============================
    // DELETE CREDENTIAL
    // ==============================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCredential(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();

        credentialService.deleteCredential(
                id,
                username
        );

        return ResponseEntity.ok(
                "Credential deleted successfully"
        );
        
    }
}