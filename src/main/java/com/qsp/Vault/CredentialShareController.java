package com.qsp.Vault;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vault/shares")
@RequiredArgsConstructor
public class CredentialShareController {

    private final CredentialService credentialService;

    @PostMapping("/{credentialId}")
    public ResponseEntity<?> shareCredential(
            @PathVariable Long credentialId,
            @RequestBody ShareCredentialRequest request,
            Authentication authentication) {

        Credential credential =
                credentialService.getCredential(credentialId);

        credentialService.shareCredential(
                credential,
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                "Credential shared successfully"
        );
    }

    @GetMapping("/{credentialId}")
    public ResponseEntity<List<ShareResponse>> getShares(
            @PathVariable Long credentialId,
            Authentication authentication) {

        Credential credential =
                credentialService.getCredential(credentialId);

        return ResponseEntity.ok(
                credentialService.getShares(
                        credential,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{shareId}")
    public ResponseEntity<?> removeShare(
            @PathVariable Long shareId,
            Authentication authentication) {

        credentialService.removeShare(
                shareId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                "Access removed successfully"
        );
    }
}