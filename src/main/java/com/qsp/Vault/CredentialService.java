package com.qsp.Vault;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final CredentialShareRepository shareRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;


    // =========================================================
    // ADD CREDENTIAL
    // =========================================================

    public CredentialResponse addCredential(
            String username,
            CredentialRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Credential request is required."
            );
        }

        VaultUser user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );

        Credential credential = new Credential();

        credential.setTitle(request.getTitle());
        credential.setUsername(request.getUsername());

        // Encrypt password
        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            credential.setEncryptedPassword(
                    encryptionService.encrypt(
                            request.getPassword()
                    )
            );
        }

        credential.setWebsite(request.getWebsite());

        // Encrypt notes
        if (request.getNotes() != null
                && !request.getNotes().isBlank()) {

            credential.setEncryptedNotes(
                    encryptionService.encrypt(
                            request.getNotes()
                    )
            );
        }

        credential.setOwner(user);

        Credential saved =
                credentialRepository.save(credential);

        return toResponse(saved);
    }


    // =========================================================
    // GET ALL OWNED CREDENTIALS FOR USER
    // =========================================================

    public List<CredentialResponse> getCredentialsForUser(
            String username) {

        VaultUser user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );

        return credentialRepository
                .findByOwner(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET SHARED CREDENTIALS FOR USER
    // =========================================================

    public List<CredentialResponse> getSharedCredentials(
            String username) {

        VaultUser user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );

        return shareRepository
                .findBySharedUserAndActiveTrue(user)
                .stream()
                .filter(this::isShareCurrentlyActive)
                .map(CredentialShare::getCredential)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // CHECK IF SHARE IS CURRENTLY ACTIVE
    // =========================================================

    private boolean isShareCurrentlyActive(
            CredentialShare share) {

        if (!share.isActive()) {
            return false;
        }

        // No expiry = permanent access
        if (share.getExpiresAt() == null) {
            return true;
        }

        // Share has not expired
        if (share.getExpiresAt()
                .isAfter(LocalDateTime.now())) {

            return true;
        }

        // Share expired -> deactivate it
        share.setActive(false);
        shareRepository.save(share);

        return false;
    }


    // =========================================================
    // GET CREDENTIAL BY ID
    // =========================================================

    public Credential getCredential(Long credentialId) {

        return credentialRepository
                .findById(credentialId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Credential not found."
                        )
                );
    }


    // =========================================================
    // GET ONE CREDENTIAL FOR USER
    // =========================================================

    public CredentialResponse getCredentialForUser(
            Long credentialId,
            String username) {

        Credential credential =
                getCredential(credentialId);

        checkViewAccess(
                credential,
                username
        );

        return toResponse(credential);
    }


    // =========================================================
    // UPDATE CREDENTIAL
    // =========================================================

    public CredentialResponse updateCredential(
            Long credentialId,
            String username,
            CredentialRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Credential request is required."
            );
        }

        Credential credential =
                getCredential(credentialId);

        checkEditAccess(
                credential,
                username
        );

        credential.setTitle(request.getTitle());
        credential.setUsername(request.getUsername());

        // Update encrypted password
        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            credential.setEncryptedPassword(
                    encryptionService.encrypt(
                            request.getPassword()
                    )
            );
        }

        credential.setWebsite(request.getWebsite());

        // Update encrypted notes
        if (request.getNotes() != null
                && !request.getNotes().isBlank()) {

            credential.setEncryptedNotes(
                    encryptionService.encrypt(
                            request.getNotes()
                    )
            );
        }

        Credential updated =
                credentialRepository.save(credential);

        return toResponse(updated);
    }


    // =========================================================
    // DELETE CREDENTIAL
    // =========================================================

    public void deleteCredential(
            Long credentialId,
            String username) {

        Credential credential =
                getCredential(credentialId);

        checkFullManagementAccess(
                credential,
                username
        );

        credentialRepository.delete(credential);
    }


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

        // Only owner can manage sharing
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
                .findByUsername(
                        request.getUsername().trim()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );

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

        // Expiry must be future
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

                            newShare.setCredential(
                                    credential
                            );

                            newShare.setOwner(
                                    credential.getOwner()
                            );

                            newShare.setSharedUser(
                                    target
                            );

                            newShare.setCreatedAt(
                                    LocalDateTime.now()
                            );

                            newShare.setActive(true);

                            return newShare;
                        });

        // Update sharing details
        share.setPermission(
                request.getPermission()
        );

        share.setExpiresAt(
                request.getExpiresAt()
        );

        share.setActive(true);

        // Save
        shareRepository.save(share);
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
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Share not found."
                                )
                        );

        // Only owner can remove sharing
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
                .map(this::toShareResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // CHECK VIEW ACCESS
    // =========================================================

    public void checkViewAccess(
            Credential credential,
            String username) {

        // Owner always has access
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

        // Owner always has edit access
        if (isOwner(credential, username)) {
            return;
        }

        CredentialShare share =
                getActiveShare(
                        credential,
                        username
                );

        if (share == null
                || (share.getPermission()
                        != SharePermission.EDIT
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

        // Owner always has full management
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

    private CredentialShare getActiveShare(
            Credential credential,
            String username) {

        VaultUser user =
                userRepository
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

        // Check expiry
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
    // FORBIDDEN EXCEPTION
    // =========================================================

    private ResponseStatusException forbidden(
            String message) {

        return new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                message
        );
    }


    // =========================================================
    // CONVERT CREDENTIAL TO RESPONSE
    // =========================================================

    private CredentialResponse toResponse(
            Credential credential) {

        String decryptedPassword = null;
        String decryptedNotes = null;

        // Decrypt password
        if (credential.getEncryptedPassword() != null
                && !credential.getEncryptedPassword().isBlank()) {

            decryptedPassword =
                    encryptionService.decrypt(
                            credential.getEncryptedPassword()
                    );
        }

        // Decrypt notes
        if (credential.getEncryptedNotes() != null
                && !credential.getEncryptedNotes().isBlank()) {

            decryptedNotes =
                    encryptionService.decrypt(
                            credential.getEncryptedNotes()
                    );
        }

        return new CredentialResponse(
                credential.getId(),
                credential.getTitle(),
                credential.getUsername(),
                decryptedPassword,
                credential.getWebsite(),
                decryptedNotes,
                credential.getOwner() != null
                        ? credential.getOwner().getUsername()
                        : null,
                credential.getCreatedAt(),
                credential.getUpdatedAt()
        );
    }


    // =========================================================
    // CONVERT SHARE TO RESPONSE
    // =========================================================

    private ShareResponse toShareResponse(
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