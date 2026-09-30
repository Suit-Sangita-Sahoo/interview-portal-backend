package com.qsp.Vault;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CredentialRequest {

    private String title;

    private String username;

    private String password;

    private String website;

    private String notes;
}