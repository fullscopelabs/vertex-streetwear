import {CartForm} from '@shopify/hydrogen';

/**
 * Luxury-styled Add to Cart button.
 *
 * Uses Hydrogen CartForm which internally manages a fetcher and submits
 * to the /cart route action (CartForm.ACTIONS.LinesAdd). The cart route
 * action already processes this via CartForm.getFormInput().
 *
 * @param {{
 *   lines: Array<{merchandiseId: string; quantity: number; selectedVariant?: unknown}>;
 *   disabled?: boolean;
 *   className?: string;
 *   onClick?: () => void;
 *   analytics?: unknown;
 * }}
 */
export function AddToCartButton({
  lines,
  disabled = false,
  className = '',
  onClick,
  analytics,
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        const isAdding = fetcher.state !== 'idle';

        return (
          <>
            {analytics && (
              <input
                name="analytics"
                type="hidden"
                value={JSON.stringify(analytics)}
              />
            )}
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled || isAdding}
              className={`btn-primary w-full text-center ${
                disabled || isAdding
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${className}`}
            >
              {isAdding ? 'ADDING...' : disabled ? 'SOLD OUT' : 'ADD TO CART'}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}

/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
