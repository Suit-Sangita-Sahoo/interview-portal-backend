package com.qsp.Vault;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamCredentialRepository
        extends JpaRepository<TeamCredential, Long> {

    Optional<TeamCredential> findByTeamAndCredential(
            Team team,
            Credential credential
    );

    List<TeamCredential> findByTeam(
            Team team
    );

    List<TeamCredential> findByCredential(
            Credential credential
    );

    boolean existsByTeamAndCredential(
            Team team,
            Credential credential
    );

    void deleteByTeamAndCredential(
            Team team,
            Credential credential
    );
}