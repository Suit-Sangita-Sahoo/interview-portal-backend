package com.qsp.Vault;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository memberRepository;
    private final TeamCredentialRepository teamCredentialRepository;
    private final UserRepository userRepository;
    private final CredentialRepository credentialRepository;

    // =========================================================
    // CREATE TEAM
    // =========================================================

    public Team createTeam(
            String username,
            CreateTeamRequest request) {

        if (request == null
                || request.getName() == null
                || request.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Team name is required."
            );
        }

        VaultUser owner = getUser(username);

        Team team = new Team();

        team.setName(request.getName().trim());
        team.setOwner(owner);
        team.setCreatedAt(LocalDateTime.now());
        team.setActive(true);

        team = teamRepository.save(team);

        // Automatically make creator an ADMIN
        TeamMember ownerMember = new TeamMember();

        ownerMember.setTeam(team);
        ownerMember.setUser(owner);
        ownerMember.setRole(TeamRole.ADMIN);
        ownerMember.setJoinedAt(LocalDateTime.now());
        ownerMember.setActive(true);

        memberRepository.save(ownerMember);

        return team;
    }

    // =========================================================
    // GET TEAMS FOR CURRENT USER
    // =========================================================

    public List<Team> getTeamsForUser(String username) {

        VaultUser user = getUser(username);

        List<Team> ownedTeams =
                teamRepository.findByOwner(user);

        List<Team> memberTeams =
                memberRepository
                        .findByUser(user)
                        .stream()
                        .filter(TeamMember::isActive)
                        .map(TeamMember::getTeam)
                        .filter(Team::isActive)
                        .toList();

        return Stream
                .concat(
                        ownedTeams.stream(),
                        memberTeams.stream()
                )
                .filter(Team::isActive)
                .distinct()
                .toList();
    }

    // =========================================================
    // ADD TEAM MEMBER
    // =========================================================

    public void addMember(
            Long teamId,
            String requester,
            AddTeamMemberRequest request) {

        if (request == null
                || request.getUsername() == null
                || request.getUsername().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required."
            );
        }

        Team team = getTeam(teamId);

        checkTeamManager(team, requester);

        VaultUser user =
                getUser(request.getUsername().trim());

        // Owner is already a member
        if (user.getId().equals(team.getOwner().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Owner is already a team member."
            );
        }

        TeamMember member =
                memberRepository
                        .findByTeamAndUser(team, user)
                        .orElseGet(() -> {

                            TeamMember newMember =
                                    new TeamMember();

                            newMember.setTeam(team);
                            newMember.setUser(user);
                            newMember.setJoinedAt(
                                    LocalDateTime.now()
                            );

                            return newMember;
                        });

        TeamRole role = request.getRole();

        if (role == null) {
            role = TeamRole.MEMBER;
        }

        member.setRole(role);
        member.setActive(true);

        memberRepository.save(member);
    }

    // =========================================================
    // GET TEAM MEMBERS
    // =========================================================

    public List<TeamMember> getTeamMembers(
            Long teamId,
            String username) {

        Team team = getTeam(teamId);

        checkTeamViewAccess(team, username);

        return memberRepository
                .findByTeam(team)
                .stream()
                .filter(TeamMember::isActive)
                .toList();
    }

    // =========================================================
    // REMOVE TEAM MEMBER
    // =========================================================

    public void removeMember(
            Long teamId,
            Long userId,
            String requester) {

        Team team = getTeam(teamId);

        checkTeamManager(team, requester);

        VaultUser user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "User not found."
                                )
                        );

        if (user.getId().equals(team.getOwner().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Team owner cannot be removed."
            );
        }

        TeamMember member =
                memberRepository
                        .findByTeamAndUser(team, user)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Member not found."
                                )
                        );

        member.setActive(false);

        memberRepository.save(member);
    }

    // =========================================================
    // ADD CREDENTIAL TO TEAM
    // =========================================================

    public void addCredentialToTeam(
            Long teamId,
            Long credentialId,
            String username) {

        Team team = getTeam(teamId);

        checkTeamManager(team, username);

        Credential credential =
                credentialRepository.findById(credentialId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Credential not found."
                                )
                        );

        // Only credential owner can add it to a team
        if (!credential.getOwner()
                .getUsername()
                .equals(username)) {

            throw forbidden(
                    "Only the credential owner can add this credential to a team."
            );
        }

        TeamCredential existing =
                teamCredentialRepository
                        .findByTeamAndCredential(
                                team,
                                credential
                        )
                        .orElse(null);

        if (existing != null) {

            existing.setActive(true);

            teamCredentialRepository.save(existing);

            return;
        }

        TeamCredential teamCredential =
                new TeamCredential();

        teamCredential.setTeam(team);
        teamCredential.setCredential(credential);

        // Default permission
        teamCredential.setPermission(
                SharePermission.VIEW
        );

        teamCredential.setAddedAt(
                LocalDateTime.now()
        );

        teamCredential.setActive(true);

        teamCredentialRepository.save(teamCredential);
    }

    // =========================================================
    // REMOVE CREDENTIAL FROM TEAM
    // =========================================================

    public void removeCredentialFromTeam(
            Long teamId,
            Long credentialId,
            String username) {

        Team team = getTeam(teamId);

        checkTeamManager(team, username);

        Credential credential =
                credentialRepository.findById(credentialId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Credential not found."
                                )
                        );

        TeamCredential teamCredential =
                teamCredentialRepository
                        .findByTeamAndCredential(
                                team,
                                credential
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Credential is not in this team."
                                )
                        );

        teamCredential.setActive(false);

        teamCredentialRepository.save(teamCredential);
    }

    // =========================================================
    // GET TEAM CREDENTIALS
    // =========================================================

    public List<Credential> getTeamCredentials(
            Long teamId,
            String username) {

        Team team = getTeam(teamId);

        checkTeamViewAccess(team, username);

        return teamCredentialRepository
                .findByTeam(team)
                .stream()
                .filter(TeamCredential::isActive)
                .filter(tc ->
                        hasCredentialViewAccess(
                                tc,
                                username
                        )
                )
                .map(TeamCredential::getCredential)
                .toList();
    }

    // =========================================================
    // GET TEAM MEMBER
    // =========================================================

    public TeamMember getMember(
            Team team,
            String username) {

        VaultUser user =
                userRepository
                        .findByUsername(username)
                        .orElse(null);

        if (user == null) {
            return null;
        }

        return memberRepository
                .findByTeamAndUser(team, user)
                .filter(TeamMember::isActive)
                .orElse(null);
    }

    // =========================================================
    // CHECK TEAM VIEW ACCESS
    // =========================================================

    public void checkTeamViewAccess(
            Team team,
            String username) {

        if (isTeamOwner(team, username)) {
            return;
        }

        TeamMember member =
                getMember(team, username);

        if (member == null) {
            throw forbidden(
                    "Team access denied."
            );
        }
    }

    // =========================================================
    // CHECK TEAM EDIT ACCESS
    // =========================================================

    public void checkTeamEditAccess(
            Team team,
            String username) {

        if (isTeamOwner(team, username)) {
            return;
        }

        TeamMember member =
                getMember(team, username);

        if (member == null
                || member.getRole() != TeamRole.ADMIN) {

            throw forbidden(
                    "Team edit access denied."
            );
        }
    }

    // =========================================================
    // CHECK TEAM MANAGEMENT ACCESS
    // =========================================================

    public void checkTeamManagementAccess(
            Team team,
            String username) {

        if (!isTeamOwner(team, username)) {

            throw forbidden(
                    "Only the team owner can perform this operation."
            );
        }
    }

    // =========================================================
    // CHECK TEAM MANAGER
    // Owner OR ADMIN
    // =========================================================

    private void checkTeamManager(
            Team team,
            String username) {

        if (isTeamOwner(team, username)) {
            return;
        }

        TeamMember member =
                getMember(team, username);

        if (member == null
                || member.getRole() != TeamRole.ADMIN) {

            throw forbidden(
                    "Team management permission required."
            );
        }
    }

    // =========================================================
    // CHECK TEAM CREDENTIAL VIEW ACCESS
    // =========================================================

    private boolean hasCredentialViewAccess(
            TeamCredential teamCredential,
            String username) {

        Credential credential =
                teamCredential.getCredential();

        // Credential owner can always view
        if (credential.getOwner()
                .getUsername()
                .equals(username)) {

            return true;
        }

        TeamMember member =
                getMember(
                        teamCredential.getTeam(),
                        username
                );

        if (member == null) {
            return false;
        }

        SharePermission permission =
                teamCredential.getPermission();

        return permission == SharePermission.VIEW
                || permission == SharePermission.EDIT
                || permission == SharePermission.FULL_MANAGEMENT;
    }

    // =========================================================
    // CHECK TEAM CREDENTIAL EDIT ACCESS
    // =========================================================

    public void checkTeamCredentialEditAccess(
            Team team,
            Credential credential,
            String username) {

        // Owner always has access
        if (credential.getOwner()
                .getUsername()
                .equals(username)) {

            return;
        }

        TeamMember member =
                getMember(team, username);

        if (member == null) {

            throw forbidden(
                    "You are not an active member of this team."
            );
        }

        TeamCredential teamCredential =
                teamCredentialRepository
                        .findByTeamAndCredential(
                                team,
                                credential
                        )
                        .orElseThrow(() ->
                                forbidden(
                                        "Credential is not available in this team."
                                )
                        );

        if (!teamCredential.isActive()) {

            throw forbidden(
                    "Credential access has been removed."
            );
        }

        SharePermission permission =
                teamCredential.getPermission();

        if (permission != SharePermission.EDIT
                && permission != SharePermission.FULL_MANAGEMENT) {

            throw forbidden(
                    "Edit permission required."
            );
        }
    }

    // =========================================================
    // CHECK FULL MANAGEMENT ACCESS
    // =========================================================

    public void checkTeamCredentialManagementAccess(
            Team team,
            Credential credential,
            String username) {

        // Credential owner
        if (credential.getOwner()
                .getUsername()
                .equals(username)) {

            return;
        }

        // Team owner
        if (isTeamOwner(team, username)) {
            return;
        }

        TeamMember member =
                getMember(team, username);

        if (member == null) {

            throw forbidden(
                    "Team access denied."
            );
        }

        TeamCredential teamCredential =
                teamCredentialRepository
                        .findByTeamAndCredential(
                                team,
                                credential
                        )
                        .orElseThrow(() ->
                                forbidden(
                                        "Credential is not available in this team."
                                )
                        );

        if (!teamCredential.isActive()) {

            throw forbidden(
                    "Credential access has been removed."
            );
        }

        if (teamCredential.getPermission()
                != SharePermission.FULL_MANAGEMENT) {

            throw forbidden(
                    "Full management permission required."
            );
        }
    }

    // =========================================================
    // UPDATE CREDENTIAL PERMISSION
    // =========================================================

    public void updateCredentialPermission(
            Long teamId,
            Long credentialId,
            SharePermission permission,
            String username) {

        if (permission == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Permission is required."
            );
        }

        Team team = getTeam(teamId);

        checkTeamManager(team, username);

        Credential credential =
                credentialRepository.findById(credentialId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Credential not found."
                                )
                        );

        TeamCredential teamCredential =
                teamCredentialRepository
                        .findByTeamAndCredential(
                                team,
                                credential
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Credential is not in this team."
                                )
                        );

        teamCredential.setPermission(permission);
        teamCredential.setActive(true);

        teamCredentialRepository.save(teamCredential);
    }

    // =========================================================
    // GET TEAM
    // =========================================================

    public Team getTeam(Long teamId) {

        return teamRepository
                .findById(teamId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Team not found."
                        )
                );
    }

    // =========================================================
    // CHECK TEAM OWNER
    // =========================================================

    private boolean isTeamOwner(
            Team team,
            String username) {

        return team.getOwner() != null
                && team.getOwner()
                        .getUsername()
                        .equals(username);
    }

    // =========================================================
    // GET USER
    // =========================================================

    private VaultUser getUser(String username) {

        if (username == null
                || username.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required."
            );
        }

        return userRepository
                .findByUsername(username.trim())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );
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
}