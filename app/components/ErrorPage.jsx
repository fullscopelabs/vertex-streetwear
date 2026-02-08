import {Link} from 'react-router';

/**
 * Premium error page component following industry best practices
 * - No header/footer navigation (keeps focus on error and recovery)
 * - Minimal, centered design
 * - Clear branding with clickable logo
 * - Strong visual hierarchy
 * - Clear call-to-action buttons
 * 
 * @param {{
 *   status?: number;
 *   title?: string;
 *   description?: string;
 *   showShopButton?: boolean;
 *   showDeveloperInfo?: boolean;
 *   errorMessage?: string;
 * }}
 */
export function ErrorPage({
  status = 500,
  title = 'Server Error',
  description = 'Something went wrong on our end. Our team has been notified.',
  showShopButton = false,
  showDeveloperInfo = false,
  errorMessage = '',
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-tobacco to-forest relative overflow-hidden">
      {/* Film grain texture for luxury feel */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(196, 168, 124, 0.08) 0%, transparent 70%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Minimal header - just logo */}
        <div className="absolute top-8 left-8">
          <Link
            to="/"
            className="inline-block font-serif text-xl md:text-2xl text-bone hover:text-sand transition-colors duration-300"
            style={{letterSpacing: '0.12em'}}
            aria-label="Return to V☰RTEX homepage"
          >
                V<span className="trigram">☰</span>RTEX
          </Link>
        </div>

        {/* Main error content */}
        <div className="max-w-2xl w-full text-center">
          {/* Error code badge */}
          <div className="inline-block bg-rust/20 border border-rust/40 px-6 py-2 mb-8">
            <span className="text-[11px] uppercase tracking-[0.3em] text-sand font-semibold">
              Error {status}
            </span>
          </div>

          {/* Error title */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-bone mb-6 leading-tight">
            {title}
          </h1>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-sand/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-sand/60" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-sand/60" />
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-bone/70 leading-relaxed max-w-xl mx-auto mb-12">
            {description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/"
              className="inline-block bg-sand text-charcoal px-10 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-bone transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
            >
              Return Home
            </Link>
            {showShopButton && (
              <Link
                to="/collections/all"
                className="inline-block bg-transparent border-2 border-bone/40 text-bone px-10 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-bone/10 hover:border-bone transition-all duration-300 cursor-pointer"
              >
                Shop Collection
              </Link>
            )}
          </div>

          {/* Developer info (development only) */}
          {showDeveloperInfo && errorMessage && (
            <details className="mt-12 max-w-xl mx-auto">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-sand/60 hover:text-sand transition-colors mb-3 font-medium">
                Developer Information
              </summary>
              <div className="bg-charcoal/60 backdrop-blur-sm border border-sand/20 p-5 text-left text-xs font-mono text-bone/80 overflow-auto max-h-64 leading-relaxed">
                {errorMessage}
              </div>
            </details>
          )}
        </div>

        {/* Minimal footer text */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-bone/30">
            V☰RTEX Contemporary Streetwear
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to get error details based on status code
 * Following industry best practices for error messaging
 * @param {number} status
 * @returns {{title: string, description: string, showShopButton: boolean}}
 */
export function getErrorDetails(status) {
  switch (status) {
    case 404:
      return {
        title: 'Page Not Found',
        description:
          "This page doesn't exist. It may have been moved or deleted. Let's get you back on track.",
        showShopButton: true,
      };
    case 403:
      return {
        title: 'Access Forbidden',
        description:
          "You don't have permission to view this page. If you believe this is an error, please contact support.",
        showShopButton: false,
      };
    case 500:
      return {
        title: 'Something Went Wrong',
        description:
          'An unexpected error occurred on our servers. Our team has been automatically notified and is working on a fix.',
        showShopButton: false,
      };
    case 503:
      return {
        title: 'Under Maintenance',
        description:
          "We're currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience.",
        showShopButton: false,
      };
    default:
      return {
        title: 'Unexpected Error',
        description:
          'Something went wrong. Please try refreshing the page or return home to continue shopping.',
        showShopButton: true,
      };
  }
}
