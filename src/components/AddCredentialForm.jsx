import React, { useEffect, useState } from "react";
import { addCredential } from "../api/vaultApi";
import { analyzeStrength } from "../api/passwordApi";
import PasswordGenerator from "./PasswordGenerator";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

export default function AddCredentialForm({ onSaved }) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Debounced strength check as the user types their own password.
  useEffect(() => {
    if (!password) {
      setStrength(null);
      return;
    }
    const timeout = setTimeout(() => {
      analyzeStrength(password).then(setStrength).catch(() => {});
    }, 350);
    return () => clearTimeout(timeout);
  }, [password]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!username.trim()) errs.username = "Username is required";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const saved = await addCredential({ title, username, password });
      setTitle("");
      setUsername("");
      setPassword("");
      setStrength(null);
      onSaved && onSaved(saved);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Could not save credential");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ margin: "0 0 14px" }}>Add Credential</h3>

      <div style={styles.field}>
        <label style={styles.fieldLabel}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. GitHub"
          style={styles.input}
        />
        {errors.title && <span style={styles.error}>{errors.title}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.fieldLabel}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. jane@email.com"
          style={styles.input}
        />
        {errors.username && <span style={styles.error}>{errors.username}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.fieldLabel}>Password</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type or generate a password"
          style={styles.input}
        />
        {errors.password && <span style={styles.error}>{errors.password}</span>}
        <PasswordStrengthMeter strength={strength} />
        <button
          type="button"
          onClick={() => setShowGenerator((v) => !v)}
          style={styles.toggleBtn}
        >
          {showGenerator ? "Hide Generator" : "Generate a Password"}
        </button>
      </div>

      {showGenerator && (
        <div style={{ marginBottom: 16 }}>
          <PasswordGenerator
            onUsePassword={(pwd) => {
              setPassword(pwd);
              setShowGenerator(false);
            }}
          />
        </div>
      )}

      {saveError && <div style={styles.error}>{saveError}</div>}

      <button type="submit" style={styles.saveBtn} disabled={saving}>
        {saving ? "Saving..." : "Save Credential"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    padding: 20,
    maxWidth: 420,
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  field: { marginBottom: 14 },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },
  error: { color: "#e53935", fontSize: 12, display: "block", marginTop: 4 },
  toggleBtn: {
    marginTop: 8,
    background: "none",
    border: "none",
    color: "#3f51b5",
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
  },
  saveBtn: {
    width: "100%",
    padding: "10px 12px",
    background: "#3f51b5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};
