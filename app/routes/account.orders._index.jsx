import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef, useCallback} from 'react';
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
 * Mock customer for local preview when Customer Account API is unreachable.
 */
const MOCK_ORDERS_CUSTOMER = {
  orders: {
    nodes: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  },
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

  try {
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
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      return {customer: MOCK_ORDERS_CUSTOMER, filters};
    }
    throw error;
  }
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 mb-2">
            Order History
          </p>
          <h2 className="font-serif text-4xl font-light tracking-tight text-charcoal">
            Orders
          </h2>
        </div>
        {orders?.nodes?.length > 0 && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
            {orders.nodes.length} order{orders.nodes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <OrderSearchForm currentFilters={filters} />

      <div className="divider-sand mt-10 mb-0" />

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
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-charcoal/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-charcoal/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-charcoal/50 text-sm mb-6">
            No orders match your search criteria.
          </p>
          <Link
            to="/account/orders"
            className="text-[10px] uppercase tracking-[0.2em] text-sand hover:text-rust transition-colors duration-300"
          >
            Clear Filters &rarr;
          </Link>
        </>
      ) : (
        <>
          <p className="font-serif text-xl font-light text-charcoal/60 mb-2">
            No orders yet
          </p>
          <p className="text-charcoal/40 text-sm mb-8 max-w-xs mx-auto">
            When you place an order, it will appear here for easy tracking.
          </p>
          <Link
            to="/collections"
            className="inline-block border border-charcoal/20 text-charcoal text-[10px] uppercase tracking-[0.2em] font-medium px-8 py-3 hover:bg-charcoal hover:text-bone transition-all duration-300"
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
  const submitTimeoutRef = useRef(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      // Debounce: prevent rapid-fire submissions (DoS protection)
      if (submitTimeoutRef.current) {
        return; // Submission already queued
      }

      submitTimeoutRef.current = setTimeout(() => {
        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();

        // Sanitise: trim, cap length, strip non-alphanumeric (except # - _)
        const rawName =
          formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim() ?? '';
        const rawConfirmation =
          formData
            .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
            ?.toString()
            .trim() ?? '';

        const name = rawName.replace(/[^a-zA-Z0-9#\-_]/g, '').slice(0, 50);
        const confirmationNumber = rawConfirmation
          .replace(/[^a-zA-Z0-9#\-_]/g, '')
          .slice(0, 50);

        if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
        if (confirmationNumber)
          params.set(
            ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER,
            confirmationNumber,
          );

        setSearchParams(params);
        submitTimeoutRef.current = null;
      }, 300); // 300ms debounce
    },
    [setSearchParams],
  );

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  const inputClass =
    'w-full border-b border-charcoal/15 bg-transparent px-0 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal/40 focus:outline-none transition-colors';

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
    >
      <fieldset>
        <legend className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mb-6">
          Filter Orders
        </legend>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 md:items-end">
          <div className="flex-1">
            <label
              htmlFor="order-name"
              className="text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-1 block"
            >
              Order #
            </label>
            <input
              id="order-name"
              type="search"
              name={ORDER_FILTER_FIELDS.NAME}
              placeholder="e.g. 1001"
              aria-label="Order number"
              defaultValue={currentFilters.name || ''}
              maxLength={50}
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="order-confirm"
              className="text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-1 block"
            >
              Confirmation #
            </label>
            <input
              id="order-confirm"
              type="search"
              name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
              placeholder="e.g. ABC123"
              aria-label="Confirmation number"
              defaultValue={currentFilters.confirmationNumber || ''}
              maxLength={50}
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              type="submit"
              disabled={isSearching}
              className="cursor-pointer bg-charcoal text-bone text-[10px] uppercase tracking-[0.15em] font-medium px-7 py-3 hover:bg-rust transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {hasFilters && (
              <button
                type="button"
                disabled={isSearching}
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  formRef.current?.reset();
                }}
                className="cursor-pointer border border-charcoal/20 text-charcoal text-[10px] uppercase tracking-[0.15em] font-medium px-5 py-3 hover:border-charcoal/40 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <Link
      to={`/account/orders/${btoa(order.id)}`}
      className="group block border-b border-charcoal/8 py-6 first:pt-0 hover:bg-bone-dark/30 -mx-4 px-4 transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left side */}
        <div className="flex items-center gap-6">
          {/* Order number badge */}
          <div className="w-14 h-14 flex items-center justify-center border border-charcoal/10 group-hover:border-sand/40 transition-colors duration-300">
            <span className="text-[10px] uppercase tracking-[0.1em] text-charcoal/50 font-medium">
              #{order.number}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal group-hover:text-rust transition-colors duration-300">
              Order #{order.number}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mt-1">
              {new Date(order.processedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {order.confirmationNumber && (
              <p className="text-[10px] text-charcoal/30 mt-0.5">
                Conf: {order.confirmationNumber}
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-8 md:pl-0 pl-20">
          <div className="flex items-center gap-3">
            <StatusBadge label={order.financialStatus} />
            {fulfillmentStatus && (
              <StatusBadge label={fulfillmentStatus} />
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-charcoal">
              <Money data={order.totalPrice} />
            </span>
          </div>
          <span className="text-charcoal/20 group-hover:text-sand transition-colors duration-300 hidden md:block">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * @param {{label: string}}
 */
function StatusBadge({label}) {
  return (
    <span className="text-[9px] uppercase tracking-[0.15em] text-charcoal/45 border border-charcoal/10 px-2.5 py-1 font-medium">
      {label}
    </span>
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
