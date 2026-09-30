package com.qsp.Vault;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamMemberRepository
        extends JpaRepository<TeamMember, Long> {

    Optional<TeamMember> findByTeamAndUser(
            Team team,
            VaultUser user
    );

    List<TeamMember> findByTeam(
            Team team
    );

    List<TeamMember> findByUser(
            VaultUser user
    );

    boolean existsByTeamAndUser(
            Team team,
            VaultUser user
    );

    void deleteByTeamAndUser(
            Team team,
            VaultUser user
    );
}