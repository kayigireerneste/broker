 "use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { HiOutlineSearch, HiOutlineUser, HiOutlineChevronDown } from "react-icons/hi";


const shares = [
  { name: "BK Group", price: "$85.50", change: "+2.5%", positive: true },
  { name: "Equity Bank", price: "$42.30", change: "+1.8%", positive: true },
  { name: "MTN Rwanda", price: "$28.75", change: "-0.3%", positive: false },
  { name: "I&M Bank", price: "$156.20", change: "+3.1%", positive: true },
  { name: "KCB Group", price: "$67.80", change: "+0.9%", positive: true },
];

export default function Header() {
  const [isPaused, setIsPaused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  return (
    <>
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-20 relative">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="logo"
              width={130}
              height={40}
              className="w-24"
              priority
            />
          </div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm">
            {["Home", "Services", "Market", "About us", "Contact us"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                  className="text-gray-700 hover:text-[#006b7d] transition font-medium"
                >
                  {item}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <div ref={searchContainerRef} className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center border border-gray-300 rounded-full px-3 py-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#006b7d]"
              >
                <button
                    type="button"
                    onClick={toggleSearch}
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
            <button className="hidden sm:flex bg-[#006b7d] text-white px-4 sm:px-5 py-2 rounded-full hover:bg-[#005566] transition font-medium text-sm items-center gap-2">
              <HiOutlineUser className="h-4 w-4" />
              Sign in
            </button>
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

          {isMenuOpen && (
            <div className="absolute top-20 left-0 w-full bg-white border-t border-gray-200 flex flex-col items-center py-4 space-y-4 shadow-md md:hidden">
              {["Home", "Services", "Market", "About us", "Contact us"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-[#006b7d] font-medium"
                  >
                    {item}
                  </a>
                )
              )}
              <button className="bg-[#006b7d] text-white px-5 py-2 rounded-full hover:bg-[#005566] transition font-medium text-sm">
                Sign in
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="bg-gradient-to-r from-[#004F64] via-[#026b83] to-[#014F63] py-2 mt-20 overflow-hidden fixed w-full z-40">
        <div
          className={`flex whitespace-nowrap text-white font-medium text-sm ${
            isPaused ? "" : "animate-scroll"
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {[...shares, ...shares].map((share, index) => (
            <div key={index} className="flex items-center mx-6 sm:mx-8">
              <span>{share.name}</span>
              <span className="mx-2 text-gray-200">{share.price}</span>
              <span
                className={share.positive ? "text-green-300" : "text-red-300"}
              >
                {share.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ====== GLOBAL STYLES ====== */}
      <style jsx global>{`
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
