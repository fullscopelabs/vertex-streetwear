import {useLoaderData, Link} from 'react-router';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const data = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy) => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'VERTEX | Policies'}];
};

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Decorative line */}
          <div className="w-12 h-px bg-rust mb-8" />

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
            POLICIES
          </h1>

          <p className="text-xs tracking-[0.25em] uppercase text-charcoal/40 mt-3 mb-12">
            Legal &amp; Store Information
          </p>

          <div className="divide-y divide-charcoal/10">
            {policies.map((policy) => (
              <Link
                key={policy.id}
                to={`/policies/${policy.handle}`}
                className="group flex items-center justify-between py-5 hover:pl-2 transition-all duration-200"
              >
                <span className="text-sm font-medium text-charcoal group-hover:text-rust transition-colors duration-200">
                  {policy.title}
                </span>
                <span className="text-charcoal/30 group-hover:text-rust transition-colors duration-200">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('./+types/policies._index').Route} Route */
/** @typedef {import('storefrontapi.generated').PoliciesQuery} PoliciesQuery */
/** @typedef {import('storefrontapi.generated').PolicyItemFragment} PolicyItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
