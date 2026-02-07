import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {PageHero} from '~/components/PageHero';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title={heading} subtitle="Your Account" />

      {/* Tab navigation */}
      <div className="border-b border-charcoal/10">
        <div className="max-w-4xl mx-auto px-4">
          <AccountMenu />
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Outlet context={{customer}} />
        </div>
      </section>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav role="navigation" className="flex items-center gap-8">
      {[
        {to: '/account/orders', label: 'Orders'},
        {to: '/account/profile', label: 'Profile'},
        {to: '/account/addresses', label: 'Addresses'},
      ].map(({to, label}) => (
        <NavLink
          key={to}
          to={to}
          className={({isActive}) =>
            `text-xs uppercase tracking-[0.2em] font-medium pb-4 border-b-2 transition-colors duration-200 ${
              isActive
                ? 'text-charcoal border-rust'
                : 'text-charcoal/50 border-transparent hover:text-charcoal hover:border-charcoal/30'
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
        className="text-xs uppercase tracking-[0.2em] font-medium text-charcoal/40 hover:text-rust transition-colors duration-200 pb-4"
      >
        Sign Out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
