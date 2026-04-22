"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Play } from "lucide-react";
import { WatchlistButton } from "@/components/ui/WatchlistButton";
import type { MediaItem, EpisodeItem } from "@/lib/normalizeMedia";

// API response type
type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export default function TVDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [tv, setTv] = useState<MediaItem | null>(null);
  const [season, setSeason] = useState(1);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load TV data
  useEffect(() => {
    async function loadTV() {
      try {
        const res = await fetch(`/api/tv/${id}`);
        const json: ApiResponse<MediaItem> = await res.json();

        console.log("TV DATA:", json.data); // 👈 DEBUG

        if (json.success) {
          setTv(json.data);
        }
      } catch (err) {
        console.error("TV load failed", err);
      }
    }

    loadTV();
  }, [id]);

  // 🔹 Load season
  useEffect(() => {
    async function loadSeason() {
      setLoading(true);

      try {
        const res = await fetch(`/api/tv/${id}/season/${season}`);
        const json: ApiResponse<{ episodes: EpisodeItem[] }> = await res.json();

        if (json.success) {
          setEpisodes(json.data?.episodes || []);
        }
      } catch (err) {
        console.error("Season load failed", err);
      }

      setLoading(false);
    }

    loadSeason();
  }, [season, id]);

  if (!tv) {
    return <div className="text-white p-10">Loading...</div>;
  }

  // 🔥 THIS IS ROOT OF YOUR ISSUE
  const totalSeasons = tv.total_seasons || 1;

  return (
    <div className="bg-black min-h-screen text-white">

      {/* HERO */}
      <div className="relative h-[60vh] w-full">
        {tv.backdropUrl && (
          <img 
            src={tv.backdropUrl} 
            alt={tv.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-10 flex flex-col justify-end">
          <h1 className="text-5xl font-bold">{tv.title}</h1>
          <p className="text-gray-300 mt-4 max-w-3xl line-clamp-3">{tv.overview}</p>

          <div className="flex gap-4 mt-6">
            <button className="bg-white text-black px-6 py-2.5 rounded flex items-center gap-2 font-semibold hover:bg-gray-200 transition">
              <Play size={20} className="fill-black" /> Play
            </button>

            <WatchlistButton tmdbId={tv.id} type="tv" />
          </div>
        </div>
      </div>

      {/* SEASON SELECTOR */}
      <div className="px-10 mb-6">
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="bg-gray-800 px-4 py-2 rounded"
        >
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>
              Season {s}
            </option>
          ))}
        </select>
      </div>

      {/* EPISODES */}
      <div className="px-10">
        {loading ? (
          <p>Loading episodes...</p>
        ) : episodes.length === 0 ? (
          <p>No episodes available</p>
        ) : (
          episodes.map((ep) => (
            <div
              key={ep.id}
              className="flex gap-4 mb-4 bg-gray-900 p-4 rounded"
            >
              {(() => {
                const img = ep.stillUrl || "/placeholder.jpg";
                return (
                  <img
                    src={img}
                    alt={ep.name}
                    className="w-40 h-24 object-cover rounded"
                  />
                );
              })()}

              <div>
                <h3 className="font-bold">
                  {ep.episode_number}. {ep.name}
                </h3>
                <p className="text-sm text-gray-400">{ep.overview}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}