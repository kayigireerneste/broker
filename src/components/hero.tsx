"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { isAuthenticated, dashboardPath } = useAuth();
  const slides = [
    {
      image: "/imgs/hero.jpg",
      title: "Empowering You to",
      subtitle: "Invest in Rwanda’s Future",
      text: "Experience smarter investing with Broker Platform — your all-in-one solution to trade, manage, and grow your investments securely in Rwanda’s capital market.",
    },
    {
      image: "/imgs/mtn.jpeg",
      title: "Your Bridge to",
      subtitle: "Rwanda’s Capital Growth",
      text: "Unlock new financial opportunities with Broker Platform — trade MTN Rwanda and other top companies easily, safely, and profitably.",
    },
    {
      image: "/imgs/cohort1.jpeg",
      title: "Join a Community of",
      subtitle: "Innovative Investors",
      text: "Collaborate, learn, and grow with others shaping Rwanda’s financial future — all through one reliable platform.",
    },
  ];

  const wonderfulTexts = [
    "Welcome to Rwanda's #1 Investment Platform!",
    "Trade, Learn, and Grow with Broker Platform.",
    "Your journey to financial freedom starts here.",
    "Join thousands of successful investors today!",
  ];

  const [wonderfulIndex, setWonderfulIndex] = useState(0);
  const [index, setIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [hasMounted, slides.length]);

  useEffect(() => {
    if (!hasMounted) return;
    const timer = setInterval(() => {
      setWonderfulIndex((prev) => (prev + 1) % wonderfulTexts.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasMounted, wonderfulTexts.length]);

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-30 w-full flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={wonderfulIndex}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="bg-[#014F63]/80 text-white text-xl md:text-2xl font-bold px-6 py-3 rounded-full shadow-lg pointer-events-auto"
          >
            {wonderfulTexts[wonderfulIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {slides.map(
          (slide, i) =>
            i === index && (
              <motion.div
                key={i}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
                <motion.div
                  className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }} // Delay after image
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white max-w-xl">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.8 }}
                        className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                      >
                        {slide.title}
                        <span className="block text-yellow-300 text-3xl lg:text-4xl">
                          {slide.subtitle}
                        </span>
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 2.1 }}
                        className="text-lg mb-6 text-blue-100"
                      >
                        {slide.text}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
        )}
      </AnimatePresence>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-yellow-300 scale-125" : "bg-gray-400/50"
            }`}
          ></div>
        ))}
      </div>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <Link href={isAuthenticated ? dashboardPath : "/auth/login"} className="bg-gradient-to-r from-[#2d94b0] to-[#004f64] relative flex items-center gap-2 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-[2px_2px_0_#A9E2EB] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#A9E2EB] transition-all duration-300">
          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
        </Link>
      </div>
    </section>
  );
}
