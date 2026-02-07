import {Suspense} from 'react';
import {Await, NavLink, Link} from 'react-router';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-gradient-to-b from-charcoal to-forest text-bone grain">
            {/* Newsletter — integrated into footer instead of separate section */}
            <div className="border-b border-sand/8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 lg:py-20">
                <div className="max-w-lg">
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-bone">
                    Stay in the Loop
                  </h3>
                  <p className="text-bone/40 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
                    New drops, exclusive access, and stories from the studio.
                  </p>
                  <form
                    className="mt-4 sm:mt-6 flex gap-0"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 bg-transparent border border-bone/20 border-r-0 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-bone/40 transition-colors duration-200"
                    />
                    <button
                      type="submit"
                      className="cursor-pointer bg-bone text-charcoal px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs uppercase tracking-[0.12em] font-semibold hover:bg-rust hover:text-bone transition-all duration-300 whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Main footer links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
                {/* Col 1: Brand */}
                <div className="pb-6 border-b border-bone/10 md:border-b-0 md:pb-0">
                  <Link to="/" className="inline-block">
                    <h3 className="font-serif text-xl sm:text-2xl" style={{letterSpacing: '0.2em'}}>
                      V<span style={{fontSize: '0.85em', verticalAlign: 'baseline'}}>☰</span>RTEX
                    </h3>
                  </Link>
                  <p className="text-bone/40 text-xs sm:text-sm mt-3 sm:mt-4 leading-relaxed max-w-xs">
                    Contemporary streetwear essentials. Designed with intention,
                    built to endure.
                  </p>
                  {/* Social Icons */}
                  <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-6">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bone/30 hover:text-bone transition-colors duration-300"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bone/30 hover:text-bone transition-colors duration-300"
                      aria-label="X (Twitter)"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bone/30 hover:text-bone transition-colors duration-300"
                      aria-label="TikTok"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Col 2 & 3: Shop & Info - 2 columns on mobile */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6 md:gap-12 lg:gap-16 md:col-span-2">
                  {/* Shop */}
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-bone/60 mb-4 sm:mb-6">
                      Shop
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li>
                        <Link
                          to="/collections/all"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Shop All
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/collections/core-collection"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Core
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/collections/outerwear"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Outerwear
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/collections/accessories"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Accessories
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/collections/limited-edition"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Limited Edition
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-bone/60 mb-4 sm:mb-6">
                      Info
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li>
                        <Link
                          to="/blogs/news"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Journal
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/collections"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          All Collections
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/shipping-returns"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Shipping &amp; Returns
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/policies"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Policies
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/search"
                          className="text-xs sm:text-sm text-bone/40 hover:text-bone transition-colors duration-300"
                        >
                          Search
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-bone/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                <p className="text-[10px] sm:text-[11px] text-bone/25 tracking-wide sm:tracking-wider text-center md:text-left">
                  &copy; {new Date().getFullYear()} <span style={{letterSpacing: '0.2em'}}>V<span style={{fontSize: '0.85em', verticalAlign: 'baseline'}}>☰</span>RTEX</span>. All rights reserved.
                </p>
                <div className="flex items-center gap-4 sm:gap-6">
                  <Link
                    to="/policies/privacy-policy"
                    className="text-[10px] sm:text-[11px] text-bone/25 hover:text-bone/50 transition-colors duration-300 tracking-wide sm:tracking-wider"
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/policies/terms-of-service"
                    className="text-[10px] sm:text-[11px] text-bone/25 hover:text-bone/50 transition-colors duration-300 tracking-wide sm:tracking-wider"
                  >
                    Terms
                  </Link>
                  <Link
                    to="/policies/refund-policy"
                    className="text-[10px] sm:text-[11px] text-bone/25 hover:text-bone/50 transition-colors duration-300 tracking-wide sm:tracking-wider"
                  >
                    Refunds
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/** @typedef {Object} FooterProps */
/** @property {Promise<FooterQuery|null>} footer */
/** @property {HeaderQuery} header */
/** @property {string} publicStoreDomain */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
