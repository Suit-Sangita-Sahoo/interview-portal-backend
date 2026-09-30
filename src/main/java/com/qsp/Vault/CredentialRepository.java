package com.qsp.Vault;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CredentialRepository
        extends JpaRepository<Credential, Long> {

    List<Credential> findByOwner(VaultUser owner);
}