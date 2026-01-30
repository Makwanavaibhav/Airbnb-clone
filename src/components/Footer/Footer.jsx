import React from "react";

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="px-6 py-12  lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-50 mb-12">
          <div>
            <h3 className="text-xs font-semibold tracking-wider mb-4 text-black dark:text-gray-400">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Help Centre
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Get help with a safety issue
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  AirCover
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Anti-discrimination
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Disability support
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Cancellation options
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Report neighbourhood concern
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wider mb-4 text-black dark:text-gray-400">
              Hosting
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Airbnb your home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Airbnb your experience
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Airbnb your service
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  AirCover for Hosts
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Hosting resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Community forum
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Hosting responsibly
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Join a free hosting class
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Find a co-host
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Refer a host
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wider mb-4 text-black dark:text-gray-400">
              Airbnb
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  2025 Summer Release
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Investors
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-gray-800 dark:text-gray-300">
                  Airbnb.org emergency stays
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>© 2026 Airbnb, Inc.</span>
              <span className="mx-2">·</span>
              <a href="#" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">
                Privacy
              </a>
              <span className="mx-2">·</span>
              <a href="#" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">
                Terms
              </a>
              <span className="mx-2">·</span>
              <a href="#" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">
                Company details
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;