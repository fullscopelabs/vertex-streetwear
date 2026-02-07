import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {PageHero} from '~/components/PageHero';

/**
 * Mock customer data for local styling preview when the Customer Account API
 * is unreachable (e.g. localhost without HTTPS).
 */
const MOCK_CUSTOMER = {
  firstName: 'Preview',
  lastName: 'User',
  emailAddress: {emailAddress: 'preview@vertex.dev'},
  phoneNumber: null,
  defaultAddress: null,
  addresses: {nodes: []},
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

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;

  try {
    const {data, errors} = await customerAccount.query(
      CUSTOMER_DETAILS_QUERY,
      {
        variables: {
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length || !data?.customer) {
      throw new Error('Customer not found');
    }

    return remixData(
      {customer: data.customer, isPreview: false},
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    // If we're in development and the API fails, return mock data so we can
    // still preview/style the account pages locally over plain HTTP.
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[account] Customer Account API unavailable — serving preview data for styling.',
      );
      return remixData(
        {customer: MOCK_CUSTOMER, isPreview: true},
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        },
      );
    }
    throw error;
  }
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer, isPreview} = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title={heading} subtitle="Your Account" />

      {/* Preview banner */}
      {isPreview && (
        <div className="bg-rust/90 text-bone text-center py-2 text-[10px] uppercase tracking-[0.2em]">
          Preview Mode — Displaying mock data for styling purposes
        </div>
      )}

      {/* Tab navigation — dark bar flush with hero */}
      <div className="bg-gradient-to-b from-charcoal to-charcoal/95 border-b border-sand/10">
        <div className="max-w-5xl mx-auto px-6">
          <AccountMenu />
        </div>
      </div>

      {/* Content */}
      <section className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <Outlet context={{customer}} />
        </div>
      </section>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav role="navigation" className="flex items-center gap-0">
      {[
        {to: '/account/orders', label: 'Orders'},
        {to: '/account/profile', label: 'Profile'},
        {to: '/account/addresses', label: 'Addresses'},
      ].map(({to, label}) => (
        <NavLink
          key={to}
          to={to}
          className={({isActive}) =>
            `text-[10px] uppercase tracking-[0.25em] font-medium px-6 py-4 border-b-2 transition-colors duration-300 ${
              isActive
                ? 'text-sand border-sand'
                : 'text-bone/40 border-transparent hover:text-bone/70 hover:border-bone/20'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form
      className="ml-auto"
      method="POST"
      action="/account/logout"
    >
      <button
        type="submit"
        className="cursor-pointer text-[10px] uppercase tracking-[0.25em] font-medium text-bone/30 hover:text-rust transition-colors duration-300 py-4"
      >
        Sign Out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
