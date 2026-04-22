"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";

interface WatchlistButtonProps {
  tmdbId: string | number;
  type: "movie" | "tv";
  initialInWatchlist?: boolean;
}

export function WatchlistButton({ tmdbId, type, initialInWatchlist = false }: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [loading, setLoading] = useState(false);

  const toggleWatchlist = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (inWatchlist) {
        await fetch("/api/watchlist", {
          method: "DELETE",
          body: JSON.stringify({ tmdbId: String(tmdbId), type }),
          headers: { "Content-Type": "application/json" }
        });
        setInWatchlist(false);
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          body: JSON.stringify({ tmdbId: String(tmdbId), type }),
          headers: { "Content-Type": "application/json" }
        });
        setInWatchlist(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleWatchlist}
      className={`flex items-center gap-3 rounded px-8 py-3 text-sm md:text-lg font-bold text-white backdrop-blur-md transition-all active:scale-95 ${
        inWatchlist 
          ? "bg-green-500/80 hover:bg-green-500/60" 
          : "bg-gray-500/40 hover:bg-gray-500/50"
      }`}
    >
      {inWatchlist ? <Check className="h-5 w-5 md:h-6 md:w-6" /> : <Plus className="h-5 w-5 md:h-6 md:w-6" />}
      {inWatchlist ? "Added" : "Watchlist"}
    </button>
  );
}
