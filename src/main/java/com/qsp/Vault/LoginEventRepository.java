package com.qsp.Vault;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginEventRepository
        extends JpaRepository<LoginSecurityEvent, Long> {

    List<LoginSecurityEvent>
    findByUserOrderByOccurredAtDesc(
            VaultUser user
    );
}