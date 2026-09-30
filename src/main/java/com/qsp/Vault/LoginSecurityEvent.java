package com.qsp.Vault;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "login_security_events")
@Getter
@Setter
@NoArgsConstructor
public class LoginSecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * User who performed the login attempt.
     *
     * This can be null when somebody tries to log in
     * with a username that does not exist.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private VaultUser user;

    /*
     * Username entered during login.
     *
     * This allows us to record failed attempts even
     * when the username does not exist.
     */
    @Column(nullable = false, length = 100)
    private String attemptedUsername;

    /*
     * SUCCESS or FAILURE
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoginSecurityEventStatus status;

    /*
     * Time of login attempt.
     */
    @Column(nullable = false)
    private LocalDateTime occurredAt;

    /*
     * IP address of the request.
     */
    @Column(length = 100)
    private String ipAddress;

    /*
     * Browser/device information.
     */
    @Column(length = 1000)
    private String userAgent;

    @PrePersist
    protected void onCreate() {

        if (occurredAt == null) {
            occurredAt = LocalDateTime.now();
        }
    }
}