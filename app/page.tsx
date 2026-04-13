"use client";

import { useMemo, useState } from "react";

type ViewState = "landing" | "order" | "soldout" | "waiting";
type Quantity = "2" | "4";
type OrderErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  zip?: string;
  city?: string;
  slot?: string;
};

const DELIVERY_SLOTS = [
  "Samedi 19 avril · 10h-14h",
  "Samedi 19 avril · 15h-19h",
  "Dimanche 20 avril · 10h-14h",
];

export default function Home() {
  const [view, setView] = useState<ViewState>("landing");
  const [quantity, setQuantity] = useState<Quantity>("2");
  const [slot, setSlot] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [errors, setErrors] = useState<OrderErrors>({});
  const [submitError, setSubmitError] = useState("");

  const total = useMemo(() => (quantity === "2" ? "8€" : "14€"), [quantity]);
  const quantityLabel = useMemo(() => (quantity === "2" ? "2 bouteilles" : "4 bouteilles"), [quantity]);

  const inputBaseClass =
    "w-full border-0 border-b border-[var(--violet)]/45 bg-transparent pb-2 text-[0.95rem] text-[var(--violet)] outline-none transition focus:border-[var(--violet)]";
  const buttonBaseClass =
    "inline-flex items-center justify-center bg-[var(--violet)] px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white transition hover:opacity-90";
  const cardBaseClass = "w-full rounded-[4px] border px-4 py-3 text-left text-sm uppercase tracking-[0.08em] transition";

  const validateOrder = () => {
    const nextErrors: OrderErrors = {};

    if (!firstName.trim()) nextErrors.firstName = "Le prénom est requis.";
    if (!lastName.trim()) nextErrors.lastName = "Le nom est requis.";
    if (!email.trim()) nextErrors.email = "L'email est requis.";
    if (!phone.trim()) nextErrors.phone = "Le téléphone est requis.";
    if (!address.trim()) nextErrors.address = "L'adresse est requise.";
    if (!zip.trim()) nextErrors.zip = "Le code postal est requis.";
    if (!city.trim()) nextErrors.city = "La ville est requise.";
    if (!slot) nextErrors.slot = "Sélectionnez un créneau de livraison.";

    return nextErrors;
  };

  const handleOrderSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateOrder();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError("Merci de compléter les champs requis et choisir un créneau.");
      return;
    }

    setSubmitError("");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center bg-[var(--beige)] px-6 py-12 text-[var(--violet)]">
      <section className="w-full rounded-[2.2rem] border border-[var(--violet)]/20 bg-[var(--beige)] p-8 shadow-[0_20px_45px_rgba(82,38,82,0.08)] md:p-12">
        {view === "landing" && (
          <div className="mx-auto flex w-full max-w-[520px] flex-col items-center text-center">
            <div className="space-y-6">
              <p
                className="text-[82px] leading-none tracking-[0.14em] md:text-[90px]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                BISSALL
              </p>
              <div className="mx-auto aspect-[3/4] min-h-[400px] w-full max-w-[340px] border border-[var(--violet)]/20 bg-[var(--beige)] p-5">
                <div className="flex h-full items-center justify-center border border-[var(--violet)]/25 text-center text-sm uppercase tracking-[0.2em] text-[var(--violet)]/75">
                  Placeholder image
                </div>
              </div>
              <p
                className="text-2xl italic md:text-3xl"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Bissap artisanal · 50cl
              </p>
              <span className="inline-flex rounded-full border border-[var(--violet)]/35 px-4 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em]">
                Disponible
              </span>
              <div>
                <button className={buttonBaseClass} onClick={() => setView("order")}>
                  PASSER COMMANDE
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "order" && (
          <form className="space-y-10" onSubmit={handleOrderSubmit}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1
                className="text-[32px] leading-none tracking-[0.1em]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                BISSALL
              </h1>
              <button
                className="text-xs uppercase tracking-[0.22em] text-[var(--violet)]"
                onClick={() => setView("landing")}
              >
                ← Retour
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <input
                  required
                  className={inputBaseClass}
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                {errors.firstName && <p className="mt-2 text-xs">{errors.firstName}</p>}
              </div>
              <div>
                <input
                  required
                  className={inputBaseClass}
                  placeholder="Nom"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
                {errors.lastName && <p className="mt-2 text-xs">{errors.lastName}</p>}
              </div>
              <div>
                <input
                  required
                  type="email"
                  className={inputBaseClass}
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {errors.email && <p className="mt-2 text-xs">{errors.email}</p>}
              </div>
              <div>
                <input
                  required
                  className={inputBaseClass}
                  placeholder="Téléphone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                {errors.phone && <p className="mt-2 text-xs">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <input
                  required
                  className={inputBaseClass}
                  placeholder="Adresse"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                {errors.address && <p className="mt-2 text-xs">{errors.address}</p>}
              </div>
              <div>
                <input
                  required
                  className={inputBaseClass}
                  placeholder="Code postal"
                  value={zip}
                  onChange={(event) => setZip(event.target.value)}
                />
                {errors.zip && <p className="mt-2 text-xs">{errors.zip}</p>}
              </div>
              <div>
                <input
                  required
                  className={inputBaseClass}
                  placeholder="Ville"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
                {errors.city && <p className="mt-2 text-xs">{errors.city}</p>}
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--violet)]">
                  Quantité
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setQuantity("2")}
                    className={`${cardBaseClass} ${
                      quantity === "2"
                        ? "border-[var(--violet)] bg-[var(--violet)] text-white"
                        : "border-[var(--violet)]/30 bg-transparent text-[var(--violet)] hover:border-[var(--violet)]"
                    }`}
                  >
                    2 bouteilles - 8€
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity("4")}
                    className={`${cardBaseClass} ${
                      quantity === "4"
                        ? "border-[var(--violet)] bg-[var(--violet)] text-white"
                        : "border-[var(--violet)]/30 bg-transparent text-[var(--violet)] hover:border-[var(--violet)]"
                    }`}
                  >
                    4 bouteilles - 14€
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--violet)]">
                  Créneau livraison
                </p>
                <div className="space-y-3">
                  {DELIVERY_SLOTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSlot(item);
                        setErrors((prev) => ({ ...prev, slot: undefined }));
                      }}
                      className={`${cardBaseClass} ${
                        slot === item
                          ? "border-[var(--violet)] bg-[var(--violet)] text-white"
                          : "border-[var(--violet)]/30 bg-transparent text-[var(--violet)] hover:border-[var(--violet)]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {errors.slot && <p className="mt-2 text-xs">{errors.slot}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--violet)]/20 bg-[var(--beige)] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--violet)]">
                Récapitulatif
              </p>
              <div className="mt-4 space-y-1 text-sm text-[var(--violet)]">
                <p>{quantityLabel}</p>
                <p>Livraison offerte</p>
                <p className="pt-2 text-base text-[var(--violet)]">Total: {total}</p>
              </div>
            </div>

            {submitError && <p className="text-sm uppercase tracking-[0.08em]">{submitError}</p>}
            <button type="submit" className={buttonBaseClass}>
              COMMANDER
            </button>
          </form>
        )}

        {(view === "soldout" || view === "waiting") && (
          <div className="mx-auto max-w-xl space-y-8 text-center">
            <h1
              className="text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {view === "soldout" ? "Stock épuisé" : "Liste d'attente"}
            </h1>
            <p className="text-sm text-[var(--violet)]">
              Laisse ton email pour recevoir la prochaine disponibilité BISSALL.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                className={inputBaseClass}
                placeholder="Votre email"
                value={notifyEmail}
                onChange={(event) => setNotifyEmail(event.target.value)}
              />
              <button className={buttonBaseClass}>RECEVOIR UNE NOTIFICATION</button>
            </div>
            <button
              className="text-xs uppercase tracking-[0.22em] text-[var(--violet)]"
              onClick={() => setView("landing")}
            >
              Retour accueil
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
