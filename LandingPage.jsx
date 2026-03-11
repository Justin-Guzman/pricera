const C = {
  bg: "#0A0A0A",
  surface: "#141414",
  surfaceHigh: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#00E5A0",
  accentDim: "rgba(0,229,160,0.1)",
  accentGlow: "rgba(0,229,160,0.15)",
  text: "#F0F0F0",
  textMuted: "#888",
  textDim: "#444",
};

export default function LandingPage({ onEnter }) {
  return (
    <div style={s.root}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <span style={s.navIcon}>◈</span>
          <span style={s.navText}>Pricera</span>
        </div>
        <button style={s.navCta} onClick={onEnter}>Try it free</button>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>
          <span style={s.heroBadgeDot} />
          <span style={s.heroBadgeText}>AI-Powered Resale Intelligence</span>
        </div>

        <h1 style={s.heroTitle}>
          <span style={s.heroTitleLine1}>Know what</span>
          <span style={s.heroTitleLine2}>it's worth</span>
          <span style={s.heroTitleLine3}>before you buy.</span>
        </h1>

        <p style={s.heroSub}>
          Snap any thrift find. Pricera's AI identifies it, prices it,
          and tells you exactly where to sell it for maximum profit.
        </p>

        <div style={s.heroActions}>
          <button style={s.heroPrimary} onClick={onEnter}>
            <span>📸</span> Start Scanning Free
          </button>
          <p style={s.heroNote}>No account needed · Works on any phone</p>
        </div>

        {/* Floating stat cards */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statCardNum}>$0–$500</span>
            <span style={s.statCardLabel}>Resale range detected</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statCardNum}>3 sec</span>
            <span style={s.statCardLabel}>Average scan time</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statCardNum}>10+</span>
            <span style={s.statCardLabel}>Platforms covered</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={s.howSection}>
        <p style={s.sectionEyebrow}>HOW IT WORKS</p>
        <h2 style={s.sectionTitle}>Three steps to your next flip</h2>

        <div style={s.steps}>
          {[
            { num: "01", icon: "📸", title: "Snap a photo", desc: "Point your camera at anything you find at Goodwill, an estate sale, or a flea market." },
            { num: "02", icon: "🤖", title: "AI analyzes it", desc: "Pricera identifies the item, brand, era, and checks current resale market prices in seconds." },
            { num: "03", icon: "💰", title: "Flip for profit", desc: "Get a price range, flip score, and the best platforms to sell on — ready to act immediately." },
          ].map((step, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepTop}>
                <span style={s.stepNum}>{step.num}</span>
                <span style={s.stepIcon}>{step.icon}</span>
              </div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={s.featuresSection}>
        <p style={s.sectionEyebrow}>FEATURES</p>
        <h2 style={s.sectionTitle}>Everything a flipper needs</h2>

        <div style={s.featureGrid}>
          {[
            { icon: "🔍", title: "Instant ID", desc: "AI identifies brand, era, category and condition from a single photo." },
            { icon: "💵", title: "Live Pricing", desc: "Real resale value ranges based on current market data across all major platforms." },
            { icon: "📍", title: "Where to Sell", desc: "Platform recommendations tailored to your specific item — not generic advice." },
            { icon: "⚡", title: "Flip Score", desc: "1–10 score that tells you instantly if an item is worth buying or leaving on the shelf." },
            { icon: "💡", title: "Pro Tips", desc: "Expert tips to maximize your sale price for every single find." },
            { icon: "📁", title: "Save Finds", desc: "Build your personal find history and track your potential portfolio value over time." },
          ].map((f, i) => (
            <div key={i} style={s.featureCard}>
              <span style={s.featureIcon}>{f.icon}</span>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who is it for */}
      <section style={s.forSection}>
        <p style={s.sectionEyebrow}>WHO IT'S FOR</p>
        <h2 style={s.sectionTitle}>Built for the thrifting community</h2>
        <div style={s.forGrid}>
          {[
            { emoji: "👕", label: "Clothing flippers" },
            { emoji: "🏺", label: "Antique hunters" },
            { emoji: "🎮", label: "Electronics resellers" },
            { emoji: "👟", label: "Sneaker flippers" },
            { emoji: "📚", label: "Book & media sellers" },
            { emoji: "🛋️", label: "Furniture flippers" },
          ].map((item, i) => (
            <div key={i} style={s.forCard}>
              <span style={s.forEmoji}>{item.emoji}</span>
              <span style={s.forLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow} />
        <div style={s.ctaInner}>
          <span style={s.ctaIcon}>◈</span>
          <h2 style={s.ctaTitle}>Ready to find your next flip?</h2>
          <p style={s.ctaSub}>Free to use. No signup required. Just snap and go.</p>
          <button style={s.ctaBtn} onClick={onEnter}>
            <span>📸</span> Start Scanning Now
          </button>
          <p style={s.ctaTagline}>Snap it. Price it. Flip it.</p>
        </div>
      </section>

      <footer style={s.footer}>
        <div style={s.footerLogo}>
          <span style={s.navIcon}>◈</span>
          <span style={s.navText}>Pricera</span>
        </div>
        <p style={s.footerText}>AI-powered resale intelligence for thrifters and flippers.</p>
        <p style={s.footerCopy}>© 2026 Pricera · Built with ♥ for the flipping community</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes gridMove { from { transform: translateY(0); } to { transform: translateY(40px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text, position: "relative", overflow: "hidden" },

  // Background
  grid: { position: "fixed", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3, zIndex: 0, animation: "gridMove 8s linear infinite alternate" },
  glow1: { position: "fixed", top: "-20%", left: "-20%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" },
  glow2: { position: "fixed", bottom: "-20%", right: "-20%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" },

  // Nav
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px", position: "relative", zIndex: 10 },
  navLogo: { display: "flex", alignItems: "center", gap: 8 },
  navIcon: { fontSize: 20, color: C.accent },
  navText: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" },
  navCta: { background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 20, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  // Hero
  hero: { padding: "40px 24px 48px", position: "relative", zIndex: 1, animation: "fadeUp 0.6s ease", textAlign: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: C.accentDim, border: `1px solid rgba(0,229,160,0.2)`, borderRadius: 20, padding: "6px 14px", marginBottom: 28 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "pulse 2s ease infinite", display: "block" },
  heroBadgeText: { fontSize: 12, color: C.accent, fontFamily: "'Syne', sans-serif", letterSpacing: "0.05em" },
  heroTitle: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 },
  heroTitleLine1: { fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, color: C.textMuted },
  heroTitleLine2: { fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, color: C.text },
  heroTitleLine3: { fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1, color: C.accent },
  heroSub: { fontSize: 15, color: C.textMuted, lineHeight: 1.6, marginBottom: 32, maxWidth: 360, margin: "0 auto 32px" },
  heroActions: { marginBottom: 40 },
  heroPrimary: { width: "100%", background: C.accent, color: "#000", border: "none", borderRadius: 14, padding: "18px 24px", fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 },
  heroNote: { fontSize: 12, color: C.textDim, textAlign: "center" },
  statsRow: { display: "flex", gap: 10 },
  statCard: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" },
  statCardNum: { display: "block", fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: C.accent, marginBottom: 4 },
  statCardLabel: { fontSize: 10, color: C.textDim, letterSpacing: "0.05em" },

  // How it works
  howSection: { padding: "48px 24px", position: "relative", zIndex: 1 },
  sectionEyebrow: { fontSize: 10, fontFamily: "'Syne', sans-serif", letterSpacing: "0.2em", color: C.accent, marginBottom: 12, textAlign: "center" },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 32, lineHeight: 1.2, textAlign: "center" },
  steps: { display: "flex", flexDirection: "column", gap: 16 },
  stepCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", textAlign: "center" },
  stepTop: { display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12 },
  stepNum: { fontFamily: "'Syne', sans-serif", fontSize: 12, color: C.textDim, letterSpacing: "0.1em" },
  stepIcon: { fontSize: 24 },
  stepTitle: { fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 8 },
  stepDesc: { fontSize: 14, color: C.textMuted, lineHeight: 1.5 },

  // Features
  featuresSection: { padding: "48px 24px", position: "relative", zIndex: 1 },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  featureCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 16px", textAlign: "center" },
  featureIcon: { fontSize: 24, display: "block", marginBottom: 10 },
  featureTitle: { fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 6 },
  featureDesc: { fontSize: 12, color: C.textMuted, lineHeight: 1.5 },

  // Who its for
  forSection: { padding: "48px 24px", position: "relative", zIndex: 1 },
  forGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  forCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  forEmoji: { fontSize: 22 },
  forLabel: { fontSize: 13, fontWeight: 500, color: C.textMuted },

  // CTA
  ctaSection: { padding: "48px 24px 64px", position: "relative", zIndex: 1, textAlign: "center" },
  ctaGlow: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80%", height: "80%", background: "radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  ctaInner: { position: "relative", zIndex: 1 },
  ctaIcon: { fontSize: 32, color: C.accent, display: "block", marginBottom: 16 },
  ctaTitle: { fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 12, lineHeight: 1.2 },
  ctaSub: { fontSize: 14, color: C.textMuted, marginBottom: 28, lineHeight: 1.5 },
  ctaBtn: { width: "100%", background: C.accent, color: "#000", border: "none", borderRadius: 14, padding: "18px 24px", fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 },
  ctaTagline: { fontSize: 13, color: C.textDim, letterSpacing: "0.05em" },

  // Footer
  footer: { padding: "32px 24px 48px", borderTop: `1px solid ${C.border}`, position: "relative", zIndex: 1, textAlign: "center" },
  footerLogo: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  footerText: { fontSize: 13, color: C.textMuted, marginBottom: 8, lineHeight: 1.5 },
  footerCopy: { fontSize: 11, color: C.textDim },
};
