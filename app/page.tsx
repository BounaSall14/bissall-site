export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* ── Ambient background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[140px] animate-glow-pulse" />
        <div className="absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[140px] animate-glow-pulse delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px] animate-glow-pulse delay-200" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 md:px-14 glass sticky top-0 border-b border-white/5">
        <span className="text-2xl font-black tracking-tight gradient-text select-none">BissAll</span>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Services</a>
          <a href="#stats"    className="hover:text-white transition-colors">Chiffres</a>
          <a href="#contact"  className="hover:text-white transition-colors">Contact</a>
        </div>

        <a href="#contact" className="btn-primary !py-2.5 !px-5 !text-sm">
          Commencer →
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[92vh] px-6 text-center py-20">

        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Nouveau &middot; Disponible maintenant
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 text-[clamp(3.5rem,10vw,7.5rem)] font-black leading-[1.05] tracking-tight mb-6">
          <span className="gradient-text">Crée.</span>
          <br />
          <span className="text-white">Innove.</span>
          <br />
          <span className="gradient-text">Déchire.</span>
        </h1>

        <p className="animate-fade-in-up delay-200 max-w-2xl text-lg md:text-xl text-white/55 mb-10 leading-relaxed">
          La plateforme ultime pour les créatifs de demain.
          Construis, partage et fais exploser tes projets avec une communauté qui déchire.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4">
          <a href="#contact" className="btn-primary">
            Rejoindre gratuitement 🚀
          </a>
          <a href="#features" className="btn-secondary">
            Voir comment ça marche
          </a>
        </div>

        {/* Social proof */}
        <div className="animate-fade-in-up delay-400 flex items-center gap-5 mt-14">
          <div className="flex -space-x-3" aria-hidden>
            {["🧑‍💻", "👩‍🎨", "🧑‍🎤", "👨‍🚀", "👩‍💻"].map((emoji, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full glass border-2 border-purple-500/40 flex items-center justify-center text-base shadow-md"
              >
                {emoji}
              </div>
            ))}
          </div>
          <div className="text-left leading-tight">
            <p className="text-white font-bold text-sm">+12 000 créatifs</p>
            <p className="text-white/40 text-xs">nous font confiance</p>
          </div>
        </div>

        {/* Floating side cards — desktop only */}
        <div className="absolute top-1/3 left-[3%] animate-float hidden xl:block">
          <div className="glass-card rounded-2xl p-4 w-52 pointer-events-none select-none">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg">
                🔥
              </div>
              <div>
                <p className="text-xs font-semibold text-white">En tendance</p>
                <p className="text-xs text-white/40">+2.4k vues aujourd&apos;hui</p>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-gradient-shift" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 right-[3%] animate-float-slow hidden xl:block">
          <div className="glass-card rounded-2xl p-5 w-44 pointer-events-none select-none text-center">
            <p className="text-4xl mb-1">⚡</p>
            <p className="text-white font-bold text-sm">Ultra rapide</p>
            <p className="text-white/40 text-xs mt-1">99.9 % uptime</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 py-28 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tout ce dont tu as&nbsp;
              <span className="gradient-text">besoin</span>
            </h2>
            <p className="text-white/45 text-lg max-w-2xl mx-auto">
              Des outils pensés pour les jeunes créatifs qui veulent aller vite et frapper fort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "🚀",
                title: "Déploiement instant",
                desc: "Lance tes projets en quelques secondes. Zéro friction, zéro prise de tête.",
                glow: "group-hover:shadow-purple-500/20",
              },
              {
                icon: "🎨",
                title: "Design ultra moderne",
                desc: "Des templates tellement stylés que même ta grand-mère approuve.",
                glow: "group-hover:shadow-pink-500/20",
              },
              {
                icon: "⚡",
                title: "Performance maximale",
                desc: "Optimisé pour être le plus rapide du monde. Speed is king.",
                glow: "group-hover:shadow-cyan-500/20",
              },
              {
                icon: "🤝",
                title: "Communauté active",
                desc: "12 k créatifs qui s'entraident, partagent et se challengent chaque jour.",
                glow: "group-hover:shadow-green-500/20",
              },
              {
                icon: "🔒",
                title: "Sécurité béton",
                desc: "Tes données sont protégées. On ne rigole vraiment pas avec ça.",
                glow: "group-hover:shadow-amber-500/20",
              },
              {
                icon: "📊",
                title: "Analytics en temps réel",
                desc: "Suis tes stats live. Sache exactement qui regarde ton taf.",
                glow: "group-hover:shadow-rose-500/20",
              },
            ].map(({ icon, title, desc, glow }) => (
              <article
                key={title}
                className={`group glass-card rounded-2xl p-6 cursor-pointer shadow-lg ${glow}`}
              >
                <span className="text-4xl block mb-4" aria-hidden>{icon}</span>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="relative z-10 py-16 px-6 md:px-14">
        <div className="max-w-5xl mx-auto glass rounded-3xl border border-white/8 p-10 md:p-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: "12K+", label: "Utilisateurs" },
              { value: "98 %", label: "Satisfaction" },
              { value: "< 3 s", label: "Déploiement" },
              { value: "24/7", label: "Support" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl md:text-5xl font-black gradient-text mb-2">{value}</p>
                <p className="text-white/45 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 py-24 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl font-black mb-4">
            Ils <span className="gradient-text">kiffent</span> BissAll
          </h2>
          <p className="text-center text-white/45 text-lg mb-14">La parole est à ceux qui l&apos;utilisent.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "Sérieusement le meilleur outil que j'ai utilisé. Mon portfolio a explosé en 2 semaines.",
                name: "Yasmine B.",
                role: "Designer UX · Paris",
                avatar: "👩‍🎨",
              },
              {
                quote: "J'ai déployé mon app en moins de 5 minutes. Propre, rapide, parfait.",
                name: "Karim D.",
                role: "Dev fullstack · Lyon",
                avatar: "🧑‍💻",
              },
              {
                quote: "La communauté est incroyable. J'ai trouvé des collabs en quelques jours.",
                name: "Léa M.",
                role: "Créatrice de contenu · Bordeaux",
                avatar: "👩‍💻",
              },
            ].map(({ quote, name, role, avatar }) => (
              <div key={name} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex text-yellow-400 text-sm gap-0.5" aria-label="5 étoiles">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                  <span className="text-2xl" aria-hidden>{avatar}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-white/40 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="relative z-10 py-28 px-6 md:px-14 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-[1.1]">
            Prêt à <span className="gradient-text">tout déchirer</span>&nbsp;?
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            Rejoins des milliers de créatifs qui utilisent BissAll pour concrétiser leurs idées.
            C&apos;est gratuit pour commencer.
          </p>
          <a href="#" className="btn-primary text-lg !px-10 !py-5">
            Créer mon compte — c&apos;est gratuit 🎯
          </a>
          <p className="text-white/25 text-xs mt-6">
            Aucune carte bancaire requise &nbsp;·&nbsp; Annule quand tu veux
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6 md:px-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-2xl font-black gradient-text select-none">BissAll</span>
          <nav className="flex gap-6 text-white/35 text-sm" aria-label="Liens footer">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </nav>
          <p className="text-white/25 text-sm">© 2026 BissAll. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  );
}
