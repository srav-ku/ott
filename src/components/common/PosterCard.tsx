import Link from "next/link";

interface PosterCardProps {
  id: number;
  title: string;
  image: string;
  mediaType: "movie" | "tv";
}

export function PosterCard({ id, title, image, mediaType }: PosterCardProps) {
  const href = `/${mediaType}/${id}`;

  return (
    <Link href={href} className="group relative block w-[130px] sm:w-[150px] md:w-[180px] lg:w-[220px] aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-all duration-300 ease-in-out hover:scale-105 hover:z-10 hover:shadow-xl hover:shadow-black/50 cursor-pointer">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:brightness-110"
        loading="lazy"
      />
      {/* Optional title fallback on hover or at bottom, hidden by default unless no image */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs md:text-sm font-semibold text-white truncate text-center drop-shadow-md">
          {title}
        </p>
      </div>
    </Link>
  );
}
