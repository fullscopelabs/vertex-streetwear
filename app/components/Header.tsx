import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';

const NAV_LINKS = [
  {label: 'Shop All', to: '/collections/all'},
  {label: 'Core', to: '/collections/core-collection'},
  {label: 'Outerwear', to: '/collections/outerwear'},
  {label: 'Accessories', to: '/collections/accessories'},
  {label: 'Limited', to: '/collections/limited-edition'},
];

interface HeaderProps {
  cart: Promise<CartApiQueryFragment | null>;
}

export function Header({cart}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-bone/95 backdrop-blur-md border-b border-charcoal/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-[70px]">
        {/* Logo */}
        <NavLink
          prefetch="intent"
          to="/"
          className="text-2xl font-bold tracking-tighter text-charcoal"
        >
          VΞRTEX
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" role="navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              prefetch="intent"
              to={link.to}
              className={({isActive}) =>
                `uppercase text-xs tracking-widest transition-colors duration-300 ${
                  isActive ? 'text-rust' : 'text-charcoal hover:text-rust'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Side: Cart + Mobile Menu */}
        <div className="flex items-center gap-4">
          <CartToggle cart={cart} />
          <MobileMenuToggle />
        </div>
      </div>
    </header>
  );
}

function CartToggle({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  return (
    <Suspense fallback={<CartIcon count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartIcon count={cart?.totalQuantity ?? 0} />;
}

function CartIcon({count}: {count: number}) {
  const {open} = useAside() as {open: (type: string) => void; close: () => void};
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="relative text-charcoal hover:text-rust transition-colors duration-300"
      onClick={() => {
        open('cart');
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
        <span className="absolute -top-2 -right-2 bg-rust text-bone text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {count}
        </span>
      )}
    </button>
  );
}

function MobileMenuToggle() {
  const {open} = useAside() as {open: (type: string) => void};
  return (
    <button
      className="md:hidden text-charcoal hover:text-rust transition-colors duration-300"
      onClick={() => open('mobile')}
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
