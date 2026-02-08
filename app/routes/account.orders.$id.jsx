import {redirect, Link, useLoaderData} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  return (
    <div>
      {/* Back link */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal transition-colors duration-300 mb-8"
      >
        <span>&larr;</span>
        <span>Back to Orders</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 mb-2">
            Order Details
          </p>
          <h2 className="font-serif text-4xl font-light tracking-tight text-charcoal">
            {order.name}
          </h2>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <StatusPill label={order.financialStatus} />
          <StatusPill label={fulfillmentStatus} />
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-8">
        Placed on{' '}
        {new Date(order.processedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {order.confirmationNumber && (
          <span className="ml-4">
            &middot; Confirmation: {order.confirmationNumber}
          </span>
        )}
      </p>

      <div className="divider-sand mb-10" />

      {/* Line Items */}
      <div className="space-y-0">
        {lineItems.map((lineItem, lineItemIndex) => (
          <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-charcoal/10 mt-2 pt-6 space-y-3 max-w-sm ml-auto">
        {((discountValue && discountValue.amount) ||
          discountPercentage) && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50">
              Discounts
            </span>
            <span className="text-sm text-rust">
              {discountPercentage ? (
                <span>-{discountPercentage}%</span>
              ) : (
                discountValue && <Money data={discountValue} />
              )}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50">
            Subtotal
          </span>
          <span className="text-sm text-charcoal">
            <Money data={order.subtotal} />
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50">
            Tax
          </span>
          <span className="text-sm text-charcoal">
            <Money data={order.totalTax} />
          </span>
        </div>
        <div className="border-t border-charcoal/10 pt-3 flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-medium">
            Total
          </span>
          <span className="font-serif text-xl font-light text-charcoal">
            <Money data={order.totalPrice} />
          </span>
        </div>
      </div>

      {/* Shipping & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-bone-dark/40 p-8">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mb-5 font-medium">
            Shipping Address
          </h3>
          {order?.shippingAddress ? (
            <address className="not-italic text-sm text-charcoal leading-relaxed space-y-1">
              <p className="font-medium">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted && (
                <p className="text-charcoal/60">
                  {order.shippingAddress.formatted}
                </p>
              )}
              {order.shippingAddress.formattedArea && (
                <p className="text-charcoal/60">
                  {order.shippingAddress.formattedArea}
                </p>
              )}
            </address>
          ) : (
            <p className="text-sm text-charcoal/40">
              No shipping address defined
            </p>
          )}
        </div>
        <div className="bg-bone-dark/40 p-8">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mb-5 font-medium">
            Fulfillment Status
          </h3>
          <p className="text-sm font-medium text-charcoal">
            {fulfillmentStatus}
          </p>
        </div>
      </div>

      {/* External status link */}
      <div className="mt-10 text-center">
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="inline-block border border-charcoal/15 text-charcoal text-[10px] uppercase tracking-[0.2em] font-medium px-8 py-3 hover:bg-charcoal hover:text-bone transition-all duration-300"
        >
          View Order Status &rarr;
        </a>
      </div>
    </div>
  );
}

/**
 * @param {{label: string}}
 */
function StatusPill({label}) {
  return (
    <span className="text-[9px] uppercase tracking-[0.15em] text-charcoal/50 border border-charcoal/10 px-3 py-1.5 font-medium">
      {label}
    </span>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <div className="flex items-center gap-5 py-5 border-b border-charcoal/8 last:border-b-0">
      {lineItem?.image && (
        <div className="w-20 h-20 flex-shrink-0 bg-bone-dark overflow-hidden">
          <Image
            data={lineItem.image}
            width={120}
            height={120}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">
          {lineItem.title}
        </p>
        {lineItem.variantTitle && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-charcoal/40 mt-1">
            {lineItem.variantTitle}
          </p>
        )}
        <p className="text-[10px] text-charcoal/35 mt-1">
          Qty: {lineItem.quantity}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-sm text-charcoal/55 line-through mr-2 hidden md:inline">
          <Money data={lineItem.price} />
        </span>
        <span className="text-sm font-medium text-charcoal">
          <Money data={lineItem.totalDiscount} />
        </span>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
