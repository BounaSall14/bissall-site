"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie_consent")) setVisible(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem("cookie_consent", "accepted"); } catch {}
    setVisible(false);
  };

  const refuse = () => {
    try { localStorage.setItem("cookie_consent", "refused"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
      background: "#1a0d19", color: "#F5EFE6",
      padding: "20px 24px", display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, fontWeight: 300, margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
        Ce site utilise des cookies strictement nécessaires au traitement des paiements (Stripe).{" "}
        <a href="/confidentialite" style={{ color: "var(--violet)", textDecoration: "underline" }}>
          Politique de confidentialité
        </a>
      </p>
      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
        <button
          onClick={refuse}
          style={{ fontFamily: "var(--font-jost)", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", background: "transparent", border: "1px solid rgba(245,239,230,0.3)", color: "#F5EFE6", padding: "10px 20px", cursor: "pointer" }}
        >
          Refuser
        </button>
        <button
          onClick={accept}
          style={{ fontFamily: "var(--font-jost)", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", background: "var(--violet)", border: "none", color: "#fff", padding: "10px 20px", cursor: "pointer" }}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
