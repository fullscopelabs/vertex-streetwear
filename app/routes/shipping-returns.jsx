import {Link} from 'react-router';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'V☰RTEX | Shipping & Returns'}];
};

export default function ShippingReturns() {
  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title="Shipping & Returns" subtitle="Everything You Need to Know" />

      {/* Quick summary cards */}
      <section className="border-b border-charcoal/10">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
              <div className="bg-white border border-charcoal/8 p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
                  <svg className="w-7 h-7 text-charcoal/70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.375m-7.5-10.5H6.75a2.625 2.625 0 0 0-2.625 2.625v7.875a1.875 1.875 0 0 0 1.875 1.875h.375m8.25-14.25h3.375c.621 0 1.125.504 1.125 1.125v3.5m-4.5-4.625-.375-1.125a1.125 1.125 0 0 0-1.065-.775H8.108a1.125 1.125 0 0 0-1.066.775l-.375 1.125m8.208 0H6.667" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-light tracking-tight text-charcoal mb-2">
                  Free Shipping
                </h3>
                <p className="text-sm text-charcoal/50 leading-relaxed">
                  Complimentary shipping on all orders over $200. Standard delivery on all others.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="bg-white border border-charcoal/8 p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
                  <svg className="w-7 h-7 text-charcoal/70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-light tracking-tight text-charcoal mb-2">
                  30-Day Returns
                </h3>
                <p className="text-sm text-charcoal/50 leading-relaxed">
                  Not the right fit? Return unworn items within 30 days for a full refund.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-white border border-charcoal/8 p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
                  <svg className="w-7 h-7 text-charcoal/70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-light tracking-tight text-charcoal mb-2">
                  Secure Checkout
                </h3>
                <p className="text-sm text-charcoal/50 leading-relaxed">
                  Your payment is encrypted and processed securely. We never store card details.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Shipping details */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="mb-16">
              <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-3">
                Delivery
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal mb-8">
                Shipping Information
              </h2>
              <div className="w-10 h-px bg-rust mb-8" />

              <div className="space-y-6 text-sm leading-relaxed text-charcoal-light">
                <div className="border-b border-charcoal/8 pb-6">
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    Domestic Shipping (United States)
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-dashed border-charcoal/8">
                      <span>Standard Shipping</span>
                      <span className="text-charcoal font-medium">5–7 business days</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed border-charcoal/8">
                      <span>Express Shipping</span>
                      <span className="text-charcoal font-medium">2–3 business days</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Overnight Shipping</span>
                      <span className="text-charcoal font-medium">Next business day</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-charcoal/8 pb-6">
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    International Shipping
                  </h3>
                  <p>
                    We ship worldwide. International orders typically arrive within 7–14 business
                    days depending on the destination. Customs duties and taxes may apply and are
                    the responsibility of the recipient.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    Free Shipping
                  </h3>
                  <p>
                    Orders over $200 qualify for complimentary standard shipping within the
                    United States. This offer is automatically applied at checkout — no
                    promo code needed.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mb-16">
              <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-3">
                Exchanges
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal mb-8">
                Returns & Exchanges
              </h2>
              <div className="w-10 h-px bg-rust mb-8" />

              <div className="space-y-6 text-sm leading-relaxed text-charcoal-light">
                <div className="border-b border-charcoal/8 pb-6">
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    Return Policy
                  </h3>
                  <p>
                    We accept returns within 30 days of delivery. Items must be unworn, unwashed,
                    and in their original packaging with all tags attached. To initiate a return,
                    please contact our support team with your order number.
                  </p>
                </div>

                <div className="border-b border-charcoal/8 pb-6">
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    Exchange Process
                  </h3>
                  <p>
                    Need a different size or color? We&apos;re happy to exchange your item.
                    Exchanges are free for domestic orders. Simply reach out to us and we&apos;ll
                    arrange the swap — we&apos;ll even cover the return shipping.
                  </p>
                </div>

                <div className="border-b border-charcoal/8 pb-6">
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    Refund Timeline
                  </h3>
                  <p>
                    Once we receive and inspect your return, refunds are processed within 5–7
                    business days. The refund will be credited to your original payment method.
                    You&apos;ll receive an email confirmation when the refund has been issued.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-charcoal uppercase tracking-wider text-xs mb-3">
                    Non-Returnable Items
                  </h3>
                  <p>
                    For hygiene and safety reasons, the following items are final sale and cannot
                    be returned: intimates, swimwear, face coverings, earrings, and any items
                    marked as &quot;Final Sale&quot; at the time of purchase.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-3">
                Support
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal mb-8">
                Need Help?
              </h2>
              <div className="w-10 h-px bg-rust mb-8" />

              <div className="text-sm leading-relaxed text-charcoal-light">
                <p className="mb-4">
                  Our customer support team is here to help with any questions about shipping,
                  returns, or your order. We aim to respond to all inquiries within 24 hours.
                </p>
                <p className="mb-6">
                  Reach out via email at{' '}
                  <a
                    href="mailto:support@vertexstreetwear.com"
                    className="text-rust underline hover:text-charcoal transition-colors duration-200"
                  >
                    support@vertexstreetwear.com
                  </a>
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-charcoal/10 bg-bone-dark">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-4">
              Continue Exploring
            </p>
            <Link to="/collections/all" className="btn-secondary inline-block">
              Shop the Collection
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/shipping-returns').Route} Route */
