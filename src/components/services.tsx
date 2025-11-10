"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaChartLine, FaLock, FaComments, FaExchangeAlt, FaGlobe, FaFileAlt } from "react-icons/fa";
import Card from "./ui/Card";

const services = [
  {
    icon: <FaChartLine className="text-white text-xl" />,
    title: "Real-Time Market Insights",
    description:
      "Stay ahead with up-to-date data and analytics across asset classes and industries.",
  },
  {
    icon: <FaLock className="text-white text-xl" />,
    title: "Secure Transactions",
    description:
      "All trades and listings are protected with industry-grade authentication and compliance standards.",
  },
  {
    icon: <FaComments className="text-white text-xl" />,
    title: "Broker–Client Chat",
    description:
      "Communicate instantly and securely with your broker or client within the platform.",
  },
  {
    icon: <FaExchangeAlt className="text-white text-xl" />,
    title: "Seamless Listing Management",
    description:
      "Post, update, and manage listings easily—whether you're a broker or a verified client.",
  },
  {
    icon: <FaGlobe className="text-white text-xl" />,
    title: "Multi-language Support",
    description:
      "Accessible in Kinyarwanda, English, and French to ensure clarity and inclusiveness for all users.",
  },
  {
    icon: <FaFileAlt className="text-white text-xl" />,
    title: "Smart Document Handling",
    description:
      "Upload, verify, and manage documents tied to transactions with ease and security.",
  },
];

export default function OurServices() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  return (
    <section id="services" className="py-16 bg-[#F8F9FB]" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl font-bold text-[#004B5B] mb-4"
          >
            What Makes Us Different
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Built for Rwanda and beyond, our platform empowers brokers and clients with the tools to
            trade smarter, communicate better, and grow faster in a transparent, secure ecosystem.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
              }}
            >
              <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto"
                     style={{ backgroundColor: "#004B5B" }}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#004B5B] mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 text-center">{service.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
