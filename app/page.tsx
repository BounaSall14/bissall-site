"use client";

import { useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type ViewState = "loading" | "landing" | "order" | "thanks" | "soldout" | "waiting";

interface Slot {
  id:     string;
  date:   string;
  time:   string;
  status: "available" | "filling";
}

interface OrderErrors {
  firstName?: string;
  lastName?:  string;
  email?:     string;
  phone?:     string;
  address?:   string;
  zip?:       string;
  city?:      string;
  slot?:      string;
}

// ── Pack unique ──────────────────────────────────────────────────────────────

const PACK = { quantity: 2, price: 8, label: "8,00 €" } as const;

// ── Shared sub-components ─────────────────────────────────────────────────

function ProductImage({
  src = "/Product.jpeg",
  height = 420,
  maxWidth = 320,
  grayscale = false,
}: {
  src?: string;
  height?: number;
  maxWidth?: number;
  grayscale?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        height,
        borderRadius: 4,
        overflow: "hidden",
        flexShrink: 0,
        filter: grayscale ? "grayscale(1) opacity(0.35)" : "none",
        transition: "filter 0.3s",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="BISSALL — Bissap artisanal 50cl"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="section-label">{children}</span>;
}

function formatSlotDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const formatted = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label:         string;
  value:         string;
  onChange:      (v: string) => void;
  error?:        string;
  type?:         string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="section-label" style={{ marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`field-input${error ? " error" : ""}`}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <a
        href="https://instagram.com/bissall.drink"
        target="_blank"
        rel="noopener noreferrer"
      >
        @bissall.drink
      </a>
    </footer>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 32,
          letterSpacing: "8px",
          color: "var(--text)",
          opacity: 0.4,
        }}
      >
        BISSALL
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  // ── Config state ──
  const [view,  setView]  = useState<ViewState>("loading");
  const [slots, setSlots] = useState<Slot[]>([]);

  // ── Order form ──
  const [slot,      setSlot]      = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [address,   setAddress]   = useState("");
  const [zip,       setZip]       = useState("");
  const [city,      setCity]      = useState("");
  const [errors,    setErrors]    = useState<OrderErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Notification (soldout / waiting) ──
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyDone,  setNotifyDone]  = useState(false);
  const [notifyError, setNotifyError] = useState("");

  // ── Load config on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        console.log("[page] /api/config response:", data);
        if (data.error) {
          // API inaccessible → on ne montre pas "disponible" par défaut
          console.error("[page] Config API error:", data.error);
          setView("soldout");
          return;
        }
        const statut = data.statut as string;
        if (statut === "Ouvert")       setView("landing");
        else if (statut === "Attente") setView("waiting");
        else                           setView("soldout"); // "Soldout" ou valeur inattendue
        setSlots(data.slots ?? []);
      })
      .catch((err) => {
        // Erreur réseau → même logique, ne pas afficher "disponible"
        console.error("[page] Failed to load config:", err);
        setView("soldout");
      });
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const clearErr = (field: keyof OrderErrors) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const validate = (): OrderErrors => {
    const e: OrderErrors = {};
    if (!firstName.trim()) e.firstName = "Prénom requis";
    if (!lastName.trim())  e.lastName  = "Nom requis";
    if (!email.trim())     e.email     = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Format invalide";
    if (!phone.trim())     e.phone     = "Téléphone requis";
    if (!address.trim())   e.address   = "Adresse requise";
    if (!zip.trim())       e.zip       = "Code postal requis";
    if (!city.trim())      e.city      = "Ville requise";
    if (!slot)             e.slot      = "Veuillez choisir un créneau";
    return e;
  };

  const selectedSlot = slots.find((s) => s.id === slot);
  const slotLabel    = selectedSlot
    ? `${selectedSlot.date} · ${selectedSlot.time}`
    : slot;

  // ── Form submit → /api/commande ───────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/commande", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, email, phone,
          address, zip, city,
          quantity: PACK.quantity,
          slot:     slotLabel,
          price:    PACK.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setView("thanks");
    } catch {
      setSubmitError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Notification submit → /api/notification ───────────────────────────────

  const handleNotify = async () => {
    if (!notifyEmail.trim()) return;
    setNotifyError("");

    try {
      const res = await fetch("/api/notification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotifyError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setNotifyDone(true);
    } catch {
      setNotifyError("Impossible de joindre le serveur. Veuillez réessayer.");
    }
  };

  // ── LOADING ───────────────────────────────────────────────────────────────

  if (view === "loading") return <LoadingScreen />;

  // ── THANKS ───────────────────────────────────────────────────────────────

  if (view === "thanks") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>

          <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, letterSpacing: "8px", fontWeight: 400, color: "var(--violet-dark)", marginBottom: 52, display: "block" }}>
            BISSALL
          </span>

          {/* Checkmark */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(168,97,162,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M6 14.5l5.5 5.5L22 9" stroke="var(--violet)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(32px, 6vw, 48px)", fontStyle: "italic", fontWeight: 400, color: "var(--text)", margin: "0 0 16px" }}>
            Merci pour votre commande&nbsp;!
          </h1>

          <p style={{ fontFamily: "var(--font-jost)", fontSize: 14, color: "rgba(26,13,25,0.5)", lineHeight: 1.7, maxWidth: 340, margin: "0 0 48px" }}>
            Votre commande a bien été enregistrée.<br />
            Vous recevrez un email de confirmation.<br />
            Nous vous contacterons avant la livraison.
          </p>

          <button
            onClick={() => setView("landing")}
            className="btn-primary"
          >
            RETOUR À L'ACCUEIL
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── LANDING ───────────────────────────────────────────────────────────────

  if (view === "landing") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <main
          style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "60px 24px", textAlign: "center",
          }}
        >
          {/* Logo illustration */}
          <div style={{ marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="BISSALL"
              style={{ width: 180, height: 180, objectFit: "contain" }}
            />
          </div>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(64px, 14vw, 88px)",
              letterSpacing: "0.22em", fontWeight: 400,
              color: "var(--violet-dark)",
              margin: "0 0 36px", lineHeight: 1,
            }}
          >
            BISSALL
          </h1>


          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 22, fontStyle: "italic", fontWeight: 400,
              color: "rgba(26,13,25,0.6)",
              margin: "0 0 22px", letterSpacing: "0.03em",
            }}
          >
            Bissap artisanal · 50cl
          </p>

          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px",
              border: "1px solid rgba(168,97,162,0.25)",
              borderRadius: 100, marginBottom: 40,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#27AE60", display: "block" }} />
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 11, letterSpacing: "2.5px", fontWeight: 500, color: "var(--text)" }}>
              DISPONIBLE
            </span>
          </div>

          <button className="btn-primary" onClick={() => setView("order")}>
            PASSER COMMANDE
          </button>

          {/* Dev state navigation — barely visible */}
          <div style={{ marginTop: 64, display: "flex", gap: 32, opacity: 0.25 }}>
            {(["soldout", "waiting"] as ViewState[]).map((s) => (
              <button
                key={s}
                onClick={() => setView(s)}
                style={{
                  fontFamily: "var(--font-jost)", fontSize: 11,
                  letterSpacing: "1px", color: "var(--violet)",
                  background: "none", border: "none",
                  cursor: "pointer", padding: 0,
                }}
              >
                → {s}
              </button>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── ORDER ─────────────────────────────────────────────────────────────────

  if (view === "order") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Sticky header */}
        <header
          className="order-header"
          style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "var(--beige)",
            borderBottom: "1px solid rgba(168,97,162,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 40px",
          }}
        >
          <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 400, letterSpacing: 6, color: "var(--text)" }}>
            BISSALL
          </span>
          <button
            onClick={() => setView("landing")}
            style={{
              fontFamily: "var(--font-jost)", fontSize: 12,
              letterSpacing: "2px", textTransform: "uppercase",
              color: "rgba(168,97,162,0.65)",
              background: "none", border: "none",
              cursor: "pointer", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--violet)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(168,97,162,0.65)")}
          >
            ← Retour
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <div
            className="order-main"
            style={{
              maxWidth: 720, margin: "0 auto",
              padding: "52px 24px 72px",
              display: "flex", flexDirection: "column", gap: 52,
            }}
          >

            {/* ── Product info ── */}
            <div
              className="product-section"
              style={{ display: "flex", gap: 40, alignItems: "flex-start" }}
            >
<div style={{ flex: 1, paddingTop: 8 }}>
                <span className="section-label" style={{ marginBottom: 10 }}>Bissap artisanal</span>
                <h2 style={{
                  fontFamily: "var(--font-cormorant)", fontSize: 34, fontWeight: 500,
                  letterSpacing: "0.06em", color: "var(--text)",
                  margin: "0 0 18px", lineHeight: 1.1,
                }}>
                  BISSALL 50cl
                </h2>
                <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, lineHeight: 1.7, color: "rgba(26,13,25,0.55)", marginBottom: 8 }}>
                  Fleurs d&apos;hibiscus · Sucre · Eau filtrée
                </p>
                <p style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "rgba(26,13,25,0.35)" }}>
                  Sans additifs · Sans conservateurs · Fait maison à Paris
                </p>
              </div>
            </div>

            {/* ── Delivery slots (dynamic from API) ── */}
            <div>
              <SectionLabel>Créneau de livraison</SectionLabel>

              {slots.length === 0 ? (
                <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.4)", fontStyle: "italic" }}>
                  Aucun créneau disponible pour le moment.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {slots.map((s) => {
                    const sel = slot === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSlot(s.id); clearErr("slot"); }}
                        className={`sel-card${sel ? " selected" : ""}`}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", textAlign: "left" }}
                      >
                        <div>
                          <div style={{ fontFamily: "var(--font-jost)", fontSize: 14, fontWeight: 500, color: sel ? "var(--violet)" : "var(--text)", marginBottom: 3 }}>
                            {formatSlotDate(s.date)}
                          </div>
                          <div style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(168,97,162,0.55)" }}>
                            {s.time}
                          </div>
                        </div>
                        <span style={{
                          fontFamily: "var(--font-jost)", fontSize: 10,
                          letterSpacing: "0.3px", fontWeight: 500,
                          padding: "3px 10px", borderRadius: 100,
                          flexShrink: 0, marginLeft: 12,
                          background: s.status === "filling" ? "rgba(230,126,34,0.1)" : "rgba(46,204,113,0.1)",
                          color:      s.status === "filling" ? "#B7770D" : "#1E8449",
                        }}>
                          {s.status === "filling" ? "Bientôt complet" : "Disponible"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.slot && <span className="field-error" style={{ marginTop: 8 }}>{errors.slot}</span>}
            </div>

            {/* ── Form ── */}
            <div>
              <SectionLabel>Informations de livraison</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div className="order-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <Field label="Prénom"   value={firstName} onChange={(v) => { setFirstName(v); clearErr("firstName"); }} error={errors.firstName} autoComplete="given-name" />
                  <Field label="Nom"      value={lastName}  onChange={(v) => { setLastName(v);  clearErr("lastName");  }} error={errors.lastName}  autoComplete="family-name" />
                </div>
                <div className="order-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <Field label="Email"     type="email" value={email} onChange={(v) => { setEmail(v); clearErr("email"); }} error={errors.email} autoComplete="email" />
                  <Field label="Téléphone" type="tel"   value={phone} onChange={(v) => { setPhone(v); clearErr("phone"); }} error={errors.phone} autoComplete="tel" />
                </div>
                <Field label="Adresse" value={address} onChange={(v) => { setAddress(v); clearErr("address"); }} error={errors.address} autoComplete="street-address" />
                <div className="order-grid-cp" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                  <Field label="Code postal" value={zip}  onChange={(v) => { setZip(v);  clearErr("zip");  }} error={errors.zip}  autoComplete="postal-code" />
                  <Field label="Ville"       value={city} onChange={(v) => { setCity(v); clearErr("city"); }} error={errors.city} autoComplete="address-level2" />
                </div>
              </div>
            </div>

            {/* ── Summary ── */}
            <div style={{ background: "rgba(255,252,248,0.7)", borderRadius: 4, padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.55)" }}>
                  Pack 2 bouteilles × 4,00 €
                </span>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.55)" }}>
                  {PACK.label}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.55)" }}>Livraison</span>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "#1E8449" }}>Offerte</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(168,97,162,0.12)", paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 500, color: "var(--text)" }}>Total</span>
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 500, color: "var(--text)" }}>
                  {PACK.label}
                </span>
              </div>
            </div>

            {/* ── Error feedback ── */}
            {submitError && (
              <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--error)", textAlign: "center", padding: "12px 16px", background: "rgba(192,57,43,0.06)", borderRadius: 4 }}>
                {submitError}
              </p>
            )}

            {/* ── Submit button ── */}
            <button
              type="submit"
              className="btn-primary full"
              disabled={submitting}
              style={{ opacity: submitting ? 0.65 : 1, cursor: submitting ? "wait" : "pointer" }}
            >
              {submitting ? "ENVOI EN COURS…" : "COMMANDER"}
            </button>
          </div>
        </form>

        <Footer />
      </div>
    );
  }

  // ── SOLDOUT / WAITING ─────────────────────────────────────────────────────

  const isSoldOut = view === "soldout";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>

        <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 32, letterSpacing: "8px", fontWeight: 400, color: "var(--text)", marginBottom: 52, display: "block" }}>
          BISSALL
        </span>


        <h1 style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontStyle: "italic", fontWeight: 400,
          color: "var(--text)",
          margin: "0 0 12px", letterSpacing: "0.02em",
        }}>
          {isSoldOut ? "Production épuisée" : "Prochaine production en préparation"}
        </h1>

        <p style={{ fontFamily: "var(--font-jost)", fontSize: 14, color: "rgba(26,13,25,0.42)", letterSpacing: "0.3px", marginBottom: 44 }}>
          {isSoldOut ? "Le prochain lancement arrive bientôt." : "Soyez les premiers informés."}
        </p>

        {/* Email capture */}
        {notifyDone ? (
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: 24, fontStyle: "italic", color: "var(--violet)" }}>
            Merci\u00a0— nous vous préviendrons\u00a0!
          </p>
        ) : (
          <div style={{ width: "100%", maxWidth: 320 }}>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => { setNotifyEmail(e.target.value); setNotifyError(""); }}
              placeholder="Votre email"
              className="field-input"
              style={{ textAlign: "center", marginBottom: 24 }}
            />
            {notifyError && (
              <p style={{ fontFamily: "var(--font-jost)", fontSize: 11, color: "var(--error)", marginBottom: 12 }}>
                {notifyError}
              </p>
            )}
            <button
              className="btn-primary full"
              onClick={handleNotify}
              type="button"
            >
              {isSoldOut ? "M\u2019AVERTIR" : "M\u2019INSCRIRE"}
            </button>
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 11, color: "rgba(26,13,25,0.3)", letterSpacing: "0.3px", marginTop: 16 }}>
              Pas de spam. Un email au moment du lancement.
            </p>
          </div>
        )}

        <button
          onClick={() => { setView("landing"); setNotifyDone(false); setNotifyEmail(""); setNotifyError(""); }}
          style={{
            fontFamily: "var(--font-jost)", marginTop: 52,
            fontSize: 11, letterSpacing: "1.5px",
            color: "rgba(26,13,25,0.28)",
            background: "none", border: "none",
            cursor: "pointer", padding: 0,
          }}
        >
          ← Accueil
        </button>
      </main>

      <Footer />
    </div>
  );
}
