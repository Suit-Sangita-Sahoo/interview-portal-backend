package com.qsp.Vault;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CredentialShareRepository
        extends JpaRepository<CredentialShare, Long> {

    Optional<CredentialShare>
    findByCredentialAndSharedUserAndActiveTrue(
            Credential credential,
            VaultUser sharedUser
    );

    List<CredentialShare> findByCredentialAndActiveTrue(
            Credential credential
    );

    List<CredentialShare> findBySharedUserAndActiveTrue(
            VaultUser sharedUser
    );
}