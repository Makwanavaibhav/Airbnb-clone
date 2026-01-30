import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Top Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300 transition-colors">Help Centre</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Get help with a safety issue</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">AirCover</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Anti-discrimination</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Disability support</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Cancellation options</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Report neighbourhood concern</a></li>
            </ul>
          </div>

          {/* Col 2: Hosting */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">Hosting</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300 transition-colors">Airbnb your home</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Airbnb your experience</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Airbnb your service</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Hosting resources</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Community forum</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Hosting responsibly</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Join a free hosting class</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Find a co-host</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Refer a host</a></li>
            </ul>
          </div>

          {/* Col 3: Airbnb */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">Airbnb</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300 transition-colors">2025 Summer Release</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Investors</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Airbnb.org emergency stays</a></li>
            </ul>
          </div>

          {/* Empty column for spacing */}
          <div></div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center text-sm space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>&copy; 2026 Airbnb, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:text-gray-300">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-300">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-300">Company details</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;