"use client";

import Image from "next/image";

export default function Partners() {
  const logos = [
    "/imgs/mtn.webp",
    "/imgs/kcb.webp",
    "/imgs/equity.webp",
    "/imgs/bralirwa.webp",
    "/imgs/BK.png",
  ];

  return (
    <div className="bg-[#F8F9FB] py-10 overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="flex items-center whitespace-nowrap animate-scroll-partners">
          {[...logos, ...logos].map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-12 md:mx-20 grayscale opacity-80 hover:opacity-100 transition"
            >
              <Image
                src={src}
                alt="Partner logo"
                width={160}
                height={100}
                className="w-28 md:w-40 h-auto"
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes scrollPartners {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-partners {
          animation: scrollPartners 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
