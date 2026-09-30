package com.qsp.Vault;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CredentialShareService {

    private final CredentialShareRepository shareRepository;
    private final UserRepository userRepository;


    // =========================================================
    // SHARE CREDENTIAL
    // =========================================================

    public void shareCredential(
            Credential credential,
            String ownerUsername,
            ShareCredentialRequest request) {

        if (credential == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Credential not found."
            );
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Share request is required."
            );
        }

        // Only credential owner can share
        if (!credential.getOwner()
                .getUsername()
                .equals(ownerUsername)) {

            throw forbidden(
                    "Only the credential owner can manage sharing."
            );
        }

        // Validate username
        if (request.getUsername() == null
                || request.getUsername().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required."
            );
        }

        // Find target user
        VaultUser target = userRepository
                .findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found."
                ));

        // Owner cannot share with himself
        if (target.getId()
                .equals(credential.getOwner().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Credential cannot be shared with owner."
            );
        }

        // Permission required
        if (request.getPermission() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Permission is required."
            );
        }

        // Expiry must be in future
        if (request.getExpiresAt() != null
                && !request.getExpiresAt()
                        .isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Expiry time must be in the future."
            );
        }

        // Find existing active share
        CredentialShare share =
                shareRepository
                        .findByCredentialAndSharedUserAndActiveTrue(
                                credential,
                                target
                        )
                        .orElseGet(() -> {

                            CredentialShare newShare =
                                    new CredentialShare();

                            newShare.setCredential(credential);

                            newShare.setOwner(
                                    credential.getOwner()
                            );

                            newShare.setSharedUser(target);

                            newShare.setCreatedAt(
                                    LocalDateTime.now()
                            );

                            newShare.setActive(true);

                            return newShare;
                        });

        // Update permission
        share.setPermission(
                request.getPermission()
        );

        // Update expiry
        share.setExpiresAt(
                request.getExpiresAt()
        );

        share.setActive(true);

        shareRepository.save(share);
    }


    // =========================================================
    // GET SHARES
    // =========================================================

    public List<ShareResponse> getShares(
            Credential credential,
            String ownerUsername) {

        if (!credential.getOwner()
                .getUsername()
                .equals(ownerUsername)) {

            throw forbidden(
                    "Only the owner can view sharing."
            );
        }

        return shareRepository
                .findByCredentialAndActiveTrue(credential)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // REMOVE SHARE
    // =========================================================

    public void removeShare(
            Long shareId,
            String ownerUsername) {

        CredentialShare share =
                shareRepository
                        .findById(shareId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Share not found."
                        ));

        if (!share.getOwner()
                .getUsername()
                .equals(ownerUsername)) {

            throw forbidden(
                    "Only the owner can remove sharing."
            );
        }

        share.setActive(false);

        shareRepository.save(share);
    }


    // =========================================================
    // CHECK VIEW ACCESS
    // =========================================================

    public void checkViewAccess(
            Credential credential,
            String username) {

        if (isOwner(credential, username)) {
            return;
        }

        CredentialShare share =
                getActiveShare(
                        credential,
                        username
                );

        if (share == null) {

            throw forbidden(
                    "You do not have access to this credential."
            );
        }
    }


    // =========================================================
    // CHECK EDIT ACCESS
    // =========================================================

    public void checkEditAccess(
            Credential credential,
            String username) {

        if (isOwner(credential, username)) {
            return;
        }

        CredentialShare share =
                getActiveShare(
                        credential,
                        username
                );

        if (share == null
                || (share.getPermission() != SharePermission.EDIT
                && share.getPermission()
                        != SharePermission.FULL_MANAGEMENT)) {

            throw forbidden(
                    "Edit permission required."
            );
        }
    }


    // =========================================================
    // CHECK FULL MANAGEMENT ACCESS
    // =========================================================

    public void checkFullManagementAccess(
            Credential credential,
            String username) {

        if (isOwner(credential, username)) {
            return;
        }

        CredentialShare share =
                getActiveShare(
                        credential,
                        username
                );

        if (share == null
                || share.getPermission()
                        != SharePermission.FULL_MANAGEMENT) {

            throw forbidden(
                    "Full management permission required."
            );
        }
    }


    // =========================================================
    // GET ACTIVE SHARE
    // =========================================================

    public CredentialShare getActiveShare(
            Credential credential,
            String username) {

        VaultUser user = userRepository
                .findByUsername(username)
                .orElse(null);

        if (user == null) {
            return null;
        }

        CredentialShare share =
                shareRepository
                        .findByCredentialAndSharedUserAndActiveTrue(
                                credential,
                                user
                        )
                        .orElse(null);

        if (share == null) {
            return null;
        }

        // Automatically deactivate expired access
        if (share.getExpiresAt() != null
                && !share.getExpiresAt()
                        .isAfter(LocalDateTime.now())) {

            share.setActive(false);
            shareRepository.save(share);

            return null;
        }

        return share;
    }


    // =========================================================
    // CHECK OWNER
    // =========================================================

    private boolean isOwner(
            Credential credential,
            String username) {

        return credential.getOwner()
                .getUsername()
                .equals(username);
    }


    // =========================================================
    // FORBIDDEN
    // =========================================================

    private ResponseStatusException forbidden(
            String message) {

        return new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                message
        );
    }


    // =========================================================
    // CONVERT TO RESPONSE
    // =========================================================

    private ShareResponse toResponse(
            CredentialShare share) {

        return new ShareResponse(
                share.getId(),
                share.getCredential().getId(),
                share.getSharedUser().getUsername(),
                share.getPermission(),
                share.getExpiresAt(),
                share.isActive()
        );
    }
}