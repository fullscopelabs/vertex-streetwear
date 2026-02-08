import {NavLink} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

const NAV_LINKS = [
  {label: 'Shop All', to: '/collections/all'},
  {label: 'Core', to: '/collections/core-collection'},
  {label: 'Outerwear', to: '/collections/outerwear'},
  {label: 'Accessories', to: '/collections/accessories'},
  {label: 'Limited', to: '/collections/limited-edition'},
  {label: 'Journal', to: '/blogs/news'},
  {label: 'Account', to: '/account'},
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartApiQueryFragment | null;
}

export function MobileNav({isOpen, onClose, cart}: MobileNavProps) {
  // Always render in DOM (SSR-safe). Use inline visibility:hidden as FOUC
  // fallback — it hides the drawer even before CSS loads and avoids the
  // transition-on-mount flash that happens when inserting elements post-hydration.
  const hiddenStyle = isOpen ? undefined : {visibility: 'hidden' as const};

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-charcoal/70 backdrop-blur-sm z-[70] transition-opacity duration-300 cursor-pointer ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={hiddenStyle}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer — use `inert` when closed instead of `aria-hidden` so that
          descendant links cannot retain focus while the panel is hidden. */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-charcoal/95 backdrop-blur-2xl z-[80] shadow-2xl border-l border-sand/10 transition-transform duration-300 ease-out grain ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={hiddenStyle}
        role="dialog"
        aria-modal={isOpen || undefined}
        aria-label="Mobile navigation"
        // @ts-expect-error — inert is a standard HTML attribute, React types may lag
        inert={isOpen ? undefined : ''}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo + Close */}
          <div className="flex items-center justify-between px-6 h-[70px] border-b border-sand/10">
            <span
              className="text-xl font-serif text-bone"
              style={{
                border: '2px solid currentColor',
                padding: '0.16em 0.48em',
                letterSpacing: '0.2em',
              }}
            >
              V<span className="trigram">☰</span>RTEX
            </span>
            <button
              onClick={onClose}
              className="cursor-pointer text-bone/60 hover:text-sand transition-colors duration-200"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-6 py-4" role="navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                prefetch="intent"
                onClick={onClose}
                className={({isActive}) =>
                  `block text-base sm:text-lg uppercase tracking-[0.15em] sm:tracking-wider py-4 border-b border-sand/10 transition-colors duration-300 font-medium ${
                    isActive
                      ? 'text-sand'
                      : 'text-bone/80 hover:text-sand'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Cart Link at Bottom */}
          <div className="px-6 py-6 border-t border-sand/10">
            <NavLink
              to="/cart"
              prefetch="intent"
              onClick={onClose}
              className="flex items-center justify-between text-bone/80 hover:text-sand transition-colors duration-300"
            >
              <span className="text-sm uppercase tracking-[0.15em] font-medium">
                Cart
              </span>
              <MobileNavCartBadge cart={cart} />
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNavCartBadge({cart}: {cart: CartApiQueryFragment | null}) {
  const optimisticCart = useOptimisticCart(cart);
  return <CartBadge count={optimisticCart?.totalQuantity ?? 0} />;
}

function CartBadge({count}: {count: number}) {
  if (count === 0) return null;
  return (
    <span className="bg-rust text-bone text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
      {count}
    </span>
  );
}
