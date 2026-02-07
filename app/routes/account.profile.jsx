import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {
  getFormString,
  validateName,
  firstError,
} from '~/lib/validation';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profile'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  try {
    await context.customerAccount.handleAuthStatus();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      return {};
    }
    throw error;
  }

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed', success: false}, {status: 405});
  }

  try {
    const form = await request.formData();

    // ── Size limit check (prevent memory exhaustion) ──
    let fieldCount = 0;
    for (const _ of form.entries()) {
      fieldCount++;
      if (fieldCount > 10) {
        return data(
          {error: 'Too many form fields.', success: false, customer: null},
          {status: 400},
        );
      }
    }

    // ── Sanitise ──
    const firstName = getFormString(form, 'firstName', 50);
    const lastName = getFormString(form, 'lastName', 50);

    // ── Validate ──
    const validationError = firstError([
      validateName(firstName, 'First name'),
      validateName(lastName, 'Last name'),
    ]);

    if (validationError) {
      return data(
        {error: validationError.message, success: false, customer: null},
        {status: 400},
      );
    }

    // ── Mutate ──
    const customer = {firstName, lastName};
    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      // Log detailed error server-side, return generic message to client
      console.error('[account.profile] GraphQL error:', errors[0]);
      throw new Error('Unable to update profile. Please try again.');
    }

    if (!mutationData?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      success: true,
      customer: mutationData?.customerUpdate?.customer,
    };
  } catch (error) {
    // Log full error details server-side
    console.error('[account.profile] Action error:', error);
    
    // Return user-friendly message to client (avoid leaking internal details)
    const userMessage =
      process.env.NODE_ENV === 'production'
        ? 'Unable to update profile. Please try again or contact support.'
        : error.message;
    
    return data(
      {error: userMessage, success: false, customer: null},
      {status: 400},
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const {state} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const customer = action?.customer ?? account?.customer;

  const email = customer?.emailAddress?.emailAddress;
  const phone = customer?.phoneNumber?.phoneNumber;

  return (
    <div className="max-w-xl">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 mb-2">
          Account Settings
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-charcoal">
          My Profile
        </h2>
      </div>

      {/* ── Account info (read-only, from Shopify auth) ── */}
      <div className="mb-10 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40">
          Account
        </p>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-1">
            Email
          </p>
          <p className="text-sm text-charcoal">
            {email || '—'}
          </p>
        </div>

        {phone && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-1">
              Phone
            </p>
            <p className="text-sm text-charcoal">{phone}</p>
          </div>
        )}

        <p className="text-[10px] text-charcoal/30 leading-relaxed">
          Email and phone are managed through your{' '}
          <a
            href="https://shopify.com/98899820913/account/profile"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-charcoal/50 transition-colors"
          >
            Shopify account settings
          </a>.
        </p>
      </div>

      <div className="divider-sand mb-10" />

      {/* ── Editable profile fields ── */}
      <Form method="PUT" className="space-y-8" noValidate>
        <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40">
          Personal Information
        </p>

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-2 block"
            >
              First name*
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              defaultValue={customer?.firstName ?? ''}
              required
              minLength={1}
              maxLength={50}
              pattern="[A-Za-zÀ-ÿ\s\-'.]{1,50}"
              title="Letters, spaces, hyphens, apostrophes, and periods only"
              className="w-full border-b border-charcoal/15 bg-transparent px-0 py-3 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-charcoal/40 focus:outline-none transition-colors invalid:border-rust/40"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-2 block"
            >
              Last name*
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={customer?.lastName ?? ''}
              required
              minLength={1}
              maxLength={50}
              pattern="[A-Za-zÀ-ÿ\s\-'.]{1,50}"
              title="Letters, spaces, hyphens, apostrophes, and periods only"
              className="w-full border-b border-charcoal/15 bg-transparent px-0 py-3 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-charcoal/40 focus:outline-none transition-colors invalid:border-rust/40"
            />
          </div>
        </fieldset>

        {/* Success / error feedback */}
        {action?.success && (
          <p className="text-sm text-charcoal/60" role="status">
            Profile updated successfully.
          </p>
        )}
        {action?.error && (
          <p className="text-rust text-sm" role="alert">
            {action.error}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={state !== 'idle'}
            className="bg-charcoal text-bone text-[10px] uppercase tracking-[0.15em] font-medium px-10 py-3.5 hover:bg-rust transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state !== 'idle' ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </Form>
    </div>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   success: boolean;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('./+types/account.profile').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
