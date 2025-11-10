"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { HiOutlineSearch, HiOutlineUser, HiOutlineChevronDown } from "react-icons/hi";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useMarketSummary } from "@/hooks/useMarketSummary";

const links = [
  { label: "Home", target: "home" },
  { label: "Services", target: "services" },
  { label: "Market", target: "market" },
  { label: "About us", target: "about-us" },
  { label: "Contact us", target: "contactUs" },
];

export default function Header() {
  const [isPaused, setIsPaused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { isAuthenticated, dashboardPath, loading } = useAuth();
  const { data: marketSummary, loading: marketLoading, error: marketError } = useMarketSummary();

  const primaryCtaHref = isAuthenticated ? dashboardPath : "/auth/login";
  const primaryCtaLabel = isAuthenticated ? "Back to Dashboard" : "Sign in";
  const showPrimaryCta = !loading || isAuthenticated;

  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const liveShares = useMemo(() => {
    if (!marketSummary?.dailySnapshot?.length) return [];

    return marketSummary.dailySnapshot.map((row) => {
      const change = row.change || "";
      const trimmedChange = change.trim();
      const positive = trimmedChange ? !trimmedChange.startsWith("-") : true;

      return {
        name: row.security || "—",
        price: row.closing || "N/A",
        change: trimmedChange || "N/A",
        positive,
      };
    });
  }, [marketSummary?.dailySnapshot]);

  const tickerItems = useMemo(
    () => (liveShares.length ? [...liveShares, ...liveShares] : []),
    [liveShares]
  );
  const isTickerLoading = marketLoading && !liveShares.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScrollTo = (target: string) => {
    const section = document.getElementById(target);
    if (section) {
      const yOffset = -80;
      const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-20 relative">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="logo"
                width={130}
                height={40}
                className="w-24"
                priority
              />
            </Link>
          </div>

          {/* NAV LINKS */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm">
            {links.map(({ label, target }) => (
              <button
                key={target}
                onClick={() => handleScrollTo(target)}
                className="text-gray-700 hover:text-[#006b7d] transition font-medium"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div ref={searchContainerRef} className="relative">
              <form className="flex items-center border border-gray-300 rounded-full px-3 py-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#006b7d]">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  className="text-gray-600 hover:text-[#006b7d] transition"
                >
                  <HiOutlineSearch className="h-5 w-5" />
                </button>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search..."
                  className={`absolute right-0 top-0 h-full bg-white border border-gray-300 rounded-full pl-10 pr-3 outline-none transition-all duration-300 ${
                    isSearchOpen
                      ? "opacity-100 w-40 sm:w-56 shadow-lg"
                      : "opacity-0 w-0 pointer-events-none"
                  }`}
                />
              </form>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-gray-700 text-sm font-medium hover:text-[#006b7d] transition"
              >
                {selectedLanguage}
                <HiOutlineChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  {["English", "French", "Kinyarwanda", "Swahili"].map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        {lang}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Sign In */}
            {showPrimaryCta && (
                <Link
                className="hidden sm:flex bg-linear-to-r from-[#2d94b0] to-[#004f64] transition text-white px-4 sm:px-5 py-2 rounded-full font-medium text-sm items-center gap-2 shadow cursor-pointer"
                href={primaryCtaHref}
                >
                {primaryCtaLabel === "Sign in" && <HiOutlineUser className="h-4 w-4" />}
                {primaryCtaLabel}
                </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8"
            >
              <span
                className={`h-0.5 w-6 bg-gray-800 transition-transform ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`h-0.5 w-6 bg-gray-800 my-1 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-6 bg-gray-800 transition-transform ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </button>
          </div>

          {/* MOBILE MENU */}
          {isMenuOpen && (
            <div className="absolute top-20 left-0 w-full bg-white border-t border-gray-200 flex flex-col items-center py-4 space-y-4 shadow-md md:hidden">
              {links.map(({ label, target }) => (
                <button
                  key={target}
                  onClick={() => {
                    handleScrollTo(target);
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-[#006b7d] font-medium"
                >
                  {label}
                </button>
              ))}
              <Link
                href={primaryCtaHref}
                className="bg-linear-to-r from-[#2d94b0] to-[#004f64] text-white px-5 py-2 rounded-full hover:bg-[#005566] transition font-medium text-sm"
              >
                {primaryCtaLabel}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* STOCK SCROLL BAR */}
  <div className="bg-linear-to-r from-[#004F64] via-[#026b83] to-[#014F63] py-2 mt-20 overflow-hidden fixed w-full z-40">
        <div
          className={`flex whitespace-nowrap text-white font-medium text-sm ${
            isPaused || !tickerItems.length ? "" : "animate-scroll"
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {isTickerLoading && (
            <div className="flex items-center mx-6 sm:mx-8 text-gray-100">
              Loading live market data...
            </div>
          )}

          {!isTickerLoading &&
            tickerItems.map((share, index) => (
              <div key={`${share.name}-${index}`} className="flex items-center mx-6 sm:mx-8">
                <span>{share.name}</span>
                <span className="mx-2 text-gray-200">{share.price}</span>
                <span
                  className={share.positive ? "text-green-300" : "text-red-300"}
                >
                  {share.change}
                </span>
              </div>
            ))}

          {!isTickerLoading && !tickerItems.length && (
            <div className="flex items-center mx-6 sm:mx-8 text-yellow-200">
              {marketError ? "Live market data is unavailable right now." : "No market trades recorded today."}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </>
  );
}
