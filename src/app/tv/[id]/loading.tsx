export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pb-20 overflow-hidden">
      {/* 1. Hero Banner Skeleton */}
      <div className="relative h-[75vh] w-full bg-gray-900/50 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="relative h-full flex flex-col justify-end px-6 pb-16 md:px-12 lg:pb-24 w-full md:w-3/4 lg:w-2/3">
          <div className="h-12 md:h-20 lg:h-24 w-3/4 bg-gray-800 rounded-lg mb-6 animate-pulse" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
          
          <div className="space-y-3 mb-10 max-w-2xl">
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse" />
          </div>

          <div className="flex items-center gap-4">
             <div className="h-12 w-32 md:w-40 bg-gray-800 rounded animate-pulse" />
             <div className="h-12 w-32 md:w-40 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. Info Section Skeleton */}
      <div className="px-6 md:px-12 mb-16 -mt-8 relative z-10">
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-gray-800 rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-gray-800 rounded-full animate-pulse" />
          <div className="h-8 w-16 bg-gray-800 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 3. Episodes Skeleton */}
      <div className="px-6 md:px-12 mb-16">
        <div className="h-8 w-32 bg-gray-800 rounded mb-8 animate-pulse" />
        <div className="space-y-4 max-w-5xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full bg-gray-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* 4. Content Row Skeleton */}
      <div className="px-6 md:px-12">
        <div className="h-8 w-48 bg-gray-800 rounded mb-6 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-none w-[130px] sm:w-[150px] md:w-[180px] lg:w-[220px] aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
