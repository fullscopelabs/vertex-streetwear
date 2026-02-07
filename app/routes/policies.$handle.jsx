import {Link, useLoaderData} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `VERTEX | ${data?.policy.title ?? ''}`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(/-([a-z])/g, (_, m1) =>
    m1.toUpperCase(),
  );

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy} = useLoaderData();

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Back nav */}
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-charcoal/50 hover:text-charcoal transition-colors duration-200 mb-10"
          >
            <span>&larr;</span>
            <span>All Policies</span>
          </Link>

          {/* Decorative line */}
          <div className="w-12 h-px bg-rust mb-8" />

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
            {policy.title}
          </h1>

          {/* CMS content */}
          <div
            className="cms-prose mt-10"
            dangerouslySetInnerHTML={{__html: policy.body}}
          />
        </div>
      </section>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;

/**
 * @typedef {keyof Pick<
 *   Shop,
 *   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
 * >} SelectedPolicies
 */

/** @typedef {import('./+types/policies.$handle').Route} Route */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
