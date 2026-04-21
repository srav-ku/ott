"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Movies", href: "/movie" },
  { name: "TV Shows", href: "/tv" },
  { name: "Watchlist", href: "/watchlist" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-md shadow-lg"
          : "bg-transparent bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-6 md:px-10">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-bold tracking-wider text-white"
          >
            MYOTT
          </Link>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm transition-all duration-200 hover:text-white ${
                  isActive ? "font-semibold text-white" : "font-medium text-gray-300"
                }`}
              >
                {link.name}
                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute -bottom-[6px] left-0 h-[2px] w-full rounded-full bg-white transition-all duration-200" />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-5">
          <button className="text-gray-300 transition-colors duration-200 hover:text-white">
            <Search className="h-5 w-5" />
          </button>
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-600 transition-transform duration-200 hover:scale-105">
            <User className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      </div>
    </nav>
  );
}
