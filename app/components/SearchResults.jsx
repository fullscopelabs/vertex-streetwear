import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams} from '~/lib/search';

/**
 * @param {Omit<SearchResultsProps, 'error' | 'type'>}
 */
export function SearchResults({term, result, children}) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

/**
 * @param {PartialSearchResult<'articles'>}
 */
function SearchResultsArticles({term, articles}) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-charcoal mb-6">
        Articles
      </h2>
      <div className="space-y-3">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div key={article.id}>
              <Link
                prefetch="intent"
                to={articleUrl}
                className="group flex items-center justify-between py-3 border-b border-charcoal/10 hover:border-charcoal/30 transition-colors duration-200"
              >
                <span className="text-sm text-charcoal group-hover:text-rust transition-colors duration-200">
                  {article.title}
                </span>
                <span className="text-charcoal/30 group-hover:text-rust transition-colors duration-200">
                  &rarr;
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @param {PartialSearchResult<'pages'>}
 */
function SearchResultsPages({term, pages}) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-charcoal mb-6">
        Pages
      </h2>
      <div className="space-y-3">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div key={page.id}>
              <Link
                prefetch="intent"
                to={pageUrl}
                className="group flex items-center justify-between py-3 border-b border-charcoal/10 hover:border-charcoal/30 transition-colors duration-200"
              >
                <span className="text-sm text-charcoal group-hover:text-rust transition-colors duration-200">
                  {page.title}
                </span>
                <span className="text-charcoal/30 group-hover:text-rust transition-colors duration-200">
                  &rarr;
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @param {PartialSearchResult<'products'>}
 */
function SearchResultsProducts({term, products}) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-charcoal mb-8">
        Products
      </h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          return (
            <div>
              <div className="text-center mb-8">
                <PreviousLink>
                  {isLoading ? (
                    <span className="text-xs text-charcoal/40">Loading...</span>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.15em] text-charcoal/60 hover:text-charcoal transition-colors duration-200">
                      &uarr; Load previous
                    </span>
                  )}
                </PreviousLink>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {nodes.map((product) => {
                  const productUrl = urlWithTrackingParams({
                    baseUrl: `/products/${product.handle}`,
                    trackingParams: product.trackingParameters,
                    term,
                  });

                  const price =
                    product?.selectedOrFirstAvailableVariant?.price;
                  const image =
                    product?.selectedOrFirstAvailableVariant?.image;

                  return (
                    <Link
                      prefetch="intent"
                      to={productUrl}
                      key={product.id}
                      className="group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-bone-dark mb-3">
                        {image && (
                          <Image
                            data={image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(min-width: 768px) 25vw, 50vw"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-rust scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      </div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-charcoal">
                        {product.title}
                      </h3>
                      <p className="text-charcoal-light text-sm mt-1 tracking-wide">
                        {price && <Money data={price} />}
                      </p>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <NextLink>
                  {isLoading ? (
                    <span className="text-xs text-charcoal/40">Loading...</span>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.15em] text-charcoal/60 hover:text-charcoal transition-colors duration-200">
                      Load more &darr;
                    </span>
                  )}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div className="text-center py-20">
      <p className="text-charcoal/40 text-sm tracking-wide">
        No results found. Try a different search term.
      </p>
      <Link
        to="/collections/all"
        className="inline-block mt-6 text-xs uppercase tracking-[0.15em] text-charcoal border-b border-charcoal/30 pb-1 hover:border-charcoal hover:text-rust transition-colors duration-200"
      >
        Browse All Products
      </Link>
    </div>
  );
}

/** @typedef {RegularSearchReturn['result']['items']} SearchItems */
/**
 * @typedef {Pick<
 *   SearchItems,
 *   ItemType
 * > &
 *   Pick<RegularSearchReturn, 'term'>} PartialSearchResult
 * @template {keyof SearchItems} ItemType
 */
/**
 * @typedef {RegularSearchReturn & {
 *   children: (args: SearchItems & {term: string}) => React.ReactNode;
 * }} SearchResultsProps
 */

/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
