import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — BISSALL",
};

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--beige)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "24px 32px", borderBottom: "1px solid rgba(168,97,162,0.1)" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bissall-logo.png" alt="Bissall" style={{ width: 90, height: "auto", mixBlendMode: "multiply" }} />
        </Link>
      </header>

      <main style={{ flex: 1, maxWidth: 720, margin: "0 auto", width: "100%", padding: "60px 32px 80px" }}>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 36, fontStyle: "italic", fontWeight: 400, color: "var(--text)", marginBottom: 48 }}>
          Mentions légales
        </h1>

        <Section title="Éditeur du site">
          <p><strong>Raison sociale :</strong> BISSALL</p>
          <p><strong>Statut :</strong> Auto-entrepreneur</p>
          <p><strong>SIRET :</strong> 13033844500013</p>
          <p><strong>Adresse :</strong> Paris, France</p>
          <p><strong>Email :</strong> <a href="mailto:contact@bissall.fr">contact@bissall.fr</a></p>
          <p><strong>Directeur de la publication :</strong> BISSALL</p>
        </Section>

        <Section title="Hébergeur">
          <p>Vercel Inc.<br />340 Pine Street, Suite 900<br />San Francisco, CA 94104, États-Unis<br />
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>L'ensemble du contenu de ce site (textes, images, logo) est protégé par le droit d'auteur et appartient à BISSALL. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
        </Section>

        <Section title="Responsabilité">
          <p>BISSALL s'efforce d'assurer l'exactitude des informations présentes sur ce site mais ne peut garantir leur exhaustivité. BISSALL ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site.</p>
        </Section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(168,97,162,0.12)" }}>
          <Link href="/" style={{ fontFamily: "var(--font-jost)", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(168,97,162,0.55)", textDecoration: "none" }}>
            ← Retour
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>{title}</h2>
      <div style={{ fontFamily: "var(--font-jost)", fontSize: 14, fontWeight: 300, color: "rgba(26,13,25,0.7)", lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  );
}
