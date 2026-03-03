import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

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

function Pricera() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
                { type: "text", text: "Analyze this thrift find for me. What is it worth and where should I sell it?" },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content.map((i) => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Couldn't analyze this image. Try a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  };

  const flipColor = (score) => {
    if (score >= 8) return "#00E5A0";
    if (score >= 5) return "#FFD166";
    return "#FF6B6B";
  };

  return (
    <div style={styles.root}>
      {/* Background texture */}
      <div style={styles.bgNoise} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Pricera</span>
        </div>
        <p style={styles.tagline}>Snap it. Price it. Flip it.</p>
      </header>

      <main style={styles.main}>
        {!image && !result && (
          <div style={styles.uploadSection}>
            <p style={styles.uploadLabel}>UPLOAD YOUR FIND</p>

            {/* Camera button - primary for mobile */}
            <button
              style={styles.cameraBtn}
              onClick={() => cameraInputRef.current?.click()}
            >
              <span style={styles.cameraBtnIcon}>📸</span>
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

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            {/* Drop zone */}
            <div
              style={{ ...styles.dropZone, ...(dragging ? styles.dropZoneActive : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <span style={styles.dropIcon}>⬆</span>
              <p style={styles.dropText}>Upload from gallery</p>
              <p style={styles.dropSub}>JPG, PNG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <div style={styles.exampleTags}>
              {["Vintage clothing", "Electronics", "Furniture", "Collectibles", "Shoes", "Art"].map(t => (
                <span key={t} style={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {image && !result && (
          <div style={styles.previewSection}>
            <div style={styles.previewWrapper}>
              <img src={image} alt="Your find" style={styles.previewImg} />
              <div style={styles.previewOverlay}>
                <span style={styles.previewLabel}>YOUR FIND</span>
              </div>
            </div>

            <div style={styles.previewActions}>
              {!loading ? (
                <>
                  <button style={styles.analyzeBtn} onClick={analyze}>
                    <span>✦</span> Analyze with AI
                  </button>
                  <button style={styles.retakeBtn} onClick={reset}>
                    Retake
                  </button>
                </>
              ) : (
                <div style={styles.loadingBox}>
                  <div style={styles.spinner} />
                  <p style={styles.loadingText}>Pricera is analyzing your find...</p>
                  <p style={styles.loadingSubtext}>Checking resale markets</p>
                </div>
              )}
            </div>
            {error && <p style={styles.errorText}>{error}</p>}
          </div>
        )}

        {result && (
          <div style={styles.resultSection}>
            {/* Item header */}
            <div style={styles.resultCard}>
              <div style={styles.resultTopRow}>
                <div>
                  <p style={styles.resultCategory}>{result.item.category?.toUpperCase()}</p>
                  <h2 style={styles.resultName}>{result.item.name}</h2>
                  {result.item.brand && result.item.brand !== "Unknown" && (
                    <p style={styles.resultBrand}>{result.item.brand} · {result.item.era}</p>
                  )}
                </div>
                <div style={{ ...styles.flipScoreBadge, borderColor: flipColor(result.flipScore) }}>
                  <span style={{ ...styles.flipScoreNum, color: flipColor(result.flipScore) }}>{result.flipScore}</span>
                  <span style={styles.flipScoreLabel}>/ 10</span>
                </div>
              </div>
              <p style={{ ...styles.flipVerdict, color: flipColor(result.flipScore) }}>
                ✦ {result.flipVerdict}
              </p>
            </div>

            {/* Price */}
            <div style={styles.priceCard}>
              <p style={styles.priceLabel}>ESTIMATED RESALE VALUE</p>
              <div style={styles.priceRow}>
                <span style={styles.priceMain}>${result.pricing.low} – ${result.pricing.high}</span>
                <span style={styles.priceConf}>{result.pricing.confidence} confidence</span>
              </div>
              <div style={styles.priceBar}>
                <div style={styles.priceBarFill} />
              </div>
            </div>

            {/* Platforms */}
            <div style={styles.platformsCard}>
              <p style={styles.sectionLabel}>WHERE TO SELL</p>
              {result.platforms.map((p, i) => (
                <div key={i} style={styles.platformRow}>
                  <span style={styles.platformEmoji}>{p.emoji}</span>
                  <div>
                    <p style={styles.platformName}>{p.name}</p>
                    <p style={styles.platformReason}>{p.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip */}
            <div style={styles.tipCard}>
              <p style={styles.tipLabel}>💡 PRO TIP</p>
              <p style={styles.tipText}>{result.proTip}</p>
            </div>

            {/* Condition */}
            <div style={styles.conditionRow}>
              <span style={styles.conditionLabel}>Condition estimate:</span>
              <span style={styles.conditionValue}>{result.item.condition}</span>
            </div>

            <button style={styles.newScanBtn} onClick={reset}>
              ✦ Scan Another Find
            </button>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>Pricera AI · Built for flippers</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<Pricera />);
}

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

const styles = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', sans-serif",
    color: C.text,
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
  },
  bgNoise: {
    position: "fixed",
    inset: 0,
    backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(0,229,160,0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(0,229,160,0.03) 0%, transparent 50%)`,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    padding: "32px 24px 16px",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logoIcon: {
    fontSize: 22,
    color: C.accent,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    color: C.text,
  },
  tagline: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: C.textMuted,
    letterSpacing: "0.05em",
    margin: 0,
  },
  main: {
    padding: "8px 20px 32px",
    position: "relative",
    zIndex: 1,
  },
  uploadSection: {
    animation: "fadeUp 0.4s ease",
  },
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
    letterSpacing: "-0.2px",
  },
  cameraBtnIcon: {
    fontSize: 20,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: C.border,
  },
  dividerText: {
    fontSize: 12,
    color: C.textDim,
    fontFamily: "'DM Sans', sans-serif",
  },
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
  dropZoneActive: {
    borderColor: C.accent,
    background: C.accentDim,
  },
  dropIcon: {
    fontSize: 28,
    color: C.textMuted,
    display: "block",
    marginBottom: 8,
  },
  dropText: {
    fontSize: 15,
    color: C.textMuted,
    margin: "0 0 4px",
  },
  dropSub: {
    fontSize: 12,
    color: C.textDim,
    margin: 0,
  },
  exampleTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: C.textMuted,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "5px 12px",
    background: C.surface,
  },
  previewSection: {
    animation: "fadeUp 0.3s ease",
  },
  previewWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
    aspectRatio: "4/3",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
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
  previewActions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
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
  loadingBox: {
    textAlign: "center",
    padding: "24px",
    background: C.surface,
    borderRadius: 16,
  },
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
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
  resultSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    animation: "fadeUp 0.4s ease",
  },
  resultCard: {
    background: C.surface,
    borderRadius: 16,
    padding: "20px",
    border: `1px solid ${C.border}`,
  },
  resultTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
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
  resultBrand: {
    fontSize: 13,
    color: C.textMuted,
    margin: 0,
  },
  flipScoreBadge: {
    border: "2px solid",
    borderRadius: 12,
    padding: "8px 12px",
    textAlign: "center",
    minWidth: 60,
    flexShrink: 0,
  },
  flipScoreNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    display: "block",
    lineHeight: 1,
  },
  flipScoreLabel: {
    fontSize: 10,
    color: C.textDim,
  },
  flipVerdict: {
    fontSize: 13,
    fontWeight: 500,
    margin: 0,
  },
  priceCard: {
    background: C.surface,
    borderRadius: 16,
    padding: "20px",
    border: `1px solid ${C.border}`,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.15em",
    color: C.textMuted,
    margin: "0 0 8px",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 12,
  },
  priceMain: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    color: C.accent,
    letterSpacing: "-0.5px",
  },
  priceConf: {
    fontSize: 12,
    color: C.textMuted,
    background: C.surfaceHigh,
    padding: "3px 8px",
    borderRadius: 20,
  },
  priceBar: {
    height: 3,
    background: C.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  priceBarFill: {
    height: "100%",
    width: "70%",
    background: `linear-gradient(90deg, ${C.accent}, rgba(0,229,160,0.3))`,
    borderRadius: 4,
  },
  platformsCard: {
    background: C.surface,
    borderRadius: 16,
    padding: "20px",
    border: `1px solid ${C.border}`,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.15em",
    color: C.textMuted,
    margin: "0 0 14px",
  },
  platformRow: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  platformEmoji: {
    fontSize: 22,
    flexShrink: 0,
    marginTop: 1,
  },
  platformName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    margin: "0 0 2px",
  },
  platformReason: {
    fontSize: 13,
    color: C.textMuted,
    margin: 0,
    lineHeight: 1.4,
  },
  tipCard: {
    background: C.accentDim,
    border: `1px solid rgba(0,229,160,0.2)`,
    borderRadius: 16,
    padding: "16px 20px",
  },
  tipLabel: {
    fontSize: 11,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.1em",
    color: C.accent,
    margin: "0 0 6px",
  },
  tipText: {
    fontSize: 14,
    color: C.text,
    margin: 0,
    lineHeight: 1.5,
  },
  conditionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: C.surface,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
  },
  conditionLabel: {
    fontSize: 13,
    color: C.textMuted,
  },
  conditionValue: {
    fontSize: 13,
    fontWeight: 600,
    color: C.text,
    fontFamily: "'Syne', sans-serif",
  },
  newScanBtn: {
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
    marginTop: 4,
    letterSpacing: "-0.2px",
  },
  footer: {
    padding: "16px 24px 32px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  footerText: {
    fontSize: 12,
    color: C.textDim,
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
};
