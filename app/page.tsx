"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type ViewState = "landing" | "order" | "soldout" | "waiting";

interface OrderErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  zip?: string;
  city?: string;
  slot?: string;
}

// ── Data ──────────────────────────────────────────────────────────────────

const QUANTITIES = [
  { value: "2", label: "2", price: "8,00 €", unit: 8 },
  { value: "4", label: "4", price: "14,00 €", unit: 3.5 },
] as const;

const SLOTS = [
  { id: "sat-am", date: "Samedi 19 avril",   time: "10h – 14h", status: "available" },
  { id: "sat-pm", date: "Samedi 19 avril",   time: "14h – 18h", status: "filling"   },
  { id: "sun-am", date: "Dimanche 20 avril", time: "10h – 14h", status: "available" },
  { id: "sun-pm", date: "Dimanche 20 avril", time: "14h – 18h", status: "available" },
] as const;

// ── Shared sub-components ─────────────────────────────────────────────────

/** Portrait 3:4 product placeholder with a discrete hibiscus SVG */
function ProductImage({
  height = 420,
  maxWidth = 320,
  grayscale = false,
}: {
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
        background: "var(--beige-dark)",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        filter: grayscale ? "grayscale(1) opacity(0.35)" : "none",
        transition: "filter 0.3s",
      }}
    >
      {/* Hibiscus icon — 5 petals rotated around centre */}
      <svg width="48" height="48" viewBox="0 0 60 60" fill="none" aria-hidden>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="30" cy="14"
            rx="5.5" ry="10.5"
            fill="#C5B5A5"
            transform={`rotate(${deg} 30 30)`}
          />
        ))}
        <circle cx="30" cy="30" r="6" fill="#B8A898" />
      </svg>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="section-label">{children}</span>;
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
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

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView]           = useState<ViewState>("landing");
  const [quantity, setQuantity]   = useState<string>("2");
  const [slot, setSlot]           = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [address, setAddress]     = useState("");
  const [zip, setZip]             = useState("");
  const [city, setCity]           = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyDone, setNotifyDone]   = useState(false);
  const [errors, setErrors]       = useState<OrderErrors>({});

  const clearErr = (field: keyof OrderErrors) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // TODO: submit order
      alert("Commande confirmée !");
    }
  };

  const selectedQty = QUANTITIES.find((q) => q.value === quantity)!;
  const totalPrice  = quantity === "2" ? "8 €" : "14 €";

  // ── LANDING ──────────────────────────────────────────────────────────────

  if (view === "landing") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(64px, 14vw, 88px)",
              letterSpacing: "0.22em",
              fontWeight: 400,
              color: "var(--text)",
              margin: "0 0 52px",
              lineHeight: 1,
            }}
          >
            BISSALL
          </h1>

          {/* Product image */}
          <div style={{ marginBottom: 36 }}>
            <ProductImage />
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 22,
              fontStyle: "italic",
              fontWeight: 400,
              color: "rgba(26,13,25,0.6)",
              margin: "0 0 22px",
              letterSpacing: "0.03em",
            }}
          >
            Bissap artisanal · 50cl
          </p>

          {/* Status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              border: "1px solid rgba(168,97,162,0.25)",
              borderRadius: 100,
              marginBottom: 40,
            }}
          >
            <span
              style={{
                width: 7, height: 7,
                borderRadius: "50%",
                background: "#27AE60",
                display: "block",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 11,
                letterSpacing: "2.5px",
                fontWeight: 500,
                color: "var(--text)",
              }}
            >
              DISPONIBLE
            </span>
          </div>

          {/* CTA */}
          <button className="btn-primary" onClick={() => setView("order")}>
            PASSER COMMANDE
          </button>

          {/* Dev state navigation */}
          <div style={{ marginTop: 64, display: "flex", gap: 32, opacity: 0.28 }}>
            {(["soldout", "waiting"] as ViewState[]).map((s) => (
              <button
                key={s}
                onClick={() => setView(s)}
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 11,
                  letterSpacing: "1px",
                  color: "var(--violet)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
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
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 22, fontWeight: 400,
              letterSpacing: 6,
              color: "var(--text)",
            }}
          >
            BISSALL
          </span>
          <button
            onClick={() => setView("landing")}
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 12, letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(168,97,162,0.65)",
              background: "none", border: "none", cursor: "pointer", padding: 0,
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

            {/* ── Product section ── */}
            <div
              className="product-section"
              style={{ display: "flex", gap: 40, alignItems: "flex-start" }}
            >
              <ProductImage height={260} maxWidth={195} />
              <div style={{ flex: 1, paddingTop: 8 }}>
                <span className="section-label" style={{ marginBottom: 10 }}>
                  Bissap artisanal
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: 34, fontWeight: 500,
                    letterSpacing: "0.06em",
                    color: "var(--text)",
                    margin: "0 0 18px",
                    lineHeight: 1.1,
                  }}
                >
                  BISSALL 50cl
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 13, lineHeight: 1.7,
                    color: "rgba(26,13,25,0.55)",
                    marginBottom: 8,
                  }}
                >
                  Fleurs d&apos;hibiscus · Sucre · Eau filtrée
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 12,
                    color: "rgba(26,13,25,0.35)",
                    letterSpacing: "0.2px",
                  }}
                >
                  Sans additifs · Sans conservateurs · Fait maison à Paris
                </p>
              </div>
            </div>

            {/* ── Quantity cards ── */}
            <div>
              <SectionLabel>Quantité</SectionLabel>
              <div style={{ display: "flex", gap: 12 }}>
                {QUANTITIES.map((q) => {
                  const sel = quantity === q.value;
                  return (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => setQuantity(q.value)}
                      className={`sel-card${sel ? " selected" : ""}`}
                      style={{
                        flex: 1,
                        padding: "20px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-cormorant)",
                          fontSize: 36, fontWeight: 500,
                          color: sel ? "var(--violet)" : "var(--text)",
                          lineHeight: 1,
                        }}
                      >
                        {q.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-jost)",
                          fontSize: 11, letterSpacing: "0.5px",
                          color: "rgba(168,97,162,0.5)",
                        }}
                      >
                        bouteille{q.value === "2" ? "s" : "s"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-jost)",
                          fontSize: 13, fontWeight: 500,
                          color: sel ? "var(--violet)" : "rgba(26,13,25,0.5)",
                          marginTop: 4,
                        }}
                      >
                        {q.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Delivery slots ── */}
            <div>
              <SectionLabel>Créneau de livraison</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SLOTS.map((s) => {
                  const sel = slot === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSlot(s.id); clearErr("slot"); }}
                      className={`sel-card${sel ? " selected" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-jost)",
                            fontSize: 14, fontWeight: 500,
                            color: sel ? "var(--violet)" : "var(--text)",
                            marginBottom: 3,
                          }}
                        >
                          {s.date}
                        </div>
                        <div style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(168,97,162,0.55)" }}>
                          {s.time}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-jost)",
                          fontSize: 10, letterSpacing: "0.3px", fontWeight: 500,
                          padding: "3px 10px", borderRadius: 100,
                          flexShrink: 0, marginLeft: 12,
                          background: s.status === "filling"
                            ? "rgba(230,126,34,0.1)"
                            : "rgba(46,204,113,0.1)",
                          color: s.status === "filling" ? "#B7770D" : "#1E8449",
                        }}
                      >
                        {s.status === "filling" ? "Bientôt complet" : "Disponible"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.slot && <span className="field-error" style={{ marginTop: 8 }}>{errors.slot}</span>}
            </div>

            {/* ── Delivery info form ── */}
            <div>
              <SectionLabel>Informations de livraison</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div
                  className="order-grid-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
                >
                  <Field label="Prénom"   value={firstName} onChange={(v) => { setFirstName(v); clearErr("firstName"); }} error={errors.firstName} autoComplete="given-name" />
                  <Field label="Nom"      value={lastName}  onChange={(v) => { setLastName(v);  clearErr("lastName");  }} error={errors.lastName}  autoComplete="family-name" />
                </div>
                <div
                  className="order-grid-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
                >
                  <Field label="Email"     type="email" value={email} onChange={(v) => { setEmail(v); clearErr("email"); }} error={errors.email} autoComplete="email" />
                  <Field label="Téléphone" type="tel"   value={phone} onChange={(v) => { setPhone(v); clearErr("phone"); }} error={errors.phone} autoComplete="tel" />
                </div>
                <Field label="Adresse" value={address} onChange={(v) => { setAddress(v); clearErr("address"); }} error={errors.address} autoComplete="street-address" />
                <div
                  className="order-grid-cp"
                  style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}
                >
                  <Field label="Code postal" value={zip}  onChange={(v) => { setZip(v);  clearErr("zip");  }} error={errors.zip}  autoComplete="postal-code" />
                  <Field label="Ville"       value={city} onChange={(v) => { setCity(v); clearErr("city"); }} error={errors.city} autoComplete="address-level2" />
                </div>
              </div>
            </div>

            {/* ── Summary ── */}
            <div
              style={{
                background: "rgba(255,252,248,0.7)",
                borderRadius: 4,
                padding: "24px 28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.55)" }}>
                  {selectedQty.label} bouteilles × {selectedQty.unit.toFixed(2).replace(".", ",")} €
                </span>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.55)" }}>
                  {selectedQty.price}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(26,13,25,0.55)" }}>
                  Livraison
                </span>
                <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "#1E8449" }}>
                  Offerte
                </span>
              </div>
              <div
                style={{
                  borderTop: "1px solid rgba(168,97,162,0.12)",
                  paddingTop: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 500, color: "var(--text)" }}>
                  Total
                </span>
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 500, color: "var(--text)" }}>
                  {totalPrice}
                </span>
              </div>
            </div>

            {/* ── Submit ── */}
            <button type="submit" className="btn-primary full">
              COMMANDER
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
      <main
        style={{
          flex: 1,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "60px 24px", textAlign: "center",
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 32, letterSpacing: "8px", fontWeight: 400,
            color: "var(--text)",
            marginBottom: 52, display: "block",
          }}
        >
          BISSALL
        </span>

        {/* Greyscale product image */}
        <div style={{ marginBottom: 44 }}>
          <ProductImage grayscale />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontStyle: "italic", fontWeight: 400,
            color: "var(--text)",
            margin: "0 0 12px",
            letterSpacing: "0.02em",
          }}
        >
          {isSoldOut ? "Production épuisée" : "Prochaine production en préparation"}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 14, color: "rgba(26,13,25,0.42)",
            letterSpacing: "0.3px", marginBottom: 44,
          }}
        >
          {isSoldOut
            ? "Le prochain lancement arrive bientôt."
            : "Soyez les premiers informés."}
        </p>

        {/* Email capture */}
        {notifyDone ? (
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 24, fontStyle: "italic",
              color: "var(--violet)",
            }}
          >
            Merci — nous vous préviendrons !
          </p>
        ) : (
          <div style={{ width: "100%", maxWidth: 320 }}>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="Votre email"
              className="field-input"
              style={{ textAlign: "center", marginBottom: 24 }}
            />
            <button
              className="btn-primary full"
              onClick={() => { if (notifyEmail) setNotifyDone(true); }}
              type="button"
            >
              {isSoldOut ? "M'AVERTIR" : "M'INSCRIRE"}
            </button>
            <p
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 11, color: "rgba(26,13,25,0.3)",
                letterSpacing: "0.3px", marginTop: 16,
              }}
            >
              Pas de spam. Un email au moment du lancement.
            </p>
          </div>
        )}

        {/* Back to landing */}
        <button
          onClick={() => { setView("landing"); setNotifyDone(false); setNotifyEmail(""); }}
          style={{
            fontFamily: "var(--font-jost)",
            marginTop: 52, fontSize: 11, letterSpacing: "1.5px",
            color: "rgba(26,13,25,0.28)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          ← Accueil
        </button>
      </main>

      <Footer />
    </div>
  );
}
