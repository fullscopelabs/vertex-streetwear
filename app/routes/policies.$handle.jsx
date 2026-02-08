import {Link, useLoaderData} from 'react-router';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/** Static fallback content for policies that aren't configured in Shopify CMS */
const FALLBACK_POLICIES = {
  'terms-of-service': {
    title: 'Terms of Service',
    body: `
      <h2>Overview</h2>
      <p>This website is operated by <span style="letter-spacing:0.2em">V<span style="font-size:0.85em;vertical-align:baseline">☰</span>RTEX</span>. Throughout the site, the terms "we", "us" and "our" refer to <span style="letter-spacing:0.2em">V<span style="font-size:0.85em;vertical-align:baseline">☰</span>RTEX</span>. We offer this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
      <p>By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions.</p>

      <h2>Online Store Terms</h2>
      <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority and have given us your consent to allow any of your minor dependents to use this site.</p>
      <p>You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>

      <h2>General Conditions</h2>
      <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information) may be transferred unencrypted and involve transmissions over various networks.</p>
      <p>You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.</p>

      <h2>Accuracy of Information</h2>
      <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions.</p>

      <h2>Modifications to the Service</h2>
      <p>We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>

      <h2>Products or Services</h2>
      <p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.</p>
      <p>We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>

      <h2>Contact Information</h2>
      <p>Questions about the Terms of Service should be sent to us at <a href="mailto:support@vertexstreetwear.com">support@vertexstreetwear.com</a>.</p>
    `,
  },
  'refund-policy': {
    title: 'Refund Policy',
    body: `
      <h2>Returns</h2>
      <p>We want you to love your <span style="letter-spacing:0.2em">V<span style="font-size:0.85em;vertical-align:baseline">☰</span>RTEX</span> purchase. If for any reason you're not completely satisfied, we accept returns within 30 days of delivery for a full refund to your original payment method.</p>

      <h2>Eligibility</h2>
      <p>To be eligible for a return, your item must be:</p>
      <ul>
        <li>Unworn, unwashed, and in the same condition you received it</li>
        <li>In its original packaging with all tags attached</li>
        <li>Returned within 30 days of delivery</li>
      </ul>
      <p>Items marked as "Final Sale" at the time of purchase cannot be returned or exchanged.</p>

      <h2>Non-Returnable Items</h2>
      <p>For hygiene and safety reasons, the following items are final sale:</p>
      <ul>
        <li>Intimates and swimwear</li>
        <li>Face coverings and masks</li>
        <li>Earrings and pierced jewelry</li>
        <li>Gift cards</li>
        <li>Items purchased during clearance or marked "Final Sale"</li>
      </ul>

      <h2>How to Initiate a Return</h2>
      <p>To start a return, please contact our customer support team at <a href="mailto:support@vertexstreetwear.com">support@vertexstreetwear.com</a> with your order number and reason for return. We'll provide you with a prepaid return shipping label and instructions.</p>

      <h2>Refund Processing</h2>
      <p>Once we receive and inspect your return, we'll process your refund within 5–7 business days. The refund will be credited to your original payment method. Please note that your bank or credit card company may take additional time to post the refund to your account.</p>

      <h2>Exchanges</h2>
      <p>Need a different size or color? We're happy to exchange your item. Exchanges are free for domestic orders. Contact us and we'll arrange the swap — we'll even cover the return shipping.</p>

      <h2>Damaged or Defective Items</h2>
      <p>If you receive a damaged or defective item, please contact us immediately at <a href="mailto:support@vertexstreetwear.com">support@vertexstreetwear.com</a>. Include photos of the damage and we'll arrange a replacement or full refund at no extra cost.</p>

      <h2>Late or Missing Refunds</h2>
      <p>If you haven't received your refund after 7 business days, please check your bank account again, then contact your credit card company. If you've done all of this and still haven't received your refund, please contact us.</p>
    `,
  },
};

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

  // Only query Shopify for known policy types
  const knownPolicies = ['privacyPolicy', 'shippingPolicy', 'termsOfService', 'refundPolicy'];

  if (knownPolicies.includes(policyName)) {
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

    if (policy) {
      return {policy};
    }
  }

  // If no CMS policy found, check for static fallback content
  const fallback = FALLBACK_POLICIES[params.handle];
  if (fallback) {
    return {policy: fallback};
  }

  throw new Response('Could not find the policy', {status: 404});
}

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy} = useLoaderData();

  return (
    <div className="min-h-screen page-fade-in texture-canvas">
      {/* Dark header band */}
      <section className="relative bg-gradient-to-br from-charcoal via-tobacco to-forest overflow-hidden grain dark-accent-border">
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-14 md:py-20">
          <ScrollReveal>
            <Link
              to="/policies"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-sand/40 hover:text-sand/70 transition-colors duration-300 mb-8"
            >
              <span>&larr;</span>
              <span>All Policies</span>
            </Link>
            <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone">
              {policy.title}
            </h1>
            <div className="divider-lux mt-6" />
          </ScrollReveal>
        </div>
      </section>

      {/* CMS content */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div
              className="cms-prose"
              dangerouslySetInnerHTML={{__html: policy.body}}
            />
          </ScrollReveal>
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
