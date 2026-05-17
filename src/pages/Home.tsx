import { Link } from "react-router-dom";
import { Zap, Music2, DollarSign, Shield, ArrowRight, Play } from "lucide-react";

const STATS = [
  { label: "Total Samples", value: "2,400+" },
  { label: "Producers Paid", value: "340+" },
  { label: "Settlement Time", value: "5 sec" },
  { label: "Producer Cut", value: "90%" },
];

const FEATURED = [
  { id: "1", title: "Midnight Trap", producer: "OG Beats", genre: "Trap", bpm: 140, price: 12, plays: 820 },
  { id: "2", title: "Lo-Fi Study Session", producer: "chillwav3", genre: "Lo-Fi", bpm: 85, price: 8, plays: 1340 },
  { id: "3", title: "808 Summer", producer: "BassKing", genre: "Hip-Hop", bpm: 92, price: 15, plays: 560 },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect Wallet",
    desc: "Connect your Freighter wallet to authenticate on Stellar testnet.",
  },
  {
    step: "02",
    title: "Upload or Browse",
    desc: "Producers upload beats to IPFS. Buyers browse the marketplace.",
  },
  {
    step: "03",
    title: "Instant Settlement",
    desc: "Payments settle in 5 seconds via Soroban smart contract. 90% straight to you.",
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        className="container animate-fade-in"
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          textAlign: "center",
        }}
      >
        <div
          className="badge badge-yellow"
          style={{ marginBottom: "20px", display: "inline-flex" }}
        >
          <Zap size={11} style={{ marginRight: 4 }} />
          Live on Stellar Testnet
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            color: "var(--text-primary)",
            maxWidth: "800px",
            margin: "0 auto 24px",
          }}
        >
          The marketplace where producers
          <br />
          <span style={{ color: "var(--accent)" }}>get paid instantly.</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Buy and sell beats and samples peer-to-peer on Stellar. Smart
          contract enforces 90/10 splits. Settlement in under 5 seconds.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/marketplace" className="btn btn-primary btn-lg">
            Browse Marketplace
            <ArrowRight size={16} />
          </Link>
          <Link to="/upload" className="btn btn-secondary btn-lg">
            Upload a Beat
          </Link>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            padding: "32px 24px",
            gap: "16px",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--accent)",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Beats ─────────────────────────────────── */}
      <section className="container" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Featured Beats</h2>
          <Link
            to="/marketplace"
            style={{ fontSize: "14px", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {FEATURED.map((beat) => (
            <Link to={`/sample/${beat.id}`} key={beat.id} style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  padding: "20px",
                  transition: "border-color 0.15s, transform 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {/* Beat art placeholder */}
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius)",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(250, 204, 21, 0.15)",
                      border: "1px solid var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={18} fill="var(--accent)" color="var(--accent)" style={{ marginLeft: 2 }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: 2 }}>{beat.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      @{beat.producer}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent)" }}>
                      {beat.price} XLM
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <span className="badge badge-yellow">{beat.genre}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {beat.bpm} BPM
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            How It Works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "32px",
            }}
          >
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: "10px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {step.step}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────── */}
      <section className="container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              icon: <Zap size={20} color="var(--accent)" />,
              title: "5-Second Settlement",
              desc: "Stellar finalizes in under 5 seconds. No waiting, no escrow delays.",
            },
            {
              icon: <DollarSign size={20} color="var(--accent)" />,
              title: "90% to Producers",
              desc: "Smart contract enforces the split on-chain. Platform takes 10%, always.",
            },
            {
              icon: <Music2 size={20} color="var(--accent)" />,
              title: "IPFS Storage",
              desc: "Files stored on IPFS via Pinata. Permanent, decentralized, yours.",
            },
            {
              icon: <Shield size={20} color="var(--accent)" />,
              title: "Non-Custodial",
              desc: "Your keys, your funds. Freighter wallet. We never hold your XLM.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="card"
              style={{ padding: "24px" }}
            >
              <div style={{ marginBottom: "12px" }}>{f.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{f.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
