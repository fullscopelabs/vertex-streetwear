import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div>
      <h2 className="font-serif text-3xl font-light tracking-tight text-charcoal mb-8">
        Orders
      </h2>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

/**
 * @param {{
 *   orders: CustomerOrdersFragment['orders'];
 *   filters: OrderFilterParams;
 * }}
 */
function OrdersTable({orders, filters}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="mt-8" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  return (
    <div className="text-center py-12">
      {hasFilters ? (
        <>
          <p className="text-charcoal/50 text-sm mb-4">
            No orders found matching your search.
          </p>
          <Link
            to="/account/orders"
            className="text-rust text-sm uppercase tracking-wider hover:text-charcoal transition-colors"
          >
            Clear filters &rarr;
          </Link>
        </>
      ) : (
        <>
          <p className="text-charcoal/50 text-sm mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            to="/collections"
            className="btn-secondary inline-block"
          >
            Start Shopping
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   currentFilters: OrderFilterParams;
 * }}
 */
function OrderSearchForm({currentFilters}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  const inputClass =
    'w-full border border-charcoal/20 bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal/40 focus:outline-none transition-colors';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
    >
      <fieldset>
        <legend className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 mb-4">
          Filter Orders
        </legend>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className={inputClass}
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className={inputClass}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching' : 'Search'}
            </button>
            {hasFilters && (
              <button
                type="button"
                disabled={isSearching}
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  formRef.current?.reset();
                }}
                className="btn-secondary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <div className="border border-charcoal/10 p-6 mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="text-lg font-medium text-charcoal hover:text-rust transition-colors"
          >
            Order #{order.number}
          </Link>
          <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40">
            {new Date(order.processedAt).toDateString()}
          </p>
          {order.confirmationNumber && (
            <p className="text-xs text-charcoal/50">
              Confirmation: {order.confirmationNumber}
            </p>
          )}
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <span className="text-lg font-medium text-charcoal">
            <Money data={order.totalPrice} />
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50">
              {order.financialStatus}
            </span>
            {fulfillmentStatus && (
              <>
                <span className="text-charcoal/20">&middot;</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50">
                  {fulfillmentStatus}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-charcoal/10">
        <Link
          to={`/account/orders/${btoa(order.id)}`}
          className="text-xs uppercase tracking-[0.15em] text-charcoal/50 hover:text-rust transition-colors"
        >
          View Order &rarr;
        </Link>
      </div>
    </div>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
