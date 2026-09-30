package com.qsp.Vault;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vault/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;


    // =========================================================
    // CREATE TEAM
    // =========================================================

    @PostMapping
    public ResponseEntity<Team> createTeam(
            @RequestBody CreateTeamRequest request,
            Authentication authentication) {

        Team team = teamService.createTeam(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(team);
    }


    // =========================================================
    // GET MY TEAMS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getTeams(
            Authentication authentication) {

        return ResponseEntity.ok(
                teamService.getTeamsForUser(
                        authentication.getName()
                )
        );
    }


    // =========================================================
    // GET TEAM MEMBERS
    // =========================================================

    @GetMapping("/{teamId}/members")
    public ResponseEntity<?> getMembers(
            @PathVariable Long teamId,
            Authentication authentication) {

        List<TeamMember> members =
                teamService.getTeamMembers(
                        teamId,
                        authentication.getName()
                );

        List<Map<String, Object>> response =
                members.stream()
                        .map(member -> {

                            Map<String, Object> user =
                                    new HashMap<>();

                            if (member.getUser() != null) {

                                user.put(
                                        "id",
                                        member.getUser().getId()
                                );

                                user.put(
                                        "username",
                                        member.getUser().getUsername()
                                );

                                user.put(
                                        "email",
                                        member.getUser().getEmail()
                                );
                            }

                            Map<String, Object> result =
                                    new HashMap<>();

                            result.put(
                                    "id",
                                    member.getId()
                            );

                            result.put(
                                    "role",
                                    member.getRole()
                            );

                            result.put(
                                    "active",
                                    member.isActive()
                            );

                            result.put(
                                    "joinedAt",
                                    member.getJoinedAt()
                            );

                            result.put(
                                    "user",
                                    user
                            );

                            return result;
                        })
                        .toList();

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // ADD MEMBER
    // =========================================================

    @PostMapping("/{teamId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable Long teamId,
            @RequestBody AddTeamMemberRequest request,
            Authentication authentication) {

        teamService.addMember(
                teamId,
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                "Member added successfully."
        );
    }


    // =========================================================
    // REMOVE MEMBER
    // =========================================================

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            Authentication authentication) {

        teamService.removeMember(
                teamId,
                userId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                "Member removed successfully."
        );
    }


    // =========================================================
    // GET TEAM CREDENTIALS
    // =========================================================

    @GetMapping("/{teamId}/credentials")
    public ResponseEntity<?> getTeamCredentials(
            @PathVariable Long teamId,
            Authentication authentication) {

        List<Credential> credentials =
                teamService.getTeamCredentials(
                        teamId,
                        authentication.getName()
                );

        List<Map<String, Object>> response =
                credentials.stream()
                        .map(credential -> {

                            Map<String, Object> result =
                                    new HashMap<>();

                            result.put(
                                    "id",
                                    credential.getId()
                            );

                            result.put(
                                    "title",
                                    credential.getTitle()
                            );

                            result.put(
                                    "username",
                                    credential.getUsername()
                            );

                            result.put(
                                    "website",
                                    credential.getWebsite()
                            );

                            result.put(
                                    "owner",
                                    credential.getOwner()
                                            .getUsername()
                            );

                            result.put(
                                    "createdAt",
                                    credential.getCreatedAt()
                            );

                            result.put(
                                    "updatedAt",
                                    credential.getUpdatedAt()
                            );

                            return result;
                        })
                        .toList();

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // ADD CREDENTIAL TO TEAM
    // =========================================================

    @PostMapping(
            "/{teamId}/credentials/{credentialId}"
    )
    public ResponseEntity<?> addCredential(
            @PathVariable Long teamId,
            @PathVariable Long credentialId,
            Authentication authentication) {

        teamService.addCredentialToTeam(
                teamId,
                credentialId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                "Credential added to team vault."
        );
    }


    // =========================================================
    // REMOVE CREDENTIAL FROM TEAM
    // =========================================================

    @DeleteMapping(
            "/{teamId}/credentials/{credentialId}"
    )
    public ResponseEntity<?> removeCredential(
            @PathVariable Long teamId,
            @PathVariable Long credentialId,
            Authentication authentication) {

        teamService.removeCredentialFromTeam(
                teamId,
                credentialId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                "Credential removed from team vault."
        );
    }


    // =========================================================
    // UPDATE CREDENTIAL PERMISSION
    // =========================================================

    @PutMapping(
            "/{teamId}/credentials/{credentialId}/permission"
    )
    public ResponseEntity<?> updateCredentialPermission(
            @PathVariable Long teamId,
            @PathVariable Long credentialId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String permissionValue =
                request.get("permission");

        if (permissionValue == null
                || permissionValue.isBlank()) {

            return ResponseEntity.badRequest().body(
                    "Permission is required."
            );
        }

        SharePermission permission;

        try {

            permission = SharePermission.valueOf(
                    permissionValue.toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    "Invalid permission. Allowed values: "
                    + "VIEW, EDIT, FULL_MANAGEMENT"
            );
        }

        teamService.updateCredentialPermission(
                teamId,
                credentialId,
                permission,
                authentication.getName()
        );

        return ResponseEntity.ok(
                "Credential permission updated successfully."
        );
    }
}