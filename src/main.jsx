import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import LandingPage from "../LandingPage.jsx";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are Pricera, an AI-powered resale intelligence assistant for thrifters and flippers. 

When a user uploads a photo of an item they found thrifting, you will:

1. **IDENTIFY** the item — brand, model, era, category, condition estimate
2. **PRICE IT** — give a realistic resale value range based on current market (be specific, give low/high range)
3. **WHERE TO SELL** — recommend the best 2-3 platforms for THIS specific item with reasoning
4. **FLIP SCORE** — give a score from 1-10 on how good of a flip this could be
5. **PRO TIP** — one actionable tip to maximize the sale price

Format your response as JSON only, no markdown, no extra text:
{
  "item": {
    "name": "Item name",
    "brand": "Brand if identifiable",
    "era": "Decade/era",
    "category": "Category",
    "condition": "Estimated condition"
  },
  "pricing": {
    "low": 00,
    "high": 00,
    "currency": "USD",
    "confidence": "low|medium|high"
  },
  "platforms": [
    {"name": "Platform name", "reason": "Why this platform", "emoji": "emoji"},
    {"name": "Platform name", "reason": "Why this platform", "emoji": "emoji"}
  ],
  "flipScore": 7,
  "flipVerdict": "Short one-line verdict on this flip",
  "proTip": "One actionable tip to maximize sale price"
}`;

const PAGES = { SCAN: "scan", RESULT: "result", FINDS: "finds", DETAIL: "detail" };

const C = {
  bg: "#0A0A0A",
  surface: "#141414",
  surfaceHigh: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#00E5A0",
  accentDim: "rgba(0,229,160,0.1)",
  text: "#F0F0F0",
  textMuted: "#888",
  textDim: "#555",
};

function Pricera() {
  const [page, setPage] = useState(PAGES.SCAN);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [finds, setFinds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pricera_finds") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedFind, setSelectedFind] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("pricera_finds", JSON.stringify(finds));
  }, [finds]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    if (!ANTHROPIC_API_KEY) {
      setError("Missing API key. Set VITE_ANTHROPIC_API_KEY in your .env and restart the dev server.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
                },
                {
                  type: "text",
                  text: "Analyze this thrift find for me. What is it worth and where should I sell it?",
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content.map((i) => i.text || "").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setPage(PAGES.RESULT);
    } catch (err) {
      setError("Couldn't analyze this image. Try a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  const saveFind = () => {
    const find = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      image,
      result,
    };
    setFinds((prev) => [find, ...prev]);
  };

  const deleteFind = (id) => {
    setFinds((prev) => prev.filter((find) => find.id !== id));
    setPage(PAGES.FINDS);
    setSelectedFind(null);
  };

  const reset = () => {
    setImage(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    setPage(PAGES.SCAN);
  };

  const flipColor = (score) => {
    if (score >= 8) return "#00E5A0";
    if (score >= 5) return "#FFD166";
    return "#FF6B6B";
  };

  const totalValue = finds.reduce((sum, find) => sum + (find.result?.pricing?.high || 0), 0);
  const avgScore = finds.length > 0
    ? Math.round((finds.reduce((sum, find) => sum + (find.result?.flipScore || 0), 0) / finds.length) * 10) / 10
    : 0;

  return (
    <div style={s.root}>
      <div style={s.bgNoise} />

      <header style={s.header}>
        <div style={s.headerRow}>
          <div style={s.logo} onClick={reset}>
            <span style={s.logoIcon}>◈</span>
            <span style={s.logoText}>Pricera</span>
          </div>
          <button style={s.findsBtn} onClick={() => setPage(PAGES.FINDS)}>
            <span>📁</span>
            <span style={s.findsBtnText}>My Finds</span>
            {finds.length > 0 && <span style={s.findsBadge}>{finds.length}</span>}
          </button>
        </div>
        {page === PAGES.SCAN && <p style={s.tagline}>Snap it. Price it. Flip it.</p>}
      </header>

      <main style={s.main}>
        {page === PAGES.SCAN && !image && (
          <div style={s.uploadSection}>
            <p style={s.uploadLabel}>UPLOAD YOUR FIND</p>
            <button style={s.cameraBtn} onClick={() => cameraInputRef.current?.click()}>
              <span>📸</span>
              <span>Take a Photo</span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div style={s.divider}>
              <span style={s.dividerLine} />
              <span style={s.dividerText}>or</span>
              <span style={s.dividerLine} />
            </div>
            <div
              style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <span style={s.dropIcon}>⬆</span>
              <p style={s.dropText}>Upload from gallery</p>
              <p style={s.dropSub}>JPG, PNG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
            <div style={s.exampleTags}>
              {["Vintage clothing", "Electronics", "Furniture", "Collectibles", "Shoes", "Art"].map((tag) => (
                <span key={tag} style={s.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {page === PAGES.SCAN && image && (
          <div style={s.previewSection}>
            <div style={s.previewWrapper}>
              <img src={image} alt="Your find" style={s.previewImg} />
              <div style={s.previewOverlay}>
                <span style={s.previewLabel}>YOUR FIND</span>
              </div>
            </div>
            <div style={s.previewActions}>
              {!loading ? (
                <>
                  <button style={s.analyzeBtn} onClick={analyze}>
                    <span>✦</span> Analyze with AI
                  </button>
                  <button style={s.retakeBtn} onClick={reset}>Retake</button>
                </>
              ) : (
                <SkeletonResult />
              )}
            </div>
            {error && <p style={s.errorText}>{error}</p>}
          </div>
        )}

        {page === PAGES.RESULT && result && (
          <ResultView
            image={image}
            result={result}
            onSave={() => {
              saveFind();
              setPage(PAGES.FINDS);
            }}
            onReset={reset}
            flipColor={flipColor}
            showSave={true}
          />
        )}

        {page === PAGES.FINDS && (
          <div style={s.findsSection}>
            <div style={s.findsHeader}>
              <button style={s.backBtn} onClick={reset}>← Back</button>
              <h2 style={s.findsTitle}>My Finds</h2>
              <span style={s.findsCount}>{finds.length} items</span>
            </div>

            {finds.length > 0 && (
              <div style={s.statsBar}>
                <div style={s.statItem}>
                  <span style={s.statNum}>{finds.length}</span>
                  <span style={s.statLabel}>FINDS</span>
                </div>
                <div style={s.statDivider} />
                <div style={s.statItem}>
                  <span style={s.statNum}>${totalValue}</span>
                  <span style={s.statLabel}>MAX VALUE</span>
                </div>
                <div style={s.statDivider} />
                <div style={s.statItem}>
                  <span style={s.statNum}>{avgScore}</span>
                  <span style={s.statLabel}>AVG SCORE</span>
                </div>
              </div>
            )}

            {finds.length === 0 ? (
              <div style={s.emptyState}>
                <span style={s.emptyIcon}>🔍</span>
                <p style={s.emptyText}>No finds yet</p>
                <p style={s.emptySub}>Scan your first thrift find to get started</p>
                <button style={s.emptyCta} onClick={reset}>Start Scanning</button>
              </div>
            ) : (
              <div style={s.findsList}>
                {finds.map((find) => (
                  <div
                    key={find.id}
                    style={s.findCard}
                    onClick={() => {
                      setSelectedFind(find);
                      setPage(PAGES.DETAIL);
                    }}
                  >
                    <img src={find.image} alt={find.result.item.name} style={s.findCardImg} />
                    <div style={s.findCardInfo}>
                      <p style={s.findCardCategory}>{find.result.item.category?.toUpperCase()}</p>
                      <p style={s.findCardName}>{find.result.item.name}</p>
                      {find.result.item.brand && find.result.item.brand !== "Unknown" && (
                        <p style={s.findCardBrand}>{find.result.item.brand}</p>
                      )}
                      <div style={s.findCardBottom}>
                        <span style={s.findCardPrice}>
                          ${find.result.pricing.low}–${find.result.pricing.high}
                        </span>
                        <span style={{ ...s.findCardScore, color: flipColor(find.result.flipScore) }}>
                          ✦ {find.result.flipScore}/10
                        </span>
                      </div>
                      <p style={s.findCardDate}>{find.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === PAGES.DETAIL && selectedFind && (
          <div style={s.resultSection}>
            <div style={s.findsHeader}>
              <button style={s.backBtn} onClick={() => setPage(PAGES.FINDS)}>← Back</button>
              <h2 style={s.findsTitle}>Find Detail</h2>
              <button style={s.deleteBtn} onClick={() => deleteFind(selectedFind.id)}>🗑</button>
            </div>
            <ResultView
              image={selectedFind.image}
              result={selectedFind.result}
              date={selectedFind.date}
              onReset={reset}
              flipColor={flipColor}
              showSave={false}
            />
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <p style={s.footerText}>Pricera AI · Built for flippers</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        .skel { background: linear-gradient(90deg, #1E1E1E 25%, #2A2A2A 50%, #1E1E1E 75%); background-size: 200% 100%; animation: shimmer 1.4s ease infinite; border-radius: 8px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0A0A0A; }
      `}</style>
    </div>
  );
}

function SkeletonResult() {
  const sk = (w, h, extra = {}) => (
    <div className="skel" style={{ width: w, height: h, borderRadius: 8, ...extra }} />
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.3s ease" }}>
      {/* image placeholder */}
      <div className="skel" style={{ width: "100%", aspectRatio: "16/9", borderRadius: 16 }} />
      {/* item card */}
      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {sk("40%", 10)}
            {sk("70%", 20)}
            {sk("50%", 10)}
          </div>
          <div className="skel" style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0, marginLeft: 12 }} />
        </div>
        {sk("80%", 10)}
      </div>
      {/* price card */}
      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {sk("35%", 10)}
        {sk("55%", 28)}
        {sk("100%", 3)}
      </div>
      {/* platforms card */}
      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {sk("30%", 10)}
        {[0, 1].map(i => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div className="skel" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {sk("40%", 12)}
              {sk("90%", 10)}
            </div>
          </div>
        ))}
      </div>
      {/* tip card */}
      <div style={{ background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: 16, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {sk("20%", 10)}
        {sk("100%", 10)}
        {sk("75%", 10)}
      </div>
    </div>
  );
}

function ResultView({ image, result, date, onSave, onReset, flipColor, showSave }) {
  return (
    <div style={s.resultSection}>
      <div style={s.resultImgWrapper}>
        <img src={image} alt="Find" style={s.resultImg} />
        <div style={s.resultImgOverlay}>
          <span style={s.resultImgLabel}>{date || "YOUR FIND"}</span>
        </div>
      </div>

      <div style={s.resultCard}>
        <div style={s.resultTopRow}>
          <div style={{ flex: 1 }}>
            <p style={s.resultCategory}>{result.item.category?.toUpperCase()}</p>
            <h2 style={s.resultName}>{result.item.name}</h2>
            {result.item.brand && result.item.brand !== "Unknown" && (
              <p style={s.resultBrand}>
                {result.item.brand} · {result.item.era}
              </p>
            )}
          </div>
          <div style={{ ...s.flipScoreBadge, borderColor: flipColor(result.flipScore) }}>
            <span style={{ ...s.flipScoreNum, color: flipColor(result.flipScore) }}>
              {result.flipScore}
            </span>
            <span style={s.flipScoreLabel}>/ 10</span>
          </div>
        </div>
        <p style={{ ...s.flipVerdict, color: flipColor(result.flipScore) }}>
          ✦ {result.flipVerdict}
        </p>
      </div>

      <div style={s.priceCard}>
        <p style={s.priceLabel}>ESTIMATED RESALE VALUE</p>
        <div style={s.priceRow}>
          <span style={s.priceMain}>
            ${result.pricing.low} – ${result.pricing.high}
          </span>
          <span style={s.priceConf}>{result.pricing.confidence} confidence</span>
        </div>
        <div style={s.priceBar}>
          <div style={s.priceBarFill} />
        </div>
      </div>

      <div style={s.platformsCard}>
        <p style={s.sectionLabel}>WHERE TO SELL</p>
        {result.platforms.map((platform, index) => (
          <div key={index} style={s.platformRow}>
            <span style={s.platformEmoji}>{platform.emoji}</span>
            <div>
              <p style={s.platformName}>{platform.name}</p>
              <p style={s.platformReason}>{platform.reason}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={s.tipCard}>
        <p style={s.tipLabel}>💡 PRO TIP</p>
        <p style={s.tipText}>{result.proTip}</p>
      </div>

      <div style={s.conditionRow}>
        <span style={s.conditionLabel}>Condition estimate:</span>
        <span style={s.conditionValue}>{result.item.condition}</span>
      </div>

      {showSave && (
        <button style={s.saveBtn} onClick={onSave}>💾 Save This Find</button>
      )}
      <button style={s.newScanBtn} onClick={onReset}>✦ Scan Another Find</button>
    </div>
  );
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;
  return <Pricera />;
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}

const s = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', sans-serif",
    color: C.text,
    position: "relative",
  },
  bgNoise: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 20% 50%, rgba(0,229,160,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,229,160,0.03) 0%, transparent 50%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: { padding: "32px 24px 16px", position: "relative", zIndex: 1 },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logo: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  logoIcon: { fontSize: 22, color: C.accent },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  tagline: { fontSize: 13, color: C.textMuted, letterSpacing: "0.05em", margin: 0 },
  findsBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "8px 14px",
    cursor: "pointer",
    color: C.text,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
  },
  findsBtnText: { fontSize: 13, color: C.textMuted },
  findsBadge: {
    background: C.accent,
    color: "#000",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    fontFamily: "'Syne', sans-serif",
  },
  main: { padding: "8px 20px 32px", position: "relative", zIndex: 1 },
  uploadSection: { animation: "fadeUp 0.4s ease" },
  uploadLabel: {
    fontSize: 11,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.15em",
    color: C.textDim,
    marginBottom: 16,
  },
  cameraBtn: {
    width: "100%",
    background: C.accent,
    color: "#000",
    border: "none",
    borderRadius: 14,
    padding: "18px 24px",
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  divider: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, background: C.border },
  dividerText: { fontSize: 12, color: C.textDim },
  dropZone: {
    border: `1.5px dashed ${C.border}`,
    borderRadius: 14,
    padding: "32px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: C.surface,
    marginBottom: 24,
  },
  dropZoneActive: { borderColor: C.accent, background: C.accentDim },
  dropIcon: { fontSize: 28, color: C.textMuted, display: "block", marginBottom: 8 },
  dropText: { fontSize: 15, color: C.textMuted, margin: "0 0 4px" },
  dropSub: { fontSize: 12, color: C.textDim, margin: 0 },
  exampleTags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    fontSize: 12,
    color: C.textMuted,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "5px 12px",
    background: C.surface,
  },
  previewSection: { animation: "fadeUp 0.3s ease" },
  previewWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
    aspectRatio: "4/3",
  },
  previewImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  previewOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    borderRadius: 8,
    padding: "4px 10px",
  },
  previewLabel: {
    fontSize: 10,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.15em",
    color: C.accent,
    margin: 0,
  },
  previewActions: { display: "flex", flexDirection: "column", gap: 10 },
  analyzeBtn: {
    width: "100%",
    background: C.accent,
    color: "#000",
    border: "none",
    borderRadius: 14,
    padding: "18px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retakeBtn: {
    width: "100%",
    background: "transparent",
    color: C.textMuted,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "14px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingBox: { textAlign: "center", padding: "24px", background: C.surface, borderRadius: 16 },
  spinner: {
    width: 36,
    height: 36,
    border: `2.5px solid ${C.border}`,
    borderTopColor: C.accent,
    borderRadius: "50%",
    margin: "0 auto 16px",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 15,
    color: C.text,
    margin: "0 0 4px",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
  },
  loadingSubtext: {
    fontSize: 13,
    color: C.textMuted,
    margin: 0,
    animation: "pulse 1.5s ease infinite",
  },
  errorText: { color: "#FF6B6B", fontSize: 13, textAlign: "center", marginTop: 12 },
  resultSection: { display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s ease" },
  resultImgWrapper: { borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "16/9" },
  resultImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  resultImgOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    borderRadius: 8,
    padding: "4px 10px",
  },
  resultImgLabel: {
    fontSize: 10,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.15em",
    color: C.accent,
    margin: 0,
  },
  resultCard: { background: C.surface, borderRadius: 16, padding: "20px", border: `1px solid ${C.border}` },
  resultTopRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  resultCategory: {
    fontSize: 10,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.15em",
    color: C.textMuted,
    margin: "0 0 4px",
  },
  resultName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 20,
    fontWeight: 800,
    margin: "0 0 4px",
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  },
  resultBrand: { fontSize: 13, color: C.textMuted, margin: 0 },
  flipScoreBadge: { border: "2px solid", borderRadius: 12, padding: "8px 12px", textAlign: "center", minWidth: 60, flexShrink: 0 },
  flipScoreNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    display: "block",
    lineHeight: 1,
  },
  flipScoreLabel: { fontSize: 10, color: C.textDim },
  flipVerdict: { fontSize: 13, fontWeight: 500, margin: 0 },
  priceCard: { background: C.surface, borderRadius: 16, padding: "20px", border: `1px solid ${C.border}` },
  priceLabel: { fontSize: 10, fontFamily: "'Syne', sans-serif", letterSpacing: "0.15em", color: C.textMuted, margin: "0 0 8px" },
  priceRow: { display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 },
  priceMain: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: C.accent, letterSpacing: "-0.5px" },
  priceConf: { fontSize: 12, color: C.textMuted, background: C.surfaceHigh, padding: "3px 8px", borderRadius: 20 },
  priceBar: { height: 3, background: C.border, borderRadius: 4, overflow: "hidden" },
  priceBarFill: { height: "100%", width: "70%", background: `linear-gradient(90deg, ${C.accent}, rgba(0,229,160,0.3))`, borderRadius: 4 },
  platformsCard: { background: C.surface, borderRadius: 16, padding: "20px", border: `1px solid ${C.border}` },
  sectionLabel: { fontSize: 10, fontFamily: "'Syne', sans-serif", letterSpacing: "0.15em", color: C.textMuted, margin: "0 0 14px" },
  platformRow: { display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 },
  platformEmoji: { fontSize: 22, flexShrink: 0, marginTop: 1 },
  platformName: { fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, margin: "0 0 2px" },
  platformReason: { fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.4 },
  tipCard: { background: C.accentDim, border: `1px solid rgba(0,229,160,0.2)`, borderRadius: 16, padding: "16px 20px" },
  tipLabel: { fontSize: 11, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", color: C.accent, margin: "0 0 6px" },
  tipText: { fontSize: 14, color: C.text, margin: 0, lineHeight: 1.5 },
  conditionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: C.surface,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
  },
  conditionLabel: { fontSize: 13, color: C.textMuted },
  conditionValue: { fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "'Syne', sans-serif" },
  saveBtn: {
    width: "100%",
    background: C.accent,
    color: "#000",
    border: "none",
    borderRadius: 14,
    padding: "18px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
  },
  newScanBtn: {
    width: "100%",
    background: "transparent",
    color: C.textMuted,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "14px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  findsSection: { animation: "fadeUp 0.3s ease" },
  findsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: {
    background: "none",
    border: "none",
    color: C.textMuted,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
  },
  findsTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, margin: 0 },
  findsCount: {
    fontSize: 12,
    color: C.textMuted,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "3px 10px",
  },
  deleteBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 0 },
  statsBar: {
    display: "flex",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  statNum: { fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: C.accent },
  statLabel: { fontSize: 9, color: C.textMuted, letterSpacing: "0.1em" },
  statDivider: { width: 1, height: 32, background: C.border },
  findsList: { display: "flex", flexDirection: "column", gap: 12 },
  findCard: { display: "flex", gap: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12, cursor: "pointer" },
  findCardImg: { width: 80, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0 },
  findCardInfo: { flex: 1, minWidth: 0 },
  findCardCategory: {
    fontSize: 9,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.12em",
    color: C.textDim,
    margin: "0 0 2px",
  },
  findCardName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    margin: "0 0 2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  findCardBrand: { fontSize: 12, color: C.textMuted, margin: "0 0 6px" },
  findCardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  findCardPrice: { fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: C.accent },
  findCardScore: { fontSize: 12, fontWeight: 600, fontFamily: "'Syne', sans-serif" },
  findCardDate: { fontSize: 11, color: C.textDim, margin: 0 },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: 48, display: "block", marginBottom: 16 },
  emptyText: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 8px" },
  emptySub: { fontSize: 14, color: C.textMuted, margin: "0 0 24px" },
  emptyCta: {
    background: C.accent,
    color: "#000",
    border: "none",
    borderRadius: 14,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
  },
  footer: { padding: "16px 24px 32px", textAlign: "center", position: "relative", zIndex: 1 },
  footerText: { fontSize: 12, color: C.textDim, margin: 0 },
};
