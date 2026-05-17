import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ShoppingCart } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { purchaseSample, submitTransaction, stroopsToXlm } from "../contracts/crate";
import type { SampleData } from "../contracts/crate";
import toast from "react-hot-toast";

interface SampleCardProps {
  sample: SampleData;
  onPurchased?: () => void;
}

export default function SampleCard({ sample, onPurchased }: SampleCardProps) {
  const { address, isConnected, connect, signTransaction } = useWallet();
  const [buying, setBuying] = useState(false);

  const priceXlm = stroopsToXlm(sample.price);
  const shortAddress = `${sample.uploader.slice(0, 8)}...${sample.uploader.slice(-4)}`;

  async function handleBuy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isConnected || !address) {
      await connect();
      return;
    }

    setBuying(true);
    const toastId = toast.loading("Processing purchase...");
    try {
      const xdr = await purchaseSample({ buyer: address, sampleId: sample.id });
      const signed = await signTransaction(xdr);
      const hash = await submitTransaction(signed);
      toast.success(`Purchased! Tx: ${hash.slice(0, 10)}...`, { id: toastId });
      onPurchased?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed", { id: toastId });
    } finally {
      setBuying(false);
    }
  }

  return (
    <Link to={`/sample/${sample.id.toString()}`} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={{
          padding: "0",
          overflow: "hidden",
          transition: "border-color 0.15s, transform 0.15s",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--accent)";
          el.style.transform = "translateY(-3px)";
          el.style.boxShadow = "0 8px 24px rgba(250, 204, 21, 0.1)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Beat art */}
        <div
          style={{
            height: "140px",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Waveform decorative bars */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px", opacity: 0.3 }}>
            {[20, 35, 15, 45, 30, 50, 25, 40, 20, 35, 15, 45].map((h, i) => (
              <div
                key={i}
                style={{
                  width: "3px",
                  height: `${h}px`,
                  background: "var(--accent)",
                  borderRadius: "2px",
                }}
              />
            ))}
          </div>

          {/* Play button */}
          <div
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(10, 10, 10, 0.85)",
              border: "1px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Play size={14} fill="var(--accent)" color="var(--accent)" style={{ marginLeft: 2 }} />
          </div>

          {/* Genre badge */}
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span className="badge badge-yellow">{sample.genre}</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "3px",
                }}
              >
                {sample.title}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {shortAddress}
              </div>
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--accent)",
                flexShrink: 0,
                marginLeft: "8px",
              }}
            >
              {priceXlm} XLM
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {sample.bpm} BPM · {sample.sales_count.toString()} sales
            </div>
          </div>

          {/* Buy button */}
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "4px" }}
            onClick={handleBuy}
            disabled={buying || !sample.active}
          >
            <ShoppingCart size={13} />
            {buying ? "Processing..." : "Buy"}
          </button>
        </div>
      </div>
    </Link>
  );
}
