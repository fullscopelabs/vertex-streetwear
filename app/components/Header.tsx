import {useCallback, useEffect, useRef, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {MobileNav} from '~/components/MobileNav';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';

const NAV_LINKS = [
  {label: 'Shop All', to: '/collections/all'},
  {label: 'Core', to: '/collections/core-collection'},
  {label: 'Outerwear', to: '/collections/outerwear'},
  {label: 'Accessories', to: '/collections/accessories'},
  {label: 'Limited', to: '/collections/limited-edition'},
  {label: 'Journal', to: '/blogs/news'},
];

interface HeaderProps {
  cart: CartApiQueryFragment | null;
  announcementVisible?: boolean;
}

export function Header({cart, announcementVisible = true}: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  // Initialise with the correct value for the current page so the SSR render
  // already matches the final client state — prevents the white-text flash on
  // non-homepage pages where the header must start in its "scrolled" style.
  const [isScrolled, setIsScrolled] = useState(!isHomepage);

  useEffect(() => {
    if (!isHomepage) {
      setIsScrolled(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll(); // Check initial position
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage, location.pathname]);

  // Dark frosted glass — consistent across all states
  // Mobile: solid bg (no backdrop-blur) to avoid scroll jank on Chromium-based browsers
  // Desktop (md+): frosted-glass effect with backdrop-blur
  const headerBg = isScrolled
    ? 'bg-charcoal/95 md:bg-charcoal/80 md:backdrop-blur-xl border-b border-white/5'
    : 'bg-charcoal/80 md:bg-black/20 md:backdrop-blur-sm border-b border-white/5';

  const textColor = 'text-white';
  const hoverColor = 'hover:text-white/60';

  // Position header below announcement bar when it's visible
  const headerTop = announcementVisible ? 'top-9' : 'top-0';

  // Spacer height accounts for both announcement bar (36px) + header (80px) = 116px, or just header (80px)
  const spacerHeight = announcementVisible ? 'h-[116px]' : 'h-[80px]';

  return (
    <>
      <header
        className={`fixed ${headerTop} left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-[80px]">
          {/* Logo */}
          <NavLink
            prefetch="intent"
            to="/"
            className={`font-serif text-2xl transition-colors duration-500 ${textColor}`}
            style={{
              border: '2px solid currentColor',
              padding: '0.16em 0.48em',
              letterSpacing: '0.2em',
            }}
          >
            V<span className="trigram">☰</span>RTEX
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10" role="navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                prefetch="intent"
                to={link.to}
                className={({isActive}) =>
                  `uppercase text-[11px] tracking-[0.15em] font-medium transition-colors duration-300 ${
                    isActive ? 'text-sand' : `${textColor} ${hoverColor}`
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side: Account + Cart + Mobile Menu */}
          <div className="flex items-center gap-5">
            <NavLink
              to="/account"
              className={`hidden md:block transition-colors duration-300 ${textColor} hover:text-sand`}
              aria-label="Account"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </NavLink>
            <CartToggle cart={cart} textColor={textColor} />
            <MobileMenuToggle
              onOpen={() => setMobileNavOpen(true)}
              textColor={textColor}
            />
          </div>
        </div>
      </header>

      {/* Spacer to offset fixed header + announcement bar on non-homepage pages */}
      {!isHomepage && <div className={spacerHeight} />}

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        cart={cart}
      />
    </>
  );
}

function CartToggle({
  cart,
  textColor,
}: {
  cart: CartApiQueryFragment | null;
  textColor: string;
}) {
  const optimisticCart = useOptimisticCart(cart);
  const count = optimisticCart?.totalQuantity ?? 0;
  return <CartIcon count={count} textColor={textColor} />;
}

function CartIcon({count, textColor}: {count: number; textColor: string}) {
  const navigate = useNavigate();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const [bouncing, setBouncing] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <button
      className={`relative cursor-pointer transition-colors duration-300 ${textColor} hover:text-sand`}
      onClick={() => {
        void navigate('/cart');
        (publish as (...args: unknown[]) => void)('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      aria-label={`Cart (${count} items)`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
      {count > 0 && (
        <span
          className={`absolute -top-2 -right-2 bg-rust text-bone text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none ${
            bouncing ? 'animate-cart-bounce' : ''
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function MobileMenuToggle({
  onOpen,
  textColor,
}: {
  onOpen: () => void;
  textColor: string;
}) {
  return (
    <button
      className={`md:hidden cursor-pointer transition-colors duration-300 ${textColor} hover:text-sand`}
      onClick={onOpen}
      aria-label="Open menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
        />
      </svg>
    </button>
  );
}

/**
 * HeaderMenu renders Shopify CMS-driven menu items.
 * Used by the mobile menu aside drawer.
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderQuery['menu'];
  primaryDomainUrl: string;
  viewport: 'desktop' | 'mobile';
  publicStoreDomain: string;
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside() as {close: () => void};

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          className="uppercase text-xs tracking-widest text-charcoal hover:text-rust transition-colors duration-300 py-2"
          to="/"
        >
          Home
        </NavLink>
      )}
      {menu?.items.map((item) => {
        if (!item.url) return null;

        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="uppercase text-xs tracking-widest text-charcoal hover:text-rust transition-colors duration-300 py-2"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}
