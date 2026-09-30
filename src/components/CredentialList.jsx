import React, { useState } from "react";

export default function CredentialList({ credentials }) {
  const [revealed, setRevealed] = useState({});

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!credentials || credentials.length === 0) {
    return <p style={{ color: "#777" }}>No credentials saved yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {credentials.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={styles.title}>{c.title}</div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Username</span>
            <span>{c.username}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Password</span>
            <span style={{ fontFamily: "monospace" }}>
              {revealed[c.id] ? c.password : "•".repeat(Math.min(c.password.length, 12))}
            </span>
            <button style={styles.revealBtn} onClick={() => toggleReveal(c.id)}>
              {revealed[c.id] ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "12px 14px",
    background: "#fff",
  },
  title: { fontWeight: 700, marginBottom: 6 },
  row: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 2 },
  rowLabel: { color: "#888", width: 70, flexShrink: 0 },
  revealBtn: {
    marginLeft: "auto",
    background: "none",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 11,
    padding: "2px 8px",
    cursor: "pointer",
  },
};
