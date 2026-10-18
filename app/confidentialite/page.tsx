import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — BISSALL",
};

export default function Confidentialite() {
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
          Politique de confidentialité
        </h1>

        <Section title="1. Responsable du traitement">
          <p>BISSALL (SIRET 13033844500013) — Paris, France<br />
          Email : <a href="mailto:contact@bissall.fr">contact@bissall.fr</a></p>
        </Section>

        <Section title="2. Données collectées">
          <p>Lors d'une commande, nous collectons :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison</li>
          </ul>
          <p style={{ marginTop: 12 }}>Lors d'une inscription à la liste d'attente, nous collectons uniquement votre adresse email.</p>
          <p style={{ marginTop: 12 }}><strong>Données de paiement :</strong> vos informations bancaires sont traitées directement et exclusivement par Stripe. BISSALL n'a jamais accès à vos données de carte bancaire.</p>
        </Section>

        <Section title="3. Finalités du traitement">
          <ul style={{ paddingLeft: 20 }}>
            <li>Traitement et livraison des commandes</li>
            <li>Envoi d'un email de confirmation de commande</li>
            <li>Information sur les prochains drops (avec votre consentement)</li>
            <li>Sécurisation des paiements via Stripe</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Le traitement de vos données est fondé sur l'exécution d'un contrat (commande) et votre consentement (liste d'attente).</p>
        </Section>

        <Section title="5. Sous-traitants">
          <ul style={{ paddingLeft: 20 }}>
            <li><strong>Airtable</strong> (Airtable Inc., USA) — stockage des données clients et commandes</li>
            <li><strong>Stripe</strong> (Stripe Inc., USA) — traitement des paiements</li>
            <li><strong>Vercel</strong> (Vercel Inc., USA) — hébergement du site</li>
          </ul>
          <p style={{ marginTop: 12 }}>Ces sous-traitants sont conformes au RGPD et soumis à des clauses contractuelles types pour les transferts hors UE.</p>
        </Section>

        <Section title="6. Durée de conservation">
          <p>Vos données sont conservées pendant 3 ans à compter de votre dernière commande, conformément aux obligations légales comptables et fiscales françaises.</p>
        </Section>

        <Section title="7. Cookies">
          <p>Ce site utilise des cookies strictement nécessaires au traitement des paiements (Stripe.js). Aucun cookie de tracking publicitaire n'est utilisé.</p>
          <p style={{ marginTop: 8 }}>Stripe dépose des cookies pour prévenir la fraude et sécuriser les transactions. Pour en savoir plus : <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--violet)" }}>politique de confidentialité de Stripe</a>.</p>
        </Section>

        <Section title="8. Vos droits">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>
          <p style={{ marginTop: 12 }}>Pour exercer ces droits, contactez-nous à <a href="mailto:contact@bissall.fr">contact@bissall.fr</a>. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--violet)" }}>CNIL</a>.</p>
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
