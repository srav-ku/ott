export function SkeletonCard() {
  return (
    <div className="relative w-[130px] sm:w-[150px] md:w-[180px] lg:w-[220px] aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 animate-pulse">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-animation" />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-animation {
          animation: shimmer 1.5s infinite;
        }
      `}} />
    </div>
  );
}
