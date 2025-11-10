"use client";

import { motion, useInView } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useRef } from "react";

export default function ContactUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <section
      id="contactUs"
      ref={ref}
      className="relative min-h-[50vh] flex items-center justify-center bg-gray-50 overflow-hidden py-10 px-4"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute bottom-0 right-20 w-60 h-60 bg-[#004B5B]/20 rounded-full blur-3xl"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white shadow-xl rounded-xl overflow-hidden flex flex-col lg:flex-row max-w-5xl w-full"
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 p-10"
        >
          <motion.h2
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-2xl font-semibold text-[#004B5B] mb-4"
          >
            Let&apos;s get in touch
          </motion.h2>

          <p className="text-gray-600 mb-6">
            We’re always here to help. Reach out to us with any questions,
            partnership opportunities, or feedback — we’d love to hear from you.
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-700">
              <FaMapMarkerAlt className="text-[#004B5B] text-xl" />
              <span>Kigali/Rwanda NYR-00000</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <FaEnvelope className="text-[#004B5B] text-xl" />
              <span>haki77ssu@yahoo.com</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <FaPhone className="text-[#004B5B] text-xl" />
              <span>+1 (502) 650-2191</span>
            </li>
          </ul>

          <div>
            <p className="text-gray-700 mb-3">Connect with us:</p>
            <div className="flex gap-3">
              {[
                { icon: <FaFacebookF />, link: "#" },
                { icon: <FaXTwitter />, link: "#" },
                { icon: <FaInstagram />, link: "#" },
                { icon: <FaLinkedinIn />, link: "#" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-[#004B5B] hover:bg-[#003641] text-white rounded-md transition"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 bg-[#004B5B] p-10 text-white flex flex-col justify-center"
        >
          <h2 className="text-xl font-semibold mb-6">Contact us</h2>

          <form className="flex flex-col gap-5">
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="text"
              placeholder="Username"
              className="w-full rounded-full px-4 py-2 text-white bg-transparent outline-none border border-white/50 focus:border-white"
            />
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="email"
              placeholder="Email"
              className="w-full rounded-full px-4 py-2 text-white bg-transparent outline-none border border-white/50 focus:border-white"
            />
            <motion.input
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="tel"
              placeholder="Phone"
              className="w-full rounded-full px-4 py-2 text-white bg-transparent outline-none border border-white/50 focus:border-white"
            />
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              placeholder="Message"
              className="w-full rounded-2xl px-4 py-2 text-white bg-transparent outline-none border border-white/50 focus:border-white min-h-[120px]"
            ></motion.textarea>

            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "#003641",
                color: "#fff",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="submit"
              className="bg-white text-[#004B5B] font-semibold px-8 py-2 rounded-full w-fit self-start hover:bg-gray-100 transition"
            >
              Send
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
}
