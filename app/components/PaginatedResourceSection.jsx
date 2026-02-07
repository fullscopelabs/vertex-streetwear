import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <div className="flex justify-center mb-10">
              <PreviousLink className="inline-flex items-center gap-2 border border-charcoal/15 text-charcoal/60 hover:text-charcoal hover:border-charcoal/40 px-6 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300">
                {isLoading ? (
                  <span className="animate-pulse">Loading…</span>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                    <span>Load Previous</span>
                  </>
                )}
              </PreviousLink>
            </div>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <div className="flex justify-center mt-14">
              <NextLink className="inline-flex items-center gap-2 bg-charcoal text-bone hover:bg-rust px-8 py-4 text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300">
                {isLoading ? (
                  <span className="animate-pulse">Loading…</span>
                ) : (
                  <>
                    <span>Load More</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                  </>
                )}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
