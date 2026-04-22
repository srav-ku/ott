"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

type StreamResponse = {
  url: string | null;
  type?: "direct" | "extracted";
  expiresAt?: string;
};

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const typeParam = searchParams.get("type"); // optional now

  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchStream() {
      if (!id) {
        setError("Invalid stream parameters.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const typeQuery = typeParam ? `?type=${typeParam}` : "";
        const res = await fetch(`/api/links/${id}${typeQuery}`);
        
        if (!res.ok) {
          if (res.status === 404 || res.status === 400) {
            setError("Not available yet");
            return;
          }
          throw new Error("Failed to fetch stream");
        }
        
        const data = (await res.json()) as StreamResponse;
        
        // 🔥 4. TV EPISODE EDGE CASE
        if (!data.url) {
          setError("Not available yet");
        } else {
          setUrl(data.url);
        }
      } catch (err) {
        console.error(err);
        if (retryCount < 1) {
          // 🔥 2. STREAM FAIL RECOVERY (Retry once)
          setRetryCount(prev => prev + 1);
        } else {
          setError("Stream failed to load. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStream();
  }, [id, typeParam, retryCount]);

  const handleStreamError = () => {
    if (retryCount < 1) {
      setRetryCount(prev => prev + 1);
    } else {
      setError("Stream failed to play. The source might be broken or expired.");
      setUrl(null);
    }
  };

  const isIframe = url ? !url.endsWith(".mp4") && !url.endsWith(".mkv") && !url.endsWith(".m3u8") : true;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 bg-black/50 backdrop-blur-md absolute top-0 w-full z-10">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-lg opacity-80">Now Playing</h1>
      </div>

      {/* Player Area */}
      <div className="flex-1 flex items-center justify-center relative w-full h-screen">
        {loading && (
          <div className="flex flex-col items-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p>Loading stream...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center text-center p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
            <AlertCircle className="text-red-500 mb-3" size={40} />
            <p className="text-xl font-bold">{error}</p>
            {error !== "Not available yet" && (
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded font-semibold transition"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {url && !loading && !error && isIframe && (
          <iframe 
            src={url} 
            allowFullScreen 
            onError={handleStreamError}
            className="w-full h-full border-none"
            title="Video Player"
          />
        )}

        {url && !loading && !error && !isIframe && (
          <video 
            src={url} 
            controls 
            autoPlay 
            onError={handleStreamError}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
