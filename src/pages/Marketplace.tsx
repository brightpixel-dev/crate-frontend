import { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import SampleCard from "../components/SampleCard";
import { useWallet } from "../hooks/useWallet";
import { getSample, getStats } from "../contracts/sampled";
import { stroopsToXlm } from "../contracts/sampled";
import type { SampleData } from "../contracts/sampled";
import toast from "react-hot-toast";

const GENRES = ["All", "Hip-Hop", "Trap", "Lo-Fi", "R&B", "Drill", "Afrobeats", "Pop"];

// Demo data for when wallet is not connected
const DEMO_SAMPLES: SampleData[] = [
  {
    id: 1n,
    uploader: "GBVKN4YTR3BFNCBQ5KWZOXJGTYUOOVKV7HBQPFZ5N7M5YZQE6RPDWKL",
    title: "Midnight Trap Vol.1",
    ipfs_cid: "QmYwAPJzv5CZsnAzt8auV39s1XR1gjbn3dp5e2B84Q5D7J",
    price: 120_000_000n,
    genre: "Trap",
    bpm: 140,
    sales_count: 42n,
    active: true,
  },
  {
    id: 2n,
    uploader: "GBLQ7VN5LXQVX5QQFPWSF7BZJFKBM5KXQJXMCZN3JFPFDJQMKBHZQBT",
    title: "Lo-Fi Study Session",
    ipfs_cid: "QmZbH4KgmzQT3N8F7XvYj9Dk2Pb5BQRS8HNnLxT1MNPQ",
    price: 80_000_000n,
    genre: "Lo-Fi",
    bpm: 85,
    sales_count: 128n,
    active: true,
  },
  {
    id: 3n,
    uploader: "GBLQ7VN5LXQVX5QQFPWSF7BZJFKBM5KXQJXMCZN3JFPFDJQMKBHZQBT",
    title: "808 Summer",
    ipfs_cid: "QmT3N8vYj9Dk2Pb5BQRS8HNnLxT1MNPQH4KgmzQZbP3F7",
    price: 150_000_000n,
    genre: "Hip-Hop",
    bpm: 92,
    sales_count: 67n,
    active: true,
  },
  {
    id: 4n,
    uploader: "GCLN4YTR3BFNCBQ5KWZOXJGTYUOOVKV7HBQPFZ5N7M5YZQE6RPDWKL",
    title: "Afroswing Nights",
    ipfs_cid: "QmXP3F7N8vYj9Dk2Pb5BQRS8HNnLxT1MNH4KgmzQZbTq",
    price: 100_000_000n,
    genre: "Afrobeats",
    bpm: 95,
    sales_count: 23n,
    active: true,
  },
  {
    id: 5n,
    uploader: "GBVKN4YTR3BFNCBQ5KWZOXJGTYUOOVKV7HBQPFZ5N7M5YZQE6RPDWKL",
    title: "Drill Season EP",
    ipfs_cid: "QmH4KgmzQZbT3N8vYj9Dk2Pb5BQRS8HNnLxT1MNPqF7Xp",
    price: 200_000_000n,
    genre: "Drill",
    bpm: 135,
    sales_count: 15n,
    active: true,
  },
  {
    id: 6n,
    uploader: "GCLN4YTR3BFNCBQ5KWZOXJGTYUOOVKV7HBQPFZ5N7M5YZQE6RPDWKL",
    title: "R&B Frequencies",
    ipfs_cid: "QmDk2Pb5BQRS8HNnLxT1MNH4KgmzQZbT3N8vYj9XP3F7p",
    price: 90_000_000n,
    genre: "R&B",
    bpm: 78,
    sales_count: 91n,
    active: true,
  },
];

export default function Marketplace() {
  const { address } = useWallet();
  const [samples, setSamples] = useState<SampleData[]>(DEMO_SAMPLES);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "popular">("popular");
  const [stats, setStats] = useState<{ totalSamples: bigint; totalVolume: bigint } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadFromChain();
    }
  }, [address]);

  async function loadFromChain() {
    if (!address) return;
    setLoading(true);
    try {
      const s = await getStats(address);
      if (s) setStats(s);
      // Load the first 10 samples from chain
      const loaded: SampleData[] = [];
      for (let i = 1n; i <= Math.min(s?.totalSamples ?? 6n, 10n); i++) {
        const sample = await getSample(address, i);
        if (sample && sample.active) loaded.push(sample);
      }
      if (loaded.length > 0) setSamples(loaded);
    } catch (err) {
      toast.error("Failed to load marketplace from chain");
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort
  const filtered = samples
    .filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.genre.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = selectedGenre === "All" || s.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return Number(a.price - b.price);
      if (sortBy === "price_desc") return Number(b.price - a.price);
      return Number(b.sales_count - a.sales_count);
    });

  return (
    <main className="container" style={{ paddingTop: "40px", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Marketplace</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          {stats
            ? `${stats.totalSamples.toString()} samples — ${stroopsToXlm(stats.totalVolume)} XLM total volume`
            : `${samples.length} samples available`}
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "240px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search beats, genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <select
          className="input"
          style={{ width: "auto", minWidth: "160px" }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Genre pills */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            style={{
              padding: "6px 14px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              border: `1px solid ${selectedGenre === g ? "var(--accent)" : "var(--border)"}`,
              background: selectedGenre === g ? "rgba(250, 204, 21, 0.1)" : "transparent",
              color: selectedGenre === g ? "var(--accent)" : "var(--text-secondary)",
              transition: "all 0.15s",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "280px", borderRadius: "var(--radius-lg)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
          <Music2 size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <div style={{ fontSize: "16px" }}>No beats found</div>
          <div style={{ fontSize: "13px", marginTop: 6 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((sample) => (
            <SampleCard key={sample.id.toString()} sample={sample} />
          ))}
        </div>
      )}
    </main>
  );
}

// Local icon import (lucide-react)
function Music2({ size, style }: { size: number; style?: React.CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
}
