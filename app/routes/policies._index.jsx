import {useLoaderData, Link} from 'react-router';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

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
  return [{title: 'V☰RTEX | Policies'}];
};

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title="Policies" subtitle="Legal & Store Information" />

      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-charcoal/10">
            {policies.map((policy, index) => (
              <ScrollReveal key={policy.id} delay={index * 75}>
                <Link
                  to={`/policies/${policy.handle}`}
                  className="group flex items-center justify-between py-5 hover:pl-2 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-charcoal group-hover:text-rust transition-colors duration-200">
                    {policy.title}
                  </span>
                  <span className="text-charcoal/20 group-hover:text-rust group-hover:translate-x-1 transition-all duration-300">
                    &rarr;
                  </span>
                </Link>
              </ScrollReveal>
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
