import {useLoaderData, Link, data} from 'react-router';
import {
  CartForm,
  Image,
  Money,
  useOptimisticCart,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Cart | V☰RTEX'}];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];
      discountCodes.push(...inputs.discountCodes);
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];
      giftCardCodes.push(...inputs.giftCardCodes);
      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes;
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  return await cart.get();
}

/* ═══════════════════════════════════════════
 *  CART PAGE COMPONENT
 * ═══════════════════════════════════════════ */

export default function Cart() {
  /** @type {LoaderReturnData} */
  const originalCart = useLoaderData();
  const cart = useOptimisticCart(originalCart);

  const lines = cart?.lines?.nodes ?? [];
  const hasItems = lines.length > 0;

  if (!hasItems) {
    return <CartEmpty />;
  }

  return (
    <div className="min-h-screen page-fade-in texture-canvas">
      <PageHero title="Your Cart" subtitle="Review Your Selection">
        <p className="text-[10px] tracking-[0.3em] text-bone/40 uppercase">
          {lines.length} {lines.length === 1 ? 'Item' : 'Items'}
        </p>
      </PageHero>

      <div className="max-w-7xl mx-auto section-padding">
        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* LEFT — Cart Items (65%) */}
          <div className="w-full lg:w-[65%]">
            {/* Column Headers (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-8 pb-4 border-b border-charcoal/10 text-xs uppercase tracking-widest text-charcoal/40">
              <span>Product</span>
              <span className="w-20 text-center">Qty</span>
              <span className="w-24 text-right">Total</span>
            </div>

            {/* Line Items */}
            <ul className="divide-y divide-charcoal/10">
              {lines.map((line, index) => (
                <ScrollReveal key={line.id} delay={index * 75}>
                  <CartLineItem line={line} />
                </ScrollReveal>
              ))}
            </ul>
          </div>

          {/* RIGHT — Order Summary (35%, sticky) */}
          <div className="w-full lg:w-[35%]">
            <ScrollReveal delay={150}>
              <OrderSummary cart={cart} />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  EMPTY CART
 * ═══════════════════════════════════════════ */

function CartEmpty() {
  return (
    <div className="min-h-screen page-fade-in texture-canvas">
      <PageHero title="Your Cart" subtitle="Review Your Selection" />
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center py-12">
          <ScrollReveal>
            <p className="text-charcoal/50 text-lg mb-2">
              Your cart is empty.
            </p>
            <p className="text-charcoal/40 text-sm mb-8">
              Continue shopping to add items to your cart.
            </p>
            <Link
              to="/collections/all"
              className="btn-secondary inline-block"
            >
              Continue Shopping
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  CART LINE ITEM
 * ═══════════════════════════════════════════ */

function CartLineItem({line}) {
  const {id, merchandise, quantity, cost} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

  return (
    <li className="py-6 md:grid md:grid-cols-[1fr_auto_auto] md:gap-8 md:items-center">
      {/* Product info */}
      <div className="flex gap-4">
        {/* Image */}
        <Link
          to={lineItemUrl}
          prefetch="intent"
          className="flex-shrink-0 w-[100px] h-[100px] bg-charcoal/5 overflow-hidden"
        >
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              width={100}
              height={100}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
        </Link>

        {/* Details */}
        <div className="flex flex-col justify-between py-1 min-w-0">
          <div>
            <Link
              to={lineItemUrl}
              prefetch="intent"
              className="font-medium text-sm text-charcoal hover:text-rust transition-colors"
            >
              {product.title}
            </Link>
            {selectedOptions.length > 0 && (
              <p className="text-xs text-charcoal/50 mt-1">
                {selectedOptions
                  .filter((opt) => opt.value !== 'Default Title')
                  .map((opt) => opt.value)
                  .join(' / ')}
              </p>
            )}
          </div>

          {/* Remove Button */}
          <CartForm
            fetcherKey={`remove-${id}`}
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds: [id]}}
          >
            <button
              type="submit"
              className="cursor-pointer text-rust uppercase text-xs tracking-wider hover:text-charcoal transition-colors mt-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!!line.isOptimistic}
            >
              Remove
            </button>
          </CartForm>
        </div>
      </div>

      {/* Quantity */}
      <div className="w-20 text-center mt-4 md:mt-0">
        <span className="md:hidden text-xs uppercase tracking-wider text-charcoal/40 mr-2">
          Qty:
        </span>
        <span className="text-sm text-charcoal">{quantity}</span>
      </div>

      {/* Line Total */}
      <div className="w-24 text-right mt-2 md:mt-0">
        <span className="md:hidden text-xs uppercase tracking-wider text-charcoal/40 mr-2">
          Total:
        </span>
        <span className="text-sm font-medium text-charcoal">
          <Money data={cost.totalAmount} />
        </span>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════
 *  ORDER SUMMARY
 * ═══════════════════════════════════════════ */

function OrderSummary({cart}) {
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <div className="lg:sticky lg:top-24 bg-white p-8 border border-charcoal/10">
      <h2 className="text-sm uppercase tracking-widest font-bold text-charcoal mb-6">
        Order Summary
      </h2>

      {/* Subtotal */}
      <div className="flex justify-between items-center py-3 border-b border-charcoal/10">
        <span className="text-sm text-charcoal/70">Subtotal</span>
        <span className="text-sm text-charcoal">
          {subtotal ? <Money data={subtotal} /> : '—'}
        </span>
      </div>

      {/* Shipping Note */}
      <div className="flex justify-between items-center py-3 border-b border-charcoal/10">
        <span className="text-sm text-charcoal/70">Shipping</span>
        <span className="text-xs text-charcoal/40 italic">
          Calculated at checkout
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-4">
        <span className="text-base font-bold text-charcoal uppercase tracking-wider">
          Total
        </span>
        <span className="text-xl font-bold text-charcoal">
          {total ? <Money data={total} /> : '—'}
        </span>
      </div>

      {/* Checkout Button */}
      {checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_self"
          className="btn-primary w-full block text-center mt-4"
        >
          CHECKOUT
        </a>
      )}

      {/* Continue Shopping */}
      <Link
        to="/collections/all"
        className="block text-center text-xs uppercase tracking-wider text-charcoal/50 hover:text-charcoal transition-colors mt-4"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('./+types/cart').Route} Route */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
