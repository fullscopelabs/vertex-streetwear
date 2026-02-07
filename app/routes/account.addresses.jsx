import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {
  getFormString,
  validateAddress,
  normalizePhone,
} from '~/lib/validation';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Addresses'}];
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

// ─────────────────────── Shared extraction helper ───────────────────────

/**
 * Extract, sanitise, and validate address fields from FormData.
 * Returns { address, errors } — if errors.length > 0, reject the mutation.
 * @param {FormData} form
 */
function extractAndValidateAddress(form) {
  const address = {
    firstName: getFormString(form, 'firstName', 50),
    lastName: getFormString(form, 'lastName', 50),
    company: getFormString(form, 'company', 100),
    address1: getFormString(form, 'address1', 200),
    address2: getFormString(form, 'address2', 200),
    city: getFormString(form, 'city', 100),
    zoneCode: getFormString(form, 'zoneCode', 10),
    zip: getFormString(form, 'zip', 12),
    territoryCode: getFormString(form, 'territoryCode', 2).toUpperCase(),
    phoneNumber: getFormString(form, 'phoneNumber', 20),
  };

  // Normalise phone to E.164 if provided
  if (address.phoneNumber) {
    address.phoneNumber = normalizePhone(address.phoneNumber);
  }

  const errors = validateAddress(address);
  return {address, errors};
}

// ────────────────────────────── Action ──────────────────────────────────

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    // ── Size limit check (prevent memory exhaustion) ──
    let fieldCount = 0;
    for (const _ of form.entries()) {
      fieldCount++;
      if (fieldCount > 15) {
        // Address forms have more fields than profile
        return data(
          {error: 'Too many form fields.'},
          {status: 400},
        );
      }
    }

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // Ensure user is logged in before any mutation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {status: 401},
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;

    switch (request.method) {
      case 'POST':
      case 'PUT': {
        // ── Extract & validate ──
        const {address, errors: validationErrors} =
          extractAndValidateAddress(form);

        if (validationErrors.length > 0) {
          // Return first error message associated with the address form
          return data(
            {error: {[addressId]: validationErrors[0].message}},
            {status: 400},
          );
        }

        const isCreate = request.method === 'POST';

        try {
          const mutation = isCreate
            ? CREATE_ADDRESS_MUTATION
            : UPDATE_ADDRESS_MUTATION;

          const variables = isCreate
            ? {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              }
            : {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              };

          const {data: mutationData, errors} =
            await customerAccount.mutate(mutation, {variables});

          if (errors?.length) {
            // Log detailed error server-side, return generic message
            console.error('[account.addresses] GraphQL error:', errors[0]);
            throw new Error(
              `Unable to ${isCreate ? 'create' : 'update'} address. Please try again.`,
            );
          }

          const result = isCreate
            ? mutationData?.customerAddressCreate
            : mutationData?.customerAddressUpdate;

          if (result?.userErrors?.length) {
            // Shopify userErrors are safe to show (validation messages)
            throw new Error(result.userErrors[0].message);
          }

          if (!result?.customerAddress) {
            throw new Error(
              `Customer address ${isCreate ? 'create' : 'update'} failed.`,
            );
          }

          return isCreate
            ? {
                error: null,
                createdAddress: result.customerAddress,
                defaultAddress,
              }
            : {
                error: null,
                updatedAddress: address,
                defaultAddress,
              };
        } catch (error) {
          console.error(
            `[account.addresses] ${isCreate ? 'CREATE' : 'UPDATE'} error:`,
            error,
          );
          const userMessage =
            process.env.NODE_ENV === 'production' && error instanceof Error
              ? `Unable to ${isCreate ? 'create' : 'update'} address. Please try again or contact support.`
              : error instanceof Error
                ? error.message
                : String(error);

          return data(
            {error: {[addressId]: userMessage}},
            {status: 400},
          );
        }
      }

      case 'DELETE': {
        try {
          const {data: mutationData, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            console.error('[account.addresses] DELETE GraphQL error:', errors[0]);
            throw new Error('Unable to delete address. Please try again.');
          }

          if (mutationData?.customerAddressDelete?.userErrors?.length) {
            throw new Error(
              mutationData.customerAddressDelete.userErrors[0].message,
            );
          }

          if (!mutationData?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error) {
          console.error('[account.addresses] DELETE error:', error);
          const userMessage =
            process.env.NODE_ENV === 'production' && error instanceof Error
              ? 'Unable to delete address. Please try again or contact support.'
              : error instanceof Error
                ? error.message
                : String(error);
          
          return data(
            {error: {[addressId]: userMessage}},
            {status: 400},
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {status: 405},
        );
      }
    }
  } catch (error) {
    console.error('[account.addresses] Unhandled error:', error);
    const userMessage =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again or contact support.'
        : error instanceof Error
          ? error.message
          : String(error);
    
    return data({error: userMessage}, {status: 400});
  }
}

// ─────────────────────────── Components ─────────────────────────────────

export default function Addresses() {
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;

  return (
    <div>
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 mb-2">
          Shipping Details
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-charcoal">
          Addresses
        </h2>
      </div>

      {!addresses.nodes.length ? (
        <div>
          <p className="text-charcoal/40 text-sm mb-8">
            You have no addresses saved yet.
          </p>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mb-6">
              Add New Address
            </p>
            <NewAddressForm />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mb-6">
              Add New Address
            </p>
            <div className="bg-bone-dark/30 p-8">
              <NewAddressForm />
            </div>
          </div>
          <div>
            <div className="divider-sand mb-10" />
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="mt-8">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            className="bg-charcoal text-bone text-[10px] uppercase tracking-[0.15em] font-medium px-10 py-3.5 hover:bg-rust transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating...' : 'Add Address'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

/**
 * @param {Pick<CustomerFragment, 'addresses' | 'defaultAddress'>}
 */
function ExistingAddresses({addresses, defaultAddress}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mb-8">
        Saved Addresses
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.nodes.map((address) => (
          <div
            key={address.id}
            className="bg-bone-dark/30 p-8 relative group"
          >
            {defaultAddress?.id === address.id && (
              <span className="absolute top-4 right-4 text-[8px] uppercase tracking-[0.2em] text-sand font-medium border border-sand/30 px-2 py-0.5">
                Default
              </span>
            )}
            <AddressForm
              addressId={address.id}
              address={address}
              defaultAddress={defaultAddress}
            >
              {({stateForMethod}) => (
                <div className="flex gap-3 mt-8">
                  <button
                    disabled={stateForMethod('PUT') !== 'idle'}
                    formMethod="PUT"
                    type="submit"
                    className="bg-charcoal text-bone text-[10px] uppercase tracking-[0.15em] font-medium px-6 py-3 hover:bg-rust transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stateForMethod('PUT') !== 'idle' ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    disabled={stateForMethod('DELETE') !== 'idle'}
                    formMethod="DELETE"
                    type="submit"
                    className="border border-charcoal/15 text-charcoal/50 text-[10px] uppercase tracking-[0.15em] font-medium px-6 py-3 hover:border-rust hover:text-rust transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stateForMethod('DELETE') !== 'idle'
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              )}
            </AddressForm>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── Address Form ───────────────────────────────

/**
 * Shared CSS classes for address form inputs.
 */
const inputClass =
  'w-full border-b border-charcoal/12 bg-transparent px-0 py-3 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-charcoal/40 focus:outline-none transition-colors invalid:border-rust/40';
const labelClass =
  'text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-1 block';

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({addressId, address, defaultAddress, children}) {
  const {state, formMethod} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId} noValidate>
      <fieldset className="space-y-5">
        <input type="hidden" name="addressId" defaultValue={addressId} />

        {/* Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={`firstName-${addressId}`} className={labelClass}>
              First name*
            </label>
            <input
              aria-label="First name"
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              id={`firstName-${addressId}`}
              name="firstName"
              placeholder="First name"
              required
              type="text"
              minLength={1}
              maxLength={50}
              pattern="[A-Za-zÀ-ÿ\s\-'.]{1,50}"
              title="Letters, spaces, hyphens, apostrophes, and periods only"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`lastName-${addressId}`} className={labelClass}>
              Last name*
            </label>
            <input
              aria-label="Last name"
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              id={`lastName-${addressId}`}
              name="lastName"
              placeholder="Last name"
              required
              type="text"
              minLength={1}
              maxLength={50}
              pattern="[A-Za-zÀ-ÿ\s\-'.]{1,50}"
              title="Letters, spaces, hyphens, apostrophes, and periods only"
              className={inputClass}
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label htmlFor={`company-${addressId}`} className={labelClass}>
            Company
          </label>
          <input
            aria-label="Company"
            autoComplete="organization"
            defaultValue={address?.company ?? ''}
            id={`company-${addressId}`}
            name="company"
            placeholder="Company"
            type="text"
            maxLength={100}
            className={inputClass}
          />
        </div>

        {/* Address lines */}
        <div>
          <label htmlFor={`address1-${addressId}`} className={labelClass}>
            Address line 1*
          </label>
          <input
            aria-label="Address line 1"
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''}
            id={`address1-${addressId}`}
            name="address1"
            placeholder="Street address, P.O. box, etc."
            required
            type="text"
            minLength={1}
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`address2-${addressId}`} className={labelClass}>
            Address line 2
          </label>
          <input
            aria-label="Address line 2"
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''}
            id={`address2-${addressId}`}
            name="address2"
            placeholder="Apartment, suite, unit, etc."
            type="text"
            maxLength={200}
            className={inputClass}
          />
        </div>

        {/* City / State row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={`city-${addressId}`} className={labelClass}>
              City*
            </label>
            <input
              aria-label="City"
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              id={`city-${addressId}`}
              name="city"
              placeholder="City"
              required
              type="text"
              minLength={1}
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`zoneCode-${addressId}`} className={labelClass}>
              State / Province*
            </label>
            <input
              aria-label="State/Province"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              id={`zoneCode-${addressId}`}
              name="zoneCode"
              placeholder="e.g. CA, ON, NSW"
              required
              type="text"
              minLength={1}
              maxLength={10}
              title="State or province code (e.g. CA, NY, ON)"
              className={inputClass}
            />
          </div>
        </div>

        {/* Zip / Country row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={`zip-${addressId}`} className={labelClass}>
              Zip / Postal Code*
            </label>
            <input
              aria-label="Zip"
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              id={`zip-${addressId}`}
              name="zip"
              placeholder="e.g. 90210, K1A 0B1"
              required
              type="text"
              minLength={2}
              maxLength={12}
              title="Zip or postal code (2–12 characters)"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor={`territoryCode-${addressId}`}
              className={labelClass}
            >
              Country Code*
            </label>
            <input
              aria-label="Country code"
              autoComplete="country"
              defaultValue={address?.territoryCode ?? ''}
              id={`territoryCode-${addressId}`}
              name="territoryCode"
              placeholder="e.g. US, CA, GB"
              required
              type="text"
              minLength={2}
              maxLength={2}
              pattern="[A-Za-z]{2}"
              title="2-letter country code (e.g. US, CA, GB)"
              style={{textTransform: 'uppercase'}}
              className={inputClass}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor={`phoneNumber-${addressId}`} className={labelClass}>
            Phone
          </label>
          <input
            aria-label="Phone Number"
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            id={`phoneNumber-${addressId}`}
            name="phoneNumber"
            placeholder="+1 (555) 123-4567"
            type="tel"
            maxLength={20}
            title="Phone number with country code (e.g. +1 555 123 4567)"
            className={inputClass}
          />
        </div>

        {/* Default address checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <input
            defaultChecked={isDefaultAddress}
            id={`defaultAddress-${addressId}`}
            name="defaultAddress"
            type="checkbox"
            className="w-4 h-4 accent-sand"
          />
          <label
            htmlFor={`defaultAddress-${addressId}`}
            className="text-sm text-charcoal/50"
          >
            Set as default address
          </label>
        </div>

        {error && (
          <p className="text-rust text-sm" role="alert">
            {error}
          </p>
        )}

        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}

/**
 * @typedef {{
 *   addressId?: string | null;
 *   createdAddress?: AddressFragment;
 *   defaultAddress?: string | null;
 *   deletedAddress?: string | null;
 *   error: Record<AddressFragment['id'], string> | null;
 *   updatedAddress?: AddressFragment;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('./+types/account.addresses').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
