package com.qsp.Vault;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";

    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;
    private static final int KEY_LENGTH = 32;

    private final SecretKeySpec secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionService(
            @Value("${vault.encryption.key}") String key) {

        byte[] keyBytes =
                key.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length != KEY_LENGTH) {
            throw new IllegalArgumentException(
                    "vault.encryption.key must contain exactly 32 bytes."
            );
        }

        this.secretKey =
                new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plainText) {

        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher =
                    Cipher.getInstance(ALGORITHM);

            GCMParameterSpec spec =
                    new GCMParameterSpec(TAG_LENGTH, iv);

            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    secretKey,
                    spec
            );

            byte[] encrypted =
                    cipher.doFinal(
                            plainText.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            ByteBuffer buffer =
                    ByteBuffer.allocate(
                            IV_LENGTH + encrypted.length
                    );

            buffer.put(iv);
            buffer.put(encrypted);

            return Base64.getEncoder()
                    .encodeToString(buffer.array());

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to encrypt data.",
                    e
            );
        }
    }

    public String decrypt(String encryptedText) {

        if (encryptedText == null
                || encryptedText.isEmpty()) {

            return encryptedText;
        }

        try {
            byte[] decoded =
                    Base64.getDecoder()
                            .decode(encryptedText);

            ByteBuffer buffer =
                    ByteBuffer.wrap(decoded);

            byte[] iv =
                    new byte[IV_LENGTH];

            buffer.get(iv);

            byte[] encrypted =
                    new byte[buffer.remaining()];

            buffer.get(encrypted);

            Cipher cipher =
                    Cipher.getInstance(ALGORITHM);

            GCMParameterSpec spec =
                    new GCMParameterSpec(
                            TAG_LENGTH,
                            iv
                    );

            cipher.init(
                    Cipher.DECRYPT_MODE,
                    secretKey,
                    spec
            );

            byte[] decrypted =
                    cipher.doFinal(encrypted);

            return new String(
                    decrypted,
                    StandardCharsets.UTF_8
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to decrypt data. Check the encryption key.",
                    e
            );
        }
    }
}