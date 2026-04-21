import { SkeletonCard } from "@/components/common/SkeletonCard";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pb-20 overflow-hidden">
      {/* Hero Banner Skeleton */}
      <div className="relative h-[70vh] w-full bg-gray-900 animate-pulse" />

      {/* Content Rows Skeleton Section */}
      <div className="-mt-16 md:-mt-24 relative z-20 flex flex-col gap-8 md:gap-12 px-6 md:px-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-8">
            <div className="h-6 w-48 bg-gray-800 rounded mb-4 animate-pulse" />
            <div className="flex gap-3 md:gap-4 overflow-hidden pb-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex-none">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
