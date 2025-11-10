"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Join() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const controlsLeft = useAnimation();
  const controlsRight = useAnimation();

  useEffect(() => {
    if (inView) {
      controlsLeft.start({
        opacity: 1,
        x: 0,
        transition: { duration: 1, ease: "easeOut" },
      });
      controlsRight.start({
        opacity: 1,
        x: 0,
        transition: { duration: 1, ease: "easeOut" },
      });
    } else {
      controlsLeft.start({ opacity: 0, x: -100 });
      controlsRight.start({ opacity: 0, x: 100 });
    }
  }, [inView, controlsLeft, controlsRight]);

  return (
    <div
      id="about-us"
      ref={ref}
      className="flex flex-col justify-center items-center bg-[#004B5B] px-6 py-8 md:py-12"
    >
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={controlsLeft}
          className="text-white"
        >
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
            Join Rwanda’s Smartest Trading Platform
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-6 text-gray-200">
            Whether you&apos;re buying shares or browsing investment opportunities,
            Stock Broker connects you to trusted brokers and real-time market
            insights. Register today and take control of your financial future
            with confidence.
          </p>
          <Link href="/auth/signup" className="bg-white text-[#004B5B] px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-gray-100 transition">
            Create an account
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={controlsRight}
          className="flex justify-center"
        >
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
            <Image
              src="/imgs/shares.svg"
              alt="Trading growth"
              width={350}
              height={350}
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
