import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — BISSALL",
};

export default function CGV() {
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
          Conditions Générales de Vente
        </h1>

        <Section title="1. Objet">
          <p>Les présentes CGV régissent les ventes de bissap artisanal effectuées via le site www.bissall.fr par BISSALL (SIRET 13033844500013), ci-après "BISSALL".</p>
        </Section>

        <Section title="2. Produits">
          <p>BISSALL propose des bouteilles de bissap artisanal de 50cl, fabriquées à Paris, sans additifs ni conservateurs.</p>
          <p>Les commandes sont disponibles par packs de 2 bouteilles (9,00 € TTC) ou 4 bouteilles (15,00 € TTC), livraison incluse.</p>
          <p>Les ventes sont organisées sous forme de "drops" à dates limitées. BISSALL se réserve le droit de clôturer une vente à tout moment en cas de rupture de stock.</p>
        </Section>

        <Section title="3. Prix">
          <p>Les prix sont indiqués en euros TTC. La livraison est offerte pour toute commande passée sur le site.</p>
        </Section>

        <Section title="4. Commande et paiement">
          <p>La commande est validée après confirmation du paiement en ligne sécurisé via Stripe. Un email de confirmation vous est envoyé.</p>
          <p>BISSALL se réserve le droit d'annuler toute commande en cas de problème de stock ou d'indisponibilité du produit, avec remboursement intégral.</p>
        </Section>

        <Section title="5. Livraison">
          <p>La livraison est effectuée en main propre à Paris et ses environs, selon le créneau horaire choisi lors de la commande. Vous serez contacté avant la livraison pour confirmer les modalités.</p>
          <p>BISSALL ne peut être tenu responsable des retards liés à des circonstances indépendantes de sa volonté.</p>
        </Section>

        <Section title="6. Droit de rétractation">
          <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation de 14 jours <strong>ne s'applique pas</strong> aux denrées périssables susceptibles de se détériorer rapidement. Le bissap artisanal étant un produit alimentaire frais, toute commande validée et payée ne peut être annulée ni remboursée, sauf défaut avéré du produit.</p>
        </Section>

        <Section title="7. Réclamations">
          <p>Toute réclamation doit être adressée par email à <a href="mailto:contact@bissall.fr">contact@bissall.fr</a> dans les 48h suivant la réception. En cas de produit défectueux, un remboursement ou remplacement sera effectué.</p>
        </Section>

        <Section title="8. Données personnelles">
          <p>Les données collectées lors de la commande (nom, email, adresse, téléphone) sont utilisées uniquement pour le traitement et la livraison de votre commande. Consultez notre <Link href="/confidentialite" style={{ color: "var(--violet)" }}>Politique de confidentialité</Link>.</p>
        </Section>

        <Section title="9. Droit applicable">
          <p>Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux de Paris sont compétents.</p>
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
