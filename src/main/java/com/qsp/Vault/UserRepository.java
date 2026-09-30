package com.qsp.Vault;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository
        extends JpaRepository<VaultUser, Long> {

    Optional<VaultUser> findByUsername(String username);

    boolean existsByEmail(String email);
}