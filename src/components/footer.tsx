/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={130}
                  height={40}
                  className="w-24"
                  priority
                />
              </div>
              <p className="text-sm text-gray-400">
                Rwanda's leading digital broker platform for secure and
                efficient trading.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trading
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Investments
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Wallet
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Analytics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Compliance
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 text-center text-sm text-gray-400">
            <p className="text-center py-5  text-sm text-white border-t border-gray-400">
                © {new Date().getFullYear()}{" "}
                <span className="mx-1 font-medium text-white">
                    Stock Broker
                </span>{" "}
                — All Rights Reserved, Developed by{" "}
                <Link
                    href="https://www.santechrwanda.com"
                    target="_blank"
                    className="hover:underline"
                >
                    SAN TECH
                </Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
