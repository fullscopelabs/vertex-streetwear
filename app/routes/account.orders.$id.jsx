import {redirect, useLoaderData} from 'react-router';
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
      {/* Header */}
      <h2 className="font-serif text-3xl font-light tracking-tight text-charcoal">
        Order {order.name}
      </h2>
      <div className="flex flex-wrap items-center gap-3 mt-2 mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40">
          {new Date(order.processedAt).toDateString()}
        </p>
        {order.confirmationNumber && (
          <>
            <span className="text-charcoal/20">&middot;</span>
            <p className="text-xs text-charcoal/50">
              Confirmation: {order.confirmationNumber}
            </p>
          </>
        )}
      </div>

      {/* Line Items */}
      <div className="border border-charcoal/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal/10 bg-bone-dark">
              <th
                scope="col"
                className="text-left text-[10px] uppercase tracking-[0.2em] text-charcoal/50 px-6 py-3 font-medium"
              >
                Product
              </th>
              <th
                scope="col"
                className="text-right text-[10px] uppercase tracking-[0.2em] text-charcoal/50 px-6 py-3 font-medium hidden md:table-cell"
              >
                Price
              </th>
              <th
                scope="col"
                className="text-center text-[10px] uppercase tracking-[0.2em] text-charcoal/50 px-6 py-3 font-medium hidden md:table-cell"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="text-right text-[10px] uppercase tracking-[0.2em] text-charcoal/50 px-6 py-3 font-medium"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot className="border-t border-charcoal/10">
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr className="border-b border-charcoal/10">
                <td
                  colSpan={3}
                  className="text-right text-sm text-charcoal/70 px-6 py-3 hidden md:table-cell"
                >
                  Discounts
                </td>
                <td className="text-right text-sm text-charcoal/70 px-6 py-3 md:hidden">
                  Discounts
                </td>
                <td className="text-right text-sm text-rust px-6 py-3">
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </td>
              </tr>
            )}
            <tr className="border-b border-charcoal/10">
              <td
                colSpan={3}
                className="text-right text-sm text-charcoal/70 px-6 py-3 hidden md:table-cell"
              >
                Subtotal
              </td>
              <td className="text-right text-sm text-charcoal/70 px-6 py-3 md:hidden">
                Subtotal
              </td>
              <td className="text-right text-sm text-charcoal px-6 py-3">
                <Money data={order.subtotal} />
              </td>
            </tr>
            <tr className="border-b border-charcoal/10">
              <td
                colSpan={3}
                className="text-right text-sm text-charcoal/70 px-6 py-3 hidden md:table-cell"
              >
                Tax
              </td>
              <td className="text-right text-sm text-charcoal/70 px-6 py-3 md:hidden">
                Tax
              </td>
              <td className="text-right text-sm text-charcoal px-6 py-3">
                <Money data={order.totalTax} />
              </td>
            </tr>
            <tr>
              <td
                colSpan={3}
                className="text-right text-sm font-bold text-charcoal uppercase tracking-wider px-6 py-4 hidden md:table-cell"
              >
                Total
              </td>
              <td className="text-right text-sm font-bold text-charcoal uppercase tracking-wider px-6 py-4 md:hidden">
                Total
              </td>
              <td className="text-right text-lg font-bold text-charcoal px-6 py-4">
                <Money data={order.totalPrice} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Shipping & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="border border-charcoal/10 p-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 mb-4 font-medium">
            Shipping Address
          </h3>
          {order?.shippingAddress ? (
            <address className="not-italic text-sm text-charcoal leading-relaxed space-y-1">
              <p className="font-medium">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted && (
                <p className="text-charcoal/70">
                  {order.shippingAddress.formatted}
                </p>
              )}
              {order.shippingAddress.formattedArea && (
                <p className="text-charcoal/70">
                  {order.shippingAddress.formattedArea}
                </p>
              )}
            </address>
          ) : (
            <p className="text-sm text-charcoal/50">
              No shipping address defined
            </p>
          )}
        </div>
        <div className="border border-charcoal/10 p-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 mb-4 font-medium">
            Status
          </h3>
          <p className="text-sm font-medium text-charcoal">
            {fulfillmentStatus}
          </p>
        </div>
      </div>

      {/* External status link */}
      <div className="mt-8">
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="text-xs uppercase tracking-[0.15em] text-charcoal/50 hover:text-rust transition-colors"
        >
          View Order Status &rarr;
        </a>
      </div>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <tr key={lineItem.id}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {lineItem?.image && (
            <div className="w-16 h-16 flex-shrink-0 bg-bone-dark overflow-hidden">
              <Image
                data={lineItem.image}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-charcoal">
              {lineItem.title}
            </p>
            {lineItem.variantTitle && (
              <p className="text-xs text-charcoal/50 mt-0.5">
                {lineItem.variantTitle}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="text-right text-sm text-charcoal/70 px-6 py-4 hidden md:table-cell">
        <Money data={lineItem.price} />
      </td>
      <td className="text-center text-sm text-charcoal/70 px-6 py-4 hidden md:table-cell">
        {lineItem.quantity}
      </td>
      <td className="text-right text-sm font-medium text-charcoal px-6 py-4">
        <Money data={lineItem.totalDiscount} />
      </td>
    </tr>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
