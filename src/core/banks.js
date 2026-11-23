/**
 * The 24 fictional banks of KinWallet, grouped by region.
 *
 * Colours come from the bank identity reference (docs/referencias/identidade-dos-bancos.webp):
 * `primary` is the brand colour, `secondary` the second brand colour, `surface` the light background.
 * `accent` is the button colour and `onAccent` the text on it; both are chosen so that text on buttons
 * reaches WCAG AA (4.5:1). Most banks use the primary colour with white text; light brand colours get dark text.
 * The logo of each bank is `screen/assets/banks/<id>.svg`.
 */

/** @typedef {'traditional' | 'digital'} BankType */

/**
 * @typedef {object} Region
 * @property {string} id
 * @property {string} name
 * @property {string} flag
 * @property {string[]} currencies ISO 4217 codes
 */

/**
 * @typedef {object} Bank
 * @property {string} id
 * @property {string} name
 * @property {BankType} type
 * @property {string} region Region id
 * @property {string} specialty
 * @property {{ primary: string, secondary: string, surface: string, accent: string, onAccent: string }} colors
 */

/** @type {readonly Region[]} */
export const REGIONS = Object.freeze([
  { id: 'br', name: 'Brazil', flag: '🇧🇷', currencies: ['BRL'] },
  { id: 'us', name: 'United States', flag: '🇺🇸', currencies: ['USD'] },
  { id: 'eu', name: 'Eurozone', flag: '🇪🇺', currencies: ['EUR'] },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', currencies: ['GBP'] },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', currencies: ['JPY'] },
  { id: 'in', name: 'India', flag: '🇮🇳', currencies: ['INR'] },
  { id: 'intl', name: 'International', flag: '🌐', currencies: ['USD', 'EUR', 'GBP', 'BRL', 'JPY', 'INR'] },
]);

const WHITE = '#FFFFFF';

/**
 * @param {string} id @param {string} name @param {BankType} type @param {string} region @param {string} specialty
 * @param {[string, string, string]} palette primary, secondary, surface
 * @param {{ accent?: string, onAccent?: string }} [button]
 * @returns {Bank}
 */
function bank(id, name, type, region, specialty, [primary, secondary, surface], button = {}) {
  return Object.freeze({
    id, name, type, region, specialty,
    colors: Object.freeze({ primary, secondary, surface, accent: button.accent ?? primary, onAccent: button.onAccent ?? WHITE }),
  });
}

/** @type {readonly Bank[]} */
export const BANKS = Object.freeze([
  bank('banco-imperial', 'Banco Imperial', 'traditional', 'br', 'Historic bank: rural credit and financing', ['#123C66', '#D8B55B', '#EDE6D1']),
  bank('itauba', 'Itauba', 'traditional', 'br', 'Private bank: investments and premium cards', ['#E7642D', '#F4C39A', '#FFF3E6'], { onAccent: '#2B1408' }),
  bank('violeta', 'Violeta', 'digital', 'br', 'Free account, purple card and digital credit', ['#7446C8', '#B58EF6', '#EEE6FF']),
  bank('interludio', 'Interlúdio', 'digital', 'br', 'Super app, investments and cashback', ['#EF9F36', '#3C3C46', '#FDE6C6'], { onAccent: '#3C3C46' }),

  bank('liberty-federal', 'Liberty Federal', 'traditional', 'us', 'Large commercial and investment bank', ['#143E4B', '#B98958', '#E6EDEB']),
  bank('wells-prairie', 'Wells Prairie', 'traditional', 'us', 'Mortgages, home loans and branches', ['#8A4436', '#D18C6F', '#F6E2D1']),
  bank('bank-of-everywhere', 'Bank of Everywhere', 'traditional', 'us', 'Accounts, investments and corporate services', ['#174E72', '#6ED3B8', '#E1F4EF']),
  bank('solfi', 'SolFi', 'digital', 'us', 'Personal loans, refinancing and investments', ['#E6C453', '#1B2B24', '#F7F3D6'], { onAccent: '#1B2B24' }),

  bank('santierra', 'Santierra', 'traditional', 'eu', 'Consumer credit and international operations', ['#9E3F42', '#D7908F', '#F7E3E1']),
  bank('deutmark', 'Deutmark', 'traditional', 'eu', 'Investments, exchange and corporate services', ['#132F58', '#4D78C4', '#E2EEFF']),
  bank('paribella', 'Paribella', 'traditional', 'eu', 'Wealth management and financing', ['#216A69', '#6FB3A2', '#E6F3ED']),
  bank('novia26', 'Nóvia26', 'digital', 'eu', 'Mobile banking, payments and digital accounts', ['#262733', '#A7E4C5', '#E8F9F0']),

  bank('barkleys', 'Barkleys', 'traditional', 'uk', 'Cards, credit and investment banking', ['#316E9D', '#78B3DE', '#E3F0FA']),
  bank('loydgate', 'Loydgate', 'traditional', 'uk', 'Personal accounts, savings and mortgages', ['#184B44', '#8FBF8A', '#E6F5E9']),
  bank('mintzo', 'Mintzo', 'digital', 'uk', 'Spending control, goals and budgeting', ['#EF6C73', '#4B2E2B', '#FFE5E7'], { onAccent: '#2E1A18' }),

  bank('mitsuhara', 'Mitsuhara', 'traditional', 'jp', 'Large universal bank and global services', ['#8C293D', '#D7A9A9', '#F5E8E1']),
  bank('sumisora', 'Sumisora', 'traditional', 'jp', 'Financing and business services', ['#304F8B', '#7EA6E6', '#E4EEFF']),
  bank('rakun-bank', 'Rakun Bank', 'digital', 'jp', 'Online payments, points and e-commerce', ['#A64357', '#E394A9', '#FDE6EB']),

  bank('monsoon-state', 'Monsoon State', 'traditional', 'in', 'Public bank: credit and everyday services', ['#1C7080', '#D7B06A', '#E5F4F7']),
  bank('jupitara', 'Jupitara', 'digital', 'in', 'Expense management and digital financial services', ['#6854AB', '#BBA8F4', '#EFEAFF']),
  bank('fiiesta', 'Fiiesta', 'digital', 'in', 'Financial automation and spending organization', ['#C35B29', '#F4C770', '#FFF4DB'], { accent: '#B04F22' }),

  bank('hexagon-continental', 'Hexagon Continental', 'traditional', 'intl', 'International services and wealth management', ['#243B57', '#C9A24F', '#E9E3D1']),
  bank('nomadex', 'Nomadex', 'digital', 'intl', 'Exchange, multi-currency accounts and transfers', ['#C7E953', '#2E7D32', '#EAF8D1'], { onAccent: '#1B4D20' }),
  bank('revolux', 'Revolux', 'digital', 'intl', 'Exchange, international cards and digital assets', ['#242540', '#8DB6FF', '#E6EEFF']),
]);

/** @param {string} id @returns {Bank | undefined} */
export function bankById(id) {
  return BANKS.find((b) => b.id === id);
}

/** @param {string} regionId @returns {Bank[]} */
export function banksInRegion(regionId) {
  return BANKS.filter((b) => b.region === regionId);
}
